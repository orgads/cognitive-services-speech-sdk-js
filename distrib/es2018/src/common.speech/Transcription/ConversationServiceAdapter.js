// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { ConnectionState, createNoDashGuid, Deferred, MessageType, } from "../../common/Exports";
import { CancellationErrorCode, CancellationReason, ConversationExpirationEventArgs, ConversationTranslationCanceledEventArgs, ConversationTranslationResult, Translations } from "../../sdk/Exports";
import { ServiceRecognizerBase } from "../Exports";
import { ConversationConnectionMessage } from "./ConversationConnectionMessage";
import { ConversationRequestSession } from "./ConversationRequestSession";
import { ConversationReceivedTranslationEventArgs, LockRoomEventArgs, MuteAllEventArgs, ParticipantAttributeEventArgs, ParticipantEventArgs, ParticipantsListEventArgs } from "./ConversationTranslatorEventArgs";
import { ConversationTranslatorCommandTypes, ConversationTranslatorMessageTypes } from "./ConversationTranslatorInterfaces";
import { CommandResponsePayload, ParticipantPayloadResponse, ParticipantsListPayloadResponse, SpeechResponsePayload, TextResponsePayload } from "./ServiceMessages/Exports";
/***
 * The service adapter handles sending and receiving messages to the Conversation Translator websocket.
 */
