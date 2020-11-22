// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { marshalPromiseToCallbacks } from "../../common/Exports";
import { Contracts } from "../../sdk/Contracts";
import { PropertyId, Recognizer, } from "../../sdk/Exports";
import { RecognitionMode, RecognizerConfig, TranscriberConnectionFactory, TranscriptionServiceRecognizer, } from "../Exports";
export class TranscriberRecognizer extends Recognizer {
    /**
     * TranscriberRecognizer constructor.
     * @constructor
     * @param {AudioConfig} audioConfig - An optional audio configuration associated with the recognizer
     */
    constructor(speechTranslationConfig, audioConfig) {
        const speechTranslationConfigImpl = speechTranslationConfig;
        Contracts.throwIfNull(speechTranslationConfigImpl, "speechTranslationConfig");
        Contracts.throwIfNullOrWhitespace(speechTranslationConfigImpl.speechRecognitionLanguage, PropertyId[PropertyId.SpeechServiceConnection_RecoLanguage]);
        super(audioConfig, speechTranslationConfigImpl.properties, new TranscriberConnectionFactory());
        this.privDisposedRecognizer = false;
    }
    getConversationInfo() {
        Contracts.throwIfNullOrUndefined(this.privConversation, "Conversation");
        return this.privConversation.conversationInfo;
    }
    get authorizationToken() {
        return this.properties.getProperty(PropertyId.SpeechServiceAuthorization_Token);
    }
    set authorizationToken(token) {
        Contracts.throwIfNullOrWhitespace(token, "token");
        this.properties.setProperty(PropertyId.SpeechServiceAuthorization_Token, token);
    }
    set conversation(c) {
        Contracts.throwIfNullOrUndefined(c, "Conversation");
        this.privConversation = c;
    }
    get speechRecognitionLanguage() {
        Contracts.throwIfDisposed(this.privDisposedRecognizer);
        return this.properties.getProperty(PropertyId.SpeechServiceConnection_RecoLanguage);
    }
    get properties() {
        return this.privProperties;
    }
    startContinuousRecognitionAsync(cb, err) {
        marshalPromiseToCallbacks(this.startContinuousRecognitionAsyncImpl(RecognitionMode.Conversation), cb, err);
    }
    stopContinuousRecognitionAsync(cb, err) {
        marshalPromiseToCallbacks(this.stopContinuousRecognitionAsyncImpl(), cb, err);
    }
    async close() {
        Contracts.throwIfDisposed(this.privDisposedRecognizer);
        await this.dispose(true);
    }
    // Push async join/leave conversation message via serviceRecognizer
    async pushConversationEvent(conversationInfo, command) {
        const reco = (this.privReco);
        Contracts.throwIfNullOrUndefined(reco, "serviceRecognizer");
        await reco.sendSpeechEventAsync(conversationInfo, command);
    }
    connectCallbacks(transcriber) {
        this.canceled = (s, e) => {
            if (!!transcriber.canceled) {
                transcriber.canceled(transcriber, e);
            }
        };
        this.recognizing = (s, e) => {
            if (!!transcriber.transcribing) {
                transcriber.transcribing(transcriber, e);
            }
        };
        this.recognized = (s, e) => {
            if (!!transcriber.transcribed) {
                transcriber.transcribed(transcriber, e);
            }
        };
        this.sessionStarted = (s, e) => {
            if (!!transcriber.sessionStarted) {
                transcriber.sessionStarted(transcriber, e);
            }
        };
        this.sessionStopped = (s, e) => {
            if (!!transcriber.sessionStopped) {
                transcriber.sessionStopped(transcriber, e);
            }
        };
    }
    disconnectCallbacks() {
        this.canceled = undefined;
        this.recognizing = undefined;
        this.recognized = undefined;
        this.sessionStarted = undefined;
        this.sessionStopped = undefined;
    }
    /**
     * Disposes any resources held by the object.
     * @member ConversationTranscriber.prototype.dispose
     * @function
     * @public
     * @param {boolean} disposing - true if disposing the object.
     */
    async dispose(disposing) {
        if (this.privDisposedRecognizer) {
            return;
        }
        if (disposing) {
            this.privDisposedRecognizer = true;
            await this.implRecognizerStop();
        }
        await super.dispose(disposing);
    }
    createRecognizerConfig(speechConfig) {
        return new RecognizerConfig(speechConfig, this.properties);
    }
    createServiceRecognizer(authentication, connectionFactory, audioConfig, recognizerConfig) {
        const configImpl = audioConfig;
        return new TranscriptionServiceRecognizer(authentication, connectionFactory, configImpl, recognizerConfig, this);
    }
}

//# sourceMappingURL=TranscriberRecognizer.js.map
