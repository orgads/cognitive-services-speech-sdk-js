"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = require("../../common/Exports");
var Exports_2 = require("../../sdk/Exports");
var Exports_3 = require("../Exports");
var ConversationConnectionMessage_1 = require("./ConversationConnectionMessage");
var ConversationRequestSession_1 = require("./ConversationRequestSession");
var ConversationTranslatorEventArgs_1 = require("./ConversationTranslatorEventArgs");
var ConversationTranslatorInterfaces_1 = require("./ConversationTranslatorInterfaces");
var Exports_4 = require("./ServiceMessages/Exports");
/***
 * The service adapter handles sending and receiving messages to the Conversation Translator websocket.
 */
var ConversationServiceAdapter = /** @class */ (function (_super) {
    __extends(ConversationServiceAdapter, _super);
    function ConversationServiceAdapter(authentication, connectionFactory, audioSource, recognizerConfig, conversationServiceConnector) {
        var _this = _super.call(this, authentication, connectionFactory, audioSource, recognizerConfig, conversationServiceConnector) || this;
        _this.privLastPartialUtteranceId = "";
        _this.noOp = function () {
            // operation not supported
        };
        _this.privConversationServiceConnector = conversationServiceConnector;
        _this.privConversationAuthentication = authentication;
        _this.receiveMessageOverride = _this.receiveConversationMessageOverride;
        _this.recognizeOverride = _this.noOp;
        _this.postConnectImplOverride = _this.conversationConnectImpl;
        _this.configConnectionOverride = _this.configConnection;
        _this.disconnectOverride = _this.privDisconnect;
        _this.privConversationRequestSession = new ConversationRequestSession_1.ConversationRequestSession(Exports_1.createNoDashGuid());
        _this.privConversationConnectionFactory = connectionFactory;
        _this.privConversationIsDisposed = false;
        return _this;
    }
    ConversationServiceAdapter.prototype.isDisposed = function () {
        return this.privConversationIsDisposed;
    };
    ConversationServiceAdapter.prototype.dispose = function (reason) {
        return __awaiter(this, void 0, void 0, function () {
            var connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.privConversationIsDisposed = true;
                        if (!this.privConnectionConfigPromise) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.privConnectionConfigPromise];
                    case 1:
                        connection = _a.sent();
                        return [4 /*yield*/, connection.dispose(reason)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ConversationServiceAdapter.prototype.sendMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchConnection()];
                    case 1:
                        connection = _a.sent();
                        return [2 /*return*/, connection.send(new ConversationConnectionMessage_1.ConversationConnectionMessage(Exports_1.MessageType.Text, message))];
                }
            });
        });
    };
    ConversationServiceAdapter.prototype.sendMessageAsync = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var sink, connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sink = new Exports_1.Deferred();
                        return [4 /*yield*/, this.fetchConnection()];
                    case 1:
                        connection = _a.sent();
                        return [4 /*yield*/, connection.send(new ConversationConnectionMessage_1.ConversationConnectionMessage(Exports_1.MessageType.Text, message))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ConversationServiceAdapter.prototype.privDisconnect = function () {
        if (this.terminateMessageLoop) {
            return;
        }
        this.cancelRecognition(this.privConversationRequestSession.sessionId, this.privConversationRequestSession.requestId, Exports_2.CancellationReason.Error, Exports_2.CancellationErrorCode.NoError, "Disconnecting");
        this.terminateMessageLoop = true;
        return Promise.resolve();
    };
    ConversationServiceAdapter.prototype.processTypeSpecificMessages = function (connectionMessage, successCallback, errorCallBack) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, true];
            });
        });
    };
    // Cancels recognition.
    ConversationServiceAdapter.prototype.cancelRecognition = function (sessionId, requestId, cancellationReason, errorCode, error) {
        this.terminateMessageLoop = true;
        var cancelEvent = new Exports_2.ConversationTranslationCanceledEventArgs(cancellationReason, error, errorCode, undefined, sessionId);
        try {
            if (!!this.privConversationServiceConnector.canceled) {
                this.privConversationServiceConnector.canceled(this.privConversationServiceConnector, cancelEvent);
            }
        }
        catch (_a) {
            // continue on error
        }
    };
    /**
     * Establishes a websocket connection to the end point.
     * @param isUnAuthorized
     */
    ConversationServiceAdapter.prototype.conversationConnectImpl = function (connection) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.privConnectionLoop = this.startMessageLoop();
                return [2 /*return*/, connection];
            });
        });
    };
    /**
     * Process incoming websocket messages
     */
    ConversationServiceAdapter.prototype.receiveConversationMessageOverride = function () {
        var _this = this;
        // we won't rely on the cascading promises of the connection since we want to continually be available to receive messages
        var communicationCustodian = new Exports_1.Deferred();
        this.fetchConnection().then(function (connection) { return __awaiter(_this, void 0, void 0, function () {
            var isDisposed, terminateMessageLoop, message, sessionId, sendFinal, commandPayload, participantsPayload, participantsResult, joinParticipantPayload, joiningParticipant, leavingParticipant, disconnectParticipant, speechPayload, speechResult, textPayload, textResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isDisposed = this.isDisposed();
                        terminateMessageLoop = (!this.isDisposed() && this.terminateMessageLoop);
                        if (isDisposed || terminateMessageLoop) {
                            // We're done.
                            communicationCustodian.resolve();
                            return [2 /*return*/, Promise.resolve()];
                        }
                        return [4 /*yield*/, connection.read()];
                    case 1:
                        message = _a.sent();
                        sessionId = this.privConversationRequestSession.sessionId;
                        sendFinal = false;
                        if (!message) {
                            return [2 /*return*/, this.receiveConversationMessageOverride()];
                        }
                        try {
                            switch (message.conversationMessageType.toLowerCase()) {
                                case "info":
                                case "participant_command":
                                case "command":
                                    commandPayload = Exports_4.CommandResponsePayload.fromJSON(message.textBody);
                                    switch (commandPayload.command.toLowerCase()) {
                                        /**
                                         * 'ParticpantList' is the first message sent to the user after the websocket connection has opened.
                                         * The consuming client must wait for this message to arrive
                                         * before starting to send their own data.
                                         */
                                        case "participantlist":
                                            participantsPayload = Exports_4.ParticipantsListPayloadResponse.fromJSON(message.textBody);
                                            participantsResult = participantsPayload.participants.map(function (p) {
                                                var participant = {
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
                                                this.privConversationServiceConnector.participantsListReceived(this.privConversationServiceConnector, new ConversationTranslatorEventArgs_1.ParticipantsListEventArgs(participantsPayload.roomid, participantsPayload.token, participantsPayload.translateTo, participantsPayload.profanityFilter, participantsPayload.roomProfanityFilter, participantsPayload.roomLocked, participantsPayload.muteAll, participantsResult, sessionId));
                                            }
                                            break;
                                        /**
                                         * 'SetTranslateToLanguages' represents the list of languages being used in the Conversation by all users(?).
                                         * This is sent at the start of the Conversation
                                         */
                                        case "settranslatetolanguages":
                                            if (!!this.privConversationServiceConnector.participantUpdateCommandReceived) {
                                                this.privConversationServiceConnector.participantUpdateCommandReceived(this.privConversationServiceConnector, new ConversationTranslatorEventArgs_1.ParticipantAttributeEventArgs(commandPayload.participantId, ConversationTranslatorInterfaces_1.ConversationTranslatorCommandTypes.setTranslateToLanguages, commandPayload.value, sessionId));
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
                                                this.privConversationServiceConnector.participantUpdateCommandReceived(this.privConversationServiceConnector, new ConversationTranslatorEventArgs_1.ParticipantAttributeEventArgs(commandPayload.participantId, ConversationTranslatorInterfaces_1.ConversationTranslatorCommandTypes.setProfanityFiltering, commandPayload.value, sessionId));
                                            }
                                            break;
                                        /**
                                         * 'SetMute' is sent if the participant has been muted by the host.
                                         * Check the 'participantId' to determine if the current user has been muted.
                                         */
                                        case "setmute":
                                            if (!!this.privConversationServiceConnector.participantUpdateCommandReceived) {
                                                this.privConversationServiceConnector.participantUpdateCommandReceived(this.privConversationServiceConnector, new ConversationTranslatorEventArgs_1.ParticipantAttributeEventArgs(commandPayload.participantId, ConversationTranslatorInterfaces_1.ConversationTranslatorCommandTypes.setMute, commandPayload.value, sessionId));
                                            }
                                            break;
                                        /**
                                         * 'SetMuteAll' is sent if the Conversation has been muted by the host.
                                         */
                                        case "setmuteall":
                                            if (!!this.privConversationServiceConnector.muteAllCommandReceived) {
                                                this.privConversationServiceConnector.muteAllCommandReceived(this.privConversationServiceConnector, new ConversationTranslatorEventArgs_1.MuteAllEventArgs(commandPayload.value, sessionId));
                                            }
                                            break;
                                        /**
                                         * 'RoomExpirationWarning' is sent towards the end of the Conversation session to give a timeout warning.
                                         */
                                        case "roomexpirationwarning":
                                            if (!!this.privConversationServiceConnector.conversationExpiration) {
                                                this.privConversationServiceConnector.conversationExpiration(this.privConversationServiceConnector, new Exports_2.ConversationExpirationEventArgs(commandPayload.value, this.privConversationRequestSession.sessionId));
                                            }
                                            break;
                                        /**
                                         * 'SetUseTts' is sent as a confirmation if the user requests TTS to be turned on or off.
                                         */
                                        case "setusetts":
                                            if (!!this.privConversationServiceConnector.participantUpdateCommandReceived) {
                                                this.privConversationServiceConnector.participantUpdateCommandReceived(this.privConversationServiceConnector, new ConversationTranslatorEventArgs_1.ParticipantAttributeEventArgs(commandPayload.participantId, ConversationTranslatorInterfaces_1.ConversationTranslatorCommandTypes.setUseTTS, commandPayload.value, sessionId));
                                            }
                                            break;
                                        /**
                                         * 'SetLockState' is set if the host has locked or unlocked the Conversation.
                                         */
                                        case "setlockstate":
                                            if (!!this.privConversationServiceConnector.lockRoomCommandReceived) {
                                                this.privConversationServiceConnector.lockRoomCommandReceived(this.privConversationServiceConnector, new ConversationTranslatorEventArgs_1.LockRoomEventArgs(commandPayload.value, sessionId));
                                            }
                                            break;
                                        /**
                                         * 'ChangeNickname' is received if a user changes their display name.
                                         * Any cached particpiants list should be updated to reflect the display name.
                                         */
                                        case "changenickname":
                                            if (!!this.privConversationServiceConnector.participantUpdateCommandReceived) {
                                                this.privConversationServiceConnector.participantUpdateCommandReceived(this.privConversationServiceConnector, new ConversationTranslatorEventArgs_1.ParticipantAttributeEventArgs(commandPayload.participantId, ConversationTranslatorInterfaces_1.ConversationTranslatorCommandTypes.changeNickname, commandPayload.nickname, sessionId));
                                            }
                                            break;
                                        /**
                                         * 'JoinSession' is sent when a user joins the Conversation.
                                         */
                                        case "joinsession":
                                            joinParticipantPayload = Exports_4.ParticipantPayloadResponse.fromJSON(message.textBody);
                                            joiningParticipant = {
                                                avatar: joinParticipantPayload.avatar,
                                                displayName: joinParticipantPayload.nickname,
                                                id: joinParticipantPayload.participantId,
                                                isHost: joinParticipantPayload.ishost,
                                                isMuted: joinParticipantPayload.ismuted,
                                                isUsingTts: joinParticipantPayload.usetts,
                                                preferredLanguage: joinParticipantPayload.locale,
                                            };
                                            if (!!this.privConversationServiceConnector.participantJoinCommandReceived) {
                                                this.privConversationServiceConnector.participantJoinCommandReceived(this.privConversationServiceConnector, new ConversationTranslatorEventArgs_1.ParticipantEventArgs(joiningParticipant, sessionId));
                                            }
                                            break;
                                        /**
                                         * 'LeaveSession' is sent when a user leaves the Conversation'.
                                         */
                                        case "leavesession":
                                            leavingParticipant = {
                                                id: commandPayload.participantId
                                            };
                                            if (!!this.privConversationServiceConnector.participantLeaveCommandReceived) {
                                                this.privConversationServiceConnector.participantLeaveCommandReceived(this.privConversationServiceConnector, new ConversationTranslatorEventArgs_1.ParticipantEventArgs(leavingParticipant, sessionId));
                                            }
                                            break;
                                        /**
                                         * 'DisconnectSession' is sent when a user is disconnected from the session (e.g. network problem).
                                         * Check the 'ParticipantId' to check whether the message is for the current user.
                                         */
                                        case "disconnectsession":
                                            disconnectParticipant = {
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
                                    speechPayload = Exports_4.SpeechResponsePayload.fromJSON(message.textBody);
                                    speechResult = new Exports_2.ConversationTranslationResult(speechPayload.participantId, this.getTranslations(speechPayload.translations), speechPayload.language, undefined, undefined, speechPayload.recognition, undefined, undefined, message.textBody, undefined);
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
                                                this.privConversationServiceConnector.translationReceived(this.privConversationServiceConnector, new ConversationTranslatorEventArgs_1.ConversationReceivedTranslationEventArgs(ConversationTranslatorInterfaces_1.ConversationTranslatorMessageTypes.final, speechResult, sessionId));
                                            }
                                        }
                                    }
                                    else if (speechResult.text !== undefined) {
                                        this.privLastPartialUtteranceId = speechPayload.id;
                                        if (!!this.privConversationServiceConnector.translationReceived) {
                                            this.privConversationServiceConnector.translationReceived(this.privConversationServiceConnector, new ConversationTranslatorEventArgs_1.ConversationReceivedTranslationEventArgs(ConversationTranslatorInterfaces_1.ConversationTranslatorMessageTypes.partial, speechResult, sessionId));
                                        }
                                    }
                                    break;
                                /**
                                 * "translated_message" is a text message or instant message (IM).
                                 */
                                case "translated_message":
                                    textPayload = Exports_4.TextResponsePayload.fromJSON(message.textBody);
                                    textResult = new Exports_2.ConversationTranslationResult(textPayload.participantId, this.getTranslations(textPayload.translations), textPayload.language, undefined, undefined, textPayload.originalText, undefined, undefined, undefined, message.textBody, undefined);
                                    if (!!this.privConversationServiceConnector.translationReceived) {
                                        this.privConversationServiceConnector.translationReceived(this.privConversationServiceConnector, new ConversationTranslatorEventArgs_1.ConversationReceivedTranslationEventArgs(ConversationTranslatorInterfaces_1.ConversationTranslatorMessageTypes.instantMessage, textResult, sessionId));
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
                        return [2 /*return*/, this.receiveConversationMessageOverride()];
                }
            });
        }); }, function (error) {
            _this.terminateMessageLoop = true;
        });
        return communicationCustodian.promise;
    };
    ConversationServiceAdapter.prototype.startMessageLoop = function () {
        return __awaiter(this, void 0, void 0, function () {
            var messageRetrievalPromise, r, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.terminateMessageLoop = false;
                        messageRetrievalPromise = this.receiveConversationMessageOverride();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, messageRetrievalPromise];
                    case 2:
                        r = _a.sent();
                        return [2 /*return*/, r];
                    case 3:
                        error_1 = _a.sent();
                        this.cancelRecognition(this.privRequestSession ? this.privRequestSession.sessionId : "", this.privRequestSession ? this.privRequestSession.requestId : "", Exports_2.CancellationReason.Error, Exports_2.CancellationErrorCode.RuntimeError, error_1);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Takes an established websocket connection to the endpoint
    ConversationServiceAdapter.prototype.configConnection = function () {
        var _this = this;
        if (this.privConnectionConfigPromise) {
            return this.privConnectionConfigPromise.then(function (connection) {
                if (connection.state() === Exports_1.ConnectionState.Disconnected) {
                    _this.privConnectionId = null;
                    _this.privConnectionConfigPromise = null;
                    return _this.configConnection();
                }
                return _this.privConnectionConfigPromise;
            }, function (error) {
                _this.privConnectionId = null;
                _this.privConnectionConfigPromise = null;
                return _this.configConnection();
            });
        }
        if (this.terminateMessageLoop) {
            return Promise.resolve(undefined);
        }
        this.privConnectionConfigPromise = this.connectImpl().then(function (connection) {
            return connection;
        });
        return this.privConnectionConfigPromise;
    };
    ConversationServiceAdapter.prototype.getTranslations = function (serviceResultTranslations) {
        var translations;
        if (undefined !== serviceResultTranslations) {
            translations = new Exports_2.Translations();
            for (var _i = 0, serviceResultTranslations_1 = serviceResultTranslations; _i < serviceResultTranslations_1.length; _i++) {
                var translation = serviceResultTranslations_1[_i];
                translations.set(translation.lang, translation.translation);
            }
        }
        return translations;
    };
    return ConversationServiceAdapter;
}(Exports_3.ServiceRecognizerBase));
exports.ConversationServiceAdapter = ConversationServiceAdapter;

//# sourceMappingURL=ConversationServiceAdapter.js.map