export class ConversationServiceAdapter extends ServiceRecognizerBase {
    constructor(authentication, connectionFactory, audioSource, recognizerConfig, conversationServiceConnector) {
        super(authentication, connectionFactory, audioSource, recognizerConfig, conversationServiceConnector);
        this.privLastPartialUtteranceId = "";
        this.noOp = () => {
            // operation not supported
        };
        this.privConversationServiceConnector = conversationServiceConnector;
        this.privConversationAuthentication = authentication;
        this.receiveMessageOverride = this.receiveConversationMessageOverride;
        this.recognizeOverride = this.noOp;
        this.postConnectImplOverride = this.conversationConnectImpl;
        this.configConnectionOverride = this.configConnection;
        this.disconnectOverride = this.privDisconnect;
        this.privConversationRequestSession = new ConversationRequestSession(createNoDashGuid());
        this.privConversationConnectionFactory = connectionFactory;
        this.privConversationIsDisposed = false;
    }
    isDisposed() {
        return this.privConversationIsDisposed;
    }
    async dispose(reason) {
        this.privConversationIsDisposed = true;
        if (this.privConnectionConfigPromise) {
            const connection = await this.privConnectionConfigPromise;
            await connection.dispose(reason);
        }
    }
    async sendMessage(message) {
        const connection = await this.fetchConnection();
        return connection.send(new ConversationConnectionMessage(MessageType.Text, message));
    }
    async sendMessageAsync(message) {
        const sink = new Deferred();
        const connection = await this.fetchConnection();
        await connection.send(new ConversationConnectionMessage(MessageType.Text, message));
    }
    privDisconnect() {
        if (this.terminateMessageLoop) {
            return;
        }
        this.cancelRecognition(this.privConversationRequestSession.sessionId, this.privConversationRequestSession.requestId, CancellationReason.Error, CancellationErrorCode.NoError, "Disconnecting");
        this.terminateMessageLoop = true;
        return Promise.resolve();
    }
    async processTypeSpecificMessages(connectionMessage, successCallback, errorCallBack) {
        return true;
    }
    // Cancels recognition.
    cancelRecognition(sessionId, requestId, cancellationReason, errorCode, error) {
        this.terminateMessageLoop = true;
        const cancelEvent = new ConversationTranslationCanceledEventArgs(cancellationReason, error, errorCode, undefined, sessionId);
        try {
            if (!!this.privConversationServiceConnector.canceled) {
                this.privConversationServiceConnector.canceled(this.privConversationServiceConnector, cancelEvent);
            }
        }
        catch (_a) {
            // continue on error
        }
    }
    /**
     * Establishes a websocket connection to the end point.
     * @param isUnAuthorized
     */
    async conversationConnectImpl(connection) {
        this.privConnectionLoop = this.startMessageLoop();
        return connection;
    }
    /**
     * Process incoming websocket messages
     */
    receiveConversationMessageOverride() {
        // we won't rely on the cascading promises of the connection since we want to continually be available to receive messages
        const communicationCustodian = new Deferred();
        this.fetchConnection().then(async (connection) => {
            const isDisposed = this.isDisposed();
            const terminateMessageLoop = (!this.isDisposed() && this.terminateMessageLoop);
            if (isDisposed || terminateMessageLoop) {
                // We're done.
                communicationCustodian.resolve();
                return Promise.resolve();
            }
            const message = await connection.read();
            const sessionId = this.privConversationRequestSession.sessionId;
            let sendFinal = false;
            if (!message) {
                return this.receiveConversationMessageOverride();
            }
            try {
                switch (message.conversationMessageType.toLowerCase()) {
                    case "info":
                    case "participant_command":
                    case "command":
                        const commandPayload = CommandResponsePayload.fromJSON(message.textBody);
                        switch (commandPayload.command.toLowerCase()) {
                            /**
                             * 'ParticpantList' is the first message sent to the user after the websocket connection has opened.
                             * The consuming client must wait for this message to arrive
                             * before starting to send their own data.
                             */
                            case "participantlist":
                                const participantsPayload = ParticipantsListPayloadResponse.fromJSON(message.textBody);
                                const participantsResult = participantsPayload.participants.map((p) => {
                                    const participant = {
                                        avatar: p.avatar,
                                        displayName: p.nickname,
                                        id: p.participantId,
                                        isHost: p.ishost,
                                        isMuted: p.ismuted,
                                        isUsingTts: p.usetts,
                                        preferredLanguage: p.locale
                                    };
                                    return participant;
                                });
                                if (!!this.privConversationServiceConnector.participantsListReceived) {
                                    this.privConversationServiceConnector.participantsListReceived(this.privConversationServiceConnector, new ParticipantsListEventArgs(participantsPayload.roomid, participantsPayload.token, participantsPayload.translateTo, participantsPayload.profanityFilter, participantsPayload.roomProfanityFilter, participantsPayload.roomLocked, participantsPayload.muteAll, participantsResult, sessionId));
                                }
                                break;
                            /**
                             * 'SetTranslateToLanguages' represents the list of languages being used in the Conversation by all users(?).
                             * This is sent at the start of the Conversation
                             */
                            case "settranslatetolanguages":
                                if (!!this.privConversationServiceConnector.participantUpdateCommandReceived) {
                                    this.privConversationServiceConnector.participantUpdateCommandReceived(this.privConversationServiceConnector, new ParticipantAttributeEventArgs(commandPayload.participantId, ConversationTranslatorCommandTypes.setTranslateToLanguages, commandPayload.value, sessionId));
                                }
                                break;
                            /**
                             * 'SetProfanityFiltering' lets the client set the level of profanity filtering.
                             * If sent by the participant the setting will effect only their own profanity level.
                             * If sent by the host, the setting will effect all participants including the host.
                             * Note: the profanity filters differ from Speech Service (?): 'marked', 'raw', 'removed', 'tagged'
                             */
                            case "setprofanityfiltering":
                                if (!!this.privConversationServiceConnector.participantUpdateCommandReceived) {
                                    this.privConversationServiceConnector.participantUpdateCommandReceived(this.privConversationServiceConnector, new ParticipantAttributeEventArgs(commandPayload.participantId, ConversationTranslatorCommandTypes.setProfanityFiltering, commandPayload.value, sessionId));
                                }
                                break;
                            /**
                             * 'SetMute' is sent if the participant has been muted by the host.
                             * Check the 'participantId' to determine if the current user has been muted.
                             */
                            case "setmute":
                                if (!!this.privConversationServiceConnector.participantUpdateCommandReceived) {
                                    this.privConversationServiceConnector.participantUpdateCommandReceived(this.privConversationServiceConnector, new ParticipantAttributeEventArgs(commandPayload.participantId, ConversationTranslatorCommandTypes.setMute, commandPayload.value, sessionId));
                                }
                                break;
                            /**
                             * 'SetMuteAll' is sent if the Conversation has been muted by the host.
                             */
                            case "setmuteall":
                                if (!!this.privConversationServiceConnector.muteAllCommandReceived) {
                                    this.privConversationServiceConnector.muteAllCommandReceived(this.privConversationServiceConnector, new MuteAllEventArgs(commandPayload.value, sessionId));
                                }
                                break;
                            /**
                             * 'RoomExpirationWarning' is sent towards the end of the Conversation session to give a timeout warning.
                             */
                            case "roomexpirationwarning":
                                if (!!this.privConversationServiceConnector.conversationExpiration) {
                                    this.privConversationServiceConnector.conversationExpiration(this.privConversationServiceConnector, new ConversationExpirationEventArgs(commandPayload.value, this.privConversationRequestSession.sessionId));
                                }
                                break;
                            /**
                             * 'SetUseTts' is sent as a confirmation if the user requests TTS to be turned on or off.
                             */
                            case "setusetts":
                                if (!!this.privConversationServiceConnector.participantUpdateCommandReceived) {
                                    this.privConversationServiceConnector.participantUpdateCommandReceived(this.privConversationServiceConnector, new ParticipantAttributeEventArgs(commandPayload.participantId, ConversationTranslatorCommandTypes.setUseTTS, commandPayload.value, sessionId));
                                }
                                break;
                            /**
                             * 'SetLockState' is set if the host has locked or unlocked the Conversation.
                             */
                            case "setlockstate":
                                if (!!this.privConversationServiceConnector.lockRoomCommandReceived) {
                                    this.privConversationServiceConnector.lockRoomCommandReceived(this.privConversationServiceConnector, new LockRoomEventArgs(commandPayload.value, sessionId));
                                }
                                break;
                            /**
                             * 'ChangeNickname' is received if a user changes their display name.
                             * Any cached particpiants list should be updated to reflect the display name.
                             */
                            case "changenickname":
                                if (!!this.privConversationServiceConnector.participantUpdateCommandReceived) {
                                    this.privConversationServiceConnector.participantUpdateCommandReceived(this.privConversationServiceConnector, new ParticipantAttributeEventArgs(commandPayload.participantId, ConversationTranslatorCommandTypes.changeNickname, commandPayload.nickname, sessionId));
                                }
                                break;
                            /**
                             * 'JoinSession' is sent when a user joins the Conversation.
                             */
                            case "joinsession":
                                const joinParticipantPayload = ParticipantPayloadResponse.fromJSON(message.textBody);
                                const joiningParticipant = {
                                    avatar: joinParticipantPayload.avatar,
                                    displayName: joinParticipantPayload.nickname,
                                    id: joinParticipantPayload.participantId,
                                    isHost: joinParticipantPayload.ishost,
                                    isMuted: joinParticipantPayload.ismuted,
                                    isUsingTts: joinParticipantPayload.usetts,
                                    preferredLanguage: joinParticipantPayload.locale,
                                };
                                if (!!this.privConversationServiceConnector.participantJoinCommandReceived) {
                                    this.privConversationServiceConnector.participantJoinCommandReceived(this.privConversationServiceConnector, new ParticipantEventArgs(joiningParticipant, sessionId));
                                }
                                break;
                            /**
                             * 'LeaveSession' is sent when a user leaves the Conversation'.
                             */
                            case "leavesession":
                                const leavingParticipant = {
                                    id: commandPayload.participantId
                                };
                                if (!!this.privConversationServiceConnector.participantLeaveCommandReceived) {
                                    this.privConversationServiceConnector.participantLeaveCommandReceived(this.privConversationServiceConnector, new ParticipantEventArgs(leavingParticipant, sessionId));
                                }
                                break;
                            /**
                             * 'DisconnectSession' is sent when a user is disconnected from the session (e.g. network problem).
                             * Check the 'ParticipantId' to check whether the message is for the current user.
                             */
                            case "disconnectsession":
                                const disconnectParticipant = {
                                    id: commandPayload.participantId
                                };
                                break;
                            /**
                             * Message not recognized.
                             */
                            default:
                                break;
                        }
                        break;
                    /**
                     * 'partial' (or 'hypothesis') represents a unfinalized speech message.
                     */
                    case "partial":
                    /**
                     * 'final' (or 'phrase') represents a finalized speech message.
                     */
                    case "final":
                        const speechPayload = SpeechResponsePayload.fromJSON(message.textBody);
                        const speechResult = new ConversationTranslationResult(speechPayload.participantId, this.getTranslations(speechPayload.translations), speechPayload.language, undefined, undefined, speechPayload.recognition, undefined, undefined, message.textBody, undefined);
                        if (speechPayload.isFinal) {
                            // check the length, sometimes empty finals are returned
                            if (speechResult.text !== undefined && speechResult.text.length > 0) {
                                sendFinal = true;
                            }
                            else if (speechPayload.id === this.privLastPartialUtteranceId) {
                                // send final as normal. We had a non-empty partial for this same utterance
                                // so sending the empty final is important
                                sendFinal = true;
                            }
                            else {
                                // suppress unneeded final
                            }
                            if (sendFinal) {
                                if (!!this.privConversationServiceConnector.translationReceived) {
                                    this.privConversationServiceConnector.translationReceived(this.privConversationServiceConnector, new ConversationReceivedTranslationEventArgs(ConversationTranslatorMessageTypes.final, speechResult, sessionId));
                                }
                            }
                        }
                        else if (speechResult.text !== undefined) {
                            this.privLastPartialUtteranceId = speechPayload.id;
                            if (!!this.privConversationServiceConnector.translationReceived) {
                                this.privConversationServiceConnector.translationReceived(this.privConversationServiceConnector, new ConversationReceivedTranslationEventArgs(ConversationTranslatorMessageTypes.partial, speechResult, sessionId));
                            }
                        }
                        break;
                    /**
                     * "translated_message" is a text message or instant message (IM).
                     */
                    case "translated_message":
                        const textPayload = TextResponsePayload.fromJSON(message.textBody);
                        const textResult = new ConversationTranslationResult(textPayload.participantId, this.getTranslations(textPayload.translations), textPayload.language, undefined, undefined, textPayload.originalText, undefined, undefined, undefined, message.textBody, undefined);
                        if (!!this.privConversationServiceConnector.translationReceived) {
                            this.privConversationServiceConnector.translationReceived(this.privConversationServiceConnector, new ConversationReceivedTranslationEventArgs(ConversationTranslatorMessageTypes.instantMessage, textResult, sessionId));
                        }
                        break;
                    default:
                        // ignore any unsupported message types
                        break;
                }
            }
            catch (e) {
                // continue
            }
            return this.receiveConversationMessageOverride();
        }, (error) => {
            this.terminateMessageLoop = true;
        });
        return communicationCustodian.promise;
    }
    async startMessageLoop() {
        this.terminateMessageLoop = false;
        const messageRetrievalPromise = this.receiveConversationMessageOverride();
        try {
            const r = await messageRetrievalPromise;
            return r;
        }
        catch (error) {
            this.cancelRecognition(this.privRequestSession ? this.privRequestSession.sessionId : "", this.privRequestSession ? this.privRequestSession.requestId : "", CancellationReason.Error, CancellationErrorCode.RuntimeError, error);
            return null;
        }
    }
    // Takes an established websocket connection to the endpoint
    configConnection() {
        if (this.privConnectionConfigPromise) {
            return this.privConnectionConfigPromise.then((connection) => {
                if (connection.state() === ConnectionState.Disconnected) {
                    this.privConnectionId = null;
                    this.privConnectionConfigPromise = null;
                    return this.configConnection();
                }
                return this.privConnectionConfigPromise;
            }, (error) => {
                this.privConnectionId = null;
                this.privConnectionConfigPromise = null;
                return this.configConnection();
            });
        }
        if (this.terminateMessageLoop) {
            return Promise.resolve(undefined);
        }
        this.privConnectionConfigPromise = this.connectImpl().then((connection) => {
            return connection;
        });
        return this.privConnectionConfigPromise;
    }
    getTranslations(serviceResultTranslations) {
        let translations;
        if (undefined !== serviceResultTranslations) {
            translations = new Translations();
            for (const translation of serviceResultTranslations) {
                translations.set(translation.lang, translation.translation);
            }
        }
        return translations;
    }
}

//# sourceMappingURL=ConversationServiceAdapter.js.map