// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// Multi-device Conversation is a Preview feature.
import { ConversationConnectionConfig } from "../../common.speech/Exports";
import { marshalPromiseToCallbacks } from "../../common/Exports";
import { Contracts } from "../Contracts";
import { AudioConfig, CancellationErrorCode, CancellationReason, Connection, ProfanityOption, PropertyCollection, PropertyId, SpeechTranslationConfig, TranslationRecognizer } from "../Exports";
import { ConversationImpl } from "./Conversation";
import { ConversationCommon, ConversationTranslationCanceledEventArgs, } from "./Exports";
export var SpeechState;
(function (SpeechState) {
    SpeechState[SpeechState["Inactive"] = 0] = "Inactive";
    SpeechState[SpeechState["Connecting"] = 1] = "Connecting";
    SpeechState[SpeechState["Connected"] = 2] = "Connected";
})(SpeechState || (SpeechState = {}));
/***
 * Join, leave or connect to a conversation.
 */
export class ConversationTranslator extends ConversationCommon {
    constructor(audioConfig) {
        super(audioConfig);
        this.privIsDisposed = false;
        this.privIsSpeaking = false;
        this.privSpeechState = SpeechState.Inactive;
        this.privErrors = ConversationConnectionConfig.restErrors;
        this.privPlaceholderKey = "abcdefghijklmnopqrstuvwxyz012345";
        this.privPlaceholderRegion = "westus";
        /** Recognizer callbacks */
        this.onSpeechConnected = (e) => {
            this.privSpeechState = SpeechState.Connected;
        };
        this.onSpeechRecognizing = (r, e) => {
            // TODO: add support for getting recognitions from here if own speech
        };
        this.onSpeechSessionStarted = (r, e) => {
            this.privSpeechState = SpeechState.Connected;
        };
        this.onSpeechSessionStopped = (r, e) => {
            this.privSpeechState = SpeechState.Inactive;
        };
        this.privProperties = new PropertyCollection();
    }
    get properties() {
        return this.privProperties;
    }
    get speechRecognitionLanguage() {
        return this.privSpeechRecognitionLanguage;
    }
    get participants() {
        var _a;
        return (_a = this.privConversation) === null || _a === void 0 ? void 0 : _a.participants;
    }
    joinConversationAsync(conversation, nickname, param1, param2, param3) {
        try {
            if (typeof conversation === "string") {
                Contracts.throwIfNullOrUndefined(conversation, this.privErrors.invalidArgs.replace("{arg}", "conversation id"));
                Contracts.throwIfNullOrWhitespace(nickname, this.privErrors.invalidArgs.replace("{arg}", "nickname"));
                if (!!this.privConversation) {
                    this.handleError(new Error(this.privErrors.permissionDeniedStart), param3);
                }
                let lang = param1;
                if (lang === undefined || lang === null || lang === "") {
                    lang = ConversationConnectionConfig.defaultLanguageCode;
                }
                // create a placeholder config
                this.privSpeechTranslationConfig = SpeechTranslationConfig.fromSubscription(this.privPlaceholderKey, this.privPlaceholderRegion);
                this.privSpeechTranslationConfig.setProfanity(ProfanityOption.Masked);
                this.privSpeechTranslationConfig.addTargetLanguage(lang);
                this.privSpeechTranslationConfig.setProperty(PropertyId[PropertyId.SpeechServiceConnection_RecoLanguage], lang);
                this.privSpeechTranslationConfig.setProperty(PropertyId[PropertyId.ConversationTranslator_Name], nickname);
                const endpoint = this.privProperties.getProperty(PropertyId.ConversationTranslator_Host);
                if (endpoint) {
                    this.privSpeechTranslationConfig.setProperty(PropertyId[PropertyId.ConversationTranslator_Host], endpoint);
                }
                const speechEndpointHost = this.privProperties.getProperty(PropertyId.SpeechServiceConnection_Host);
                if (speechEndpointHost) {
                    this.privSpeechTranslationConfig.setProperty(PropertyId[PropertyId.SpeechServiceConnection_Host], speechEndpointHost);
                }
                // join the conversation
                this.privConversation = new ConversationImpl(this.privSpeechTranslationConfig);
                this.privConversation.conversationTranslator = this;
                this.privConversation.joinConversationAsync(conversation, nickname, lang, ((result) => {
                    if (!result) {
                        this.handleError(new Error(this.privErrors.permissionDeniedConnect), param3);
                    }
                    this.privSpeechTranslationConfig.authorizationToken = result;
                    // connect to the ws
                    this.privConversation.startConversationAsync((() => {
                        this.handleCallback(param2, param3);
                    }), ((error) => {
                        this.handleError(error, param3);
                    }));
                }), ((error) => {
                    this.handleError(error, param3);
                }));
            }
            else if (typeof conversation === "object") {
                Contracts.throwIfNullOrUndefined(conversation, this.privErrors.invalidArgs.replace("{arg}", "conversation id"));
                Contracts.throwIfNullOrWhitespace(nickname, this.privErrors.invalidArgs.replace("{arg}", "nickname"));
                // save the nickname
                this.privProperties.setProperty(PropertyId.ConversationTranslator_Name, nickname);
                // ref the conversation object
                this.privConversation = conversation;
                // ref the conversation translator object
                this.privConversation.conversationTranslator = this;
                Contracts.throwIfNullOrUndefined(this.privConversation, this.privErrors.permissionDeniedConnect);
                Contracts.throwIfNullOrUndefined(this.privConversation.room.token, this.privErrors.permissionDeniedConnect);
                this.privSpeechTranslationConfig = conversation.config;
                this.handleCallback(param1, param2);
            }
            else {
                this.handleError(new Error(this.privErrors.invalidArgs.replace("{arg}", "invalid conversation type")), param2);
            }
        }
        catch (error) {
            this.handleError(error, typeof param1 === "string" ? param3 : param2);
        }
    }
    /**
     * Leave the conversation
     * @param cb
     * @param err
     */
    leaveConversationAsync(cb, err) {
        marshalPromiseToCallbacks((async () => {
            // stop the speech websocket
            await this.cancelSpeech();
            // stop the websocket
            await this.privConversation.endConversationImplAsync();
            // https delete request
            await this.privConversation.deleteConversationImplAsync();
            this.dispose();
        })(), cb, err);
    }
    /**
     * Send a text message
     * @param message
     * @param cb
     * @param err
     */
    sendTextMessageAsync(message, cb, err) {
        var _a;
        try {
            Contracts.throwIfNullOrUndefined(this.privConversation, this.privErrors.permissionDeniedSend);
            Contracts.throwIfNullOrWhitespace(message, this.privErrors.invalidArgs.replace("{arg}", message));
            (_a = this.privConversation) === null || _a === void 0 ? void 0 : _a.sendTextMessageAsync(message, cb, err);
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Start speaking
     * @param cb
     * @param err
     */
    startTranscribingAsync(cb, err) {
        marshalPromiseToCallbacks((async () => {
            try {
                Contracts.throwIfNullOrUndefined(this.privConversation, this.privErrors.permissionDeniedSend);
                Contracts.throwIfNullOrUndefined(this.privConversation.room.token, this.privErrors.permissionDeniedConnect);
                if (!this.canSpeak) {
                    this.handleError(new Error(this.privErrors.permissionDeniedSend), err);
                }
                if (this.privTranslationRecognizer === undefined) {
                    await this.connectTranslatorRecognizer();
                }
                await this.startContinuousRecognition();
                this.privIsSpeaking = true;
            }
            catch (error) {
                this.privIsSpeaking = false;
                // this.fireCancelEvent(error);
                await this.cancelSpeech();
                throw error;
            }
        })(), cb, err);
    }
    /**
     * Stop speaking
     * @param cb
     * @param err
     */
    stopTranscribingAsync(cb, err) {
        marshalPromiseToCallbacks((async () => {
            try {
                if (!this.privIsSpeaking) {
                    // stop speech
                    await this.cancelSpeech();
                    return;
                }
                // stop the recognition but leave the websocket open
                this.privIsSpeaking = false;
                await new Promise((resolve, reject) => {
                    var _a;
                    (_a = this.privTranslationRecognizer) === null || _a === void 0 ? void 0 : _a.stopContinuousRecognitionAsync(resolve, reject);
                });
            }
            catch (error) {
                await this.cancelSpeech();
            }
        })(), cb, err);
    }
    isDisposed() {
        return this.privIsDisposed;
    }
    dispose(reason, success, err) {
        marshalPromiseToCallbacks((async () => {
            var _a, _b;
            if (this.isDisposed && !this.privIsSpeaking) {
                return;
            }
            await this.cancelSpeech();
            this.privIsDisposed = true;
            (_a = this.privSpeechTranslationConfig) === null || _a === void 0 ? void 0 : _a.close();
            this.privSpeechRecognitionLanguage = undefined;
            this.privProperties = undefined;
            this.privAudioConfig = undefined;
            this.privSpeechTranslationConfig = undefined;
            (_b = this.privConversation) === null || _b === void 0 ? void 0 : _b.dispose();
            this.privConversation = undefined;
        })(), success, err);
    }
    /**
     * Cancel the speech websocket
     */
    async cancelSpeech() {
        var _a, _b;
        try {
            this.privIsSpeaking = false;
            (_a = this.privTranslationRecognizer) === null || _a === void 0 ? void 0 : _a.stopContinuousRecognitionAsync();
            await ((_b = this.privTranslationRecognizerConnection) === null || _b === void 0 ? void 0 : _b.closeConnection());
            this.privTranslationRecognizerConnection = undefined;
            this.privTranslationRecognizer = undefined;
            this.privSpeechState = SpeechState.Inactive;
        }
        catch (e) {
            // ignore the error
        }
    }
    /**
     * Connect to the speech translation recognizer.
     * Currently there is no language validation performed before sending the SpeechLanguage code to the service.
     * If it's an invalid language the raw error will be: 'Error during WebSocket handshake: Unexpected response code: 400'
     * e.g. pass in 'fr' instead of 'fr-FR', or a text-only language 'cy'
     * @param cb
     * @param err
     */
    async connectTranslatorRecognizer() {
        try {
            if (this.privAudioConfig === undefined) {
                this.privAudioConfig = AudioConfig.fromDefaultMicrophoneInput();
            }
            // clear the temp subscription key if it's a participant joining
            if (this.privSpeechTranslationConfig.getProperty(PropertyId[PropertyId.SpeechServiceConnection_Key])
                === this.privPlaceholderKey) {
                this.privSpeechTranslationConfig.setProperty(PropertyId[PropertyId.SpeechServiceConnection_Key], "");
            }
            // TODO
            const token = encodeURIComponent(this.privConversation.room.token);
            let endpointHost = this.privSpeechTranslationConfig.getProperty(PropertyId[PropertyId.SpeechServiceConnection_Host], ConversationConnectionConfig.speechHost);
            endpointHost = endpointHost.replace("{region}", this.privConversation.room.cognitiveSpeechRegion);
            const url = `wss://${endpointHost}${ConversationConnectionConfig.speechPath}?${ConversationConnectionConfig.configParams.token}=${token}`;
            this.privSpeechTranslationConfig.setProperty(PropertyId[PropertyId.SpeechServiceConnection_Endpoint], url);
            this.privTranslationRecognizer = new TranslationRecognizer(this.privSpeechTranslationConfig, this.privAudioConfig);
            this.privTranslationRecognizerConnection = Connection.fromRecognizer(this.privTranslationRecognizer);
            this.privTranslationRecognizerConnection.connected = this.onSpeechConnected;
            this.privTranslationRecognizerConnection.disconnected = this.onSpeechDisconnected;
            this.privTranslationRecognizer.recognized = this.onSpeechRecognized;
            this.privTranslationRecognizer.recognizing = this.onSpeechRecognizing;
            this.privTranslationRecognizer.canceled = this.onSpeechCanceled;
            this.privTranslationRecognizer.sessionStarted = this.onSpeechSessionStarted;
            this.privTranslationRecognizer.sessionStopped = this.onSpeechSessionStopped;
        }
        catch (error) {
            await this.cancelSpeech();
            throw error;
        }
    }
    /**
     * Handle the start speaking request
     * @param cb
     * @param err
     */
    startContinuousRecognition() {
        return new Promise((resolve, reject) => {
            this.privTranslationRecognizer.startContinuousRecognitionAsync(resolve, reject);
        });
    }
    async onSpeechDisconnected(e) {
        this.privSpeechState = SpeechState.Inactive;
        await this.cancelSpeech();
    }
    async onSpeechRecognized(r, e) {
        // TODO: add support for getting recognitions from here if own speech
        var _a;
        // if there is an error connecting to the conversation service from the speech service the error will be returned in the ErrorDetails field.
        if ((_a = e.result) === null || _a === void 0 ? void 0 : _a.errorDetails) {
            await this.cancelSpeech();
            // TODO: format the error message contained in 'errorDetails'
            this.fireCancelEvent(e.result.errorDetails);
        }
    }
    async onSpeechCanceled(r, e) {
        if (this.privSpeechState !== SpeechState.Inactive) {
            try {
                await this.cancelSpeech();
            }
            catch (error) {
                this.privSpeechState = SpeechState.Inactive;
            }
        }
    }
    /**
     * Fire a cancel event
     * @param error
     */
    fireCancelEvent(error) {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            if (!!this.canceled) {
                const cancelEvent = new ConversationTranslationCanceledEventArgs((_b = (_a = error) === null || _a === void 0 ? void 0 : _a.reason, (_b !== null && _b !== void 0 ? _b : CancellationReason.Error)), (_d = (_c = error) === null || _c === void 0 ? void 0 : _c.errorDetails, (_d !== null && _d !== void 0 ? _d : error)), (_f = (_e = error) === null || _e === void 0 ? void 0 : _e.errorCode, (_f !== null && _f !== void 0 ? _f : CancellationErrorCode.RuntimeError)), undefined, (_g = error) === null || _g === void 0 ? void 0 : _g.sessionId);
                this.canceled(this, cancelEvent);
            }
        }
        catch (e) {
            //
        }
    }
    get canSpeak() {
        // is there a Conversation websocket available
        if (!this.privConversation.isConnected) {
            return false;
        }
        // is the user already speaking
        if (this.privIsSpeaking || this.privSpeechState === SpeechState.Connected || this.privSpeechState === SpeechState.Connecting) {
            return false;
        }
        // is the user muted
        if (this.privConversation.isMutedByHost) {
            return false;
        }
        return true;
    }
}

//# sourceMappingURL=ConversationTranslator.js.map