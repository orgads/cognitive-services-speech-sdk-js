// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { TranscriberRecognizer } from "../../common.speech/Exports";
import { marshalPromiseToCallbacks } from "../../common/Exports";
import { Contracts } from "../Contracts";
import { PropertyCollection, PropertyId, } from "../Exports";
export class ConversationTranscriber {
    /**
     * ConversationTranscriber constructor.
     * @constructor
     * @param {AudioConfig} audioConfig - An optional audio configuration associated with the recognizer
     */
    constructor(audioConfig) {
        this.privAudioConfig = audioConfig;
        this.privProperties = new PropertyCollection();
        this.privRecognizer = undefined;
        this.privDisposedRecognizer = false;
    }
    /**
     * @param {Conversation} converation - conversation to be recognized
     */
    joinConversationAsync(conversation, cb, err) {
        const conversationImpl = conversation;
        Contracts.throwIfNullOrUndefined(conversationImpl, "Conversation");
        // ref the conversation object
        // create recognizer and subscribe to recognizer events
        this.privRecognizer = new TranscriberRecognizer(conversation.config, this.privAudioConfig);
        Contracts.throwIfNullOrUndefined(this.privRecognizer, "Recognizer");
        this.privRecognizer.connectCallbacks(this);
        marshalPromiseToCallbacks(conversationImpl.connectTranscriberRecognizer(this.privRecognizer), cb, err);
    }
    /**
     * Gets the authorization token used to communicate with the service.
     * @member ConversationTranscriber.prototype.authorizationToken
     * @function
     * @public
     * @returns {string} Authorization token.
     */
    get authorizationToken() {
        return this.properties.getProperty(PropertyId.SpeechServiceAuthorization_Token);
    }
    /**
     * Gets/Sets the authorization token used to communicate with the service.
     * @member ConversationTranscriber.prototype.authorizationToken
     * @function
     * @public
     * @param {string} token - Authorization token.
     */
    set authorizationToken(token) {
        Contracts.throwIfNullOrWhitespace(token, "token");
        this.properties.setProperty(PropertyId.SpeechServiceAuthorization_Token, token);
    }
    /**
     * Gets the spoken language of recognition.
     * @member ConversationTranscriber.prototype.speechRecognitionLanguage
     * @function
     * @public
     * @returns {string} The spoken language of recognition.
     */
    get speechRecognitionLanguage() {
        Contracts.throwIfDisposed(this.privDisposedRecognizer);
        return this.properties.getProperty(PropertyId.SpeechServiceConnection_RecoLanguage);
    }
    /**
     * The collection of properties and their values defined for this ConversationTranscriber.
     * @member ConversationTranscriber.prototype.properties
     * @function
     * @public
     * @returns {PropertyCollection} The collection of properties and their values defined for this ConversationTranscriber.
     */
    get properties() {
        return this.privProperties;
    }
    /**
     * Starts conversation transcription, until stopTranscribingAsync() is called.
     * User must subscribe to events to receive transcription results.
     * @member ConversationTranscriber.prototype.startTranscribingAsync
     * @function
     * @public
     * @param cb - Callback invoked once the transcription has started.
     * @param err - Callback invoked in case of an error.
     */
    startTranscribingAsync(cb, err) {
        this.privRecognizer.startContinuousRecognitionAsync(cb, err);
    }
    /**
     * Starts conversation transcription, until stopTranscribingAsync() is called.
     * User must subscribe to events to receive transcription results.
     * @member ConversationTranscriber.prototype.stopTranscribingAsync
     * @function
     * @public
     * @param cb - Callback invoked once the transcription has started.
     * @param err - Callback invoked in case of an error.
     */
    stopTranscribingAsync(cb, err) {
        this.privRecognizer.stopContinuousRecognitionAsync(cb, err);
    }
    /**
     * Leave the current conversation. After this is called, you will no longer receive any events.
     */
    leaveConversationAsync(cb, err) {
        this.privRecognizer.disconnectCallbacks();
        marshalPromiseToCallbacks((async () => { return; })(), cb, err);
    }
    /**
     * closes all external resources held by an instance of this class.
     * @member ConversationTranscriber.prototype.close
     * @function
     * @public
     */
    close(cb, errorCb) {
        Contracts.throwIfDisposed(this.privDisposedRecognizer);
        marshalPromiseToCallbacks(this.dispose(true), cb, errorCb);
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
        }
    }
}

//# sourceMappingURL=ConversationTranscriber.js.map
