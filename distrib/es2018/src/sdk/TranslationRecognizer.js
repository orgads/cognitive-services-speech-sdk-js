// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { RecognitionMode, RecognizerConfig, TranslationConnectionFactory, TranslationServiceRecognizer, } from "../common.speech/Exports";
import { marshalPromiseToCallbacks } from "../common/Exports";
import { Contracts } from "./Contracts";
import { PropertyId, Recognizer, } from "./Exports";
/**
 * Translation recognizer
 * @class TranslationRecognizer
 */
export class TranslationRecognizer extends Recognizer {
    /**
     * Initializes an instance of the TranslationRecognizer.
     * @constructor
     * @param {SpeechTranslationConfig} speechConfig - Set of properties to configure this recognizer.
     * @param {AudioConfig} audioConfig - An optional audio config associated with the recognizer
     */
    constructor(speechConfig, audioConfig) {
        const configImpl = speechConfig;
        Contracts.throwIfNull(configImpl, "speechConfig");
        super(audioConfig, configImpl.properties, new TranslationConnectionFactory());
        this.privDisposedTranslationRecognizer = false;
        this.privProperties = configImpl.properties.clone();
        if (this.properties.getProperty(PropertyId.SpeechServiceConnection_TranslationVoice, undefined) !== undefined) {
            Contracts.throwIfNullOrWhitespace(this.properties.getProperty(PropertyId.SpeechServiceConnection_TranslationVoice), PropertyId[PropertyId.SpeechServiceConnection_TranslationVoice]);
        }
        Contracts.throwIfNullOrWhitespace(this.properties.getProperty(PropertyId.SpeechServiceConnection_TranslationToLanguages), PropertyId[PropertyId.SpeechServiceConnection_TranslationToLanguages]);
        Contracts.throwIfNullOrWhitespace(this.properties.getProperty(PropertyId.SpeechServiceConnection_RecoLanguage), PropertyId[PropertyId.SpeechServiceConnection_RecoLanguage]);
    }
    /**
     * Gets the language name that was set when the recognizer was created.
     * @member TranslationRecognizer.prototype.speechRecognitionLanguage
     * @function
     * @public
     * @returns {string} Gets the language name that was set when the recognizer was created.
     */
    get speechRecognitionLanguage() {
        Contracts.throwIfDisposed(this.privDisposedTranslationRecognizer);
        return this.properties.getProperty(PropertyId.SpeechServiceConnection_RecoLanguage);
    }
    /**
     * Gets target languages for translation that were set when the recognizer was created.
     * The language is specified in BCP-47 format. The translation will provide translated text for each of language.
     * @member TranslationRecognizer.prototype.targetLanguages
     * @function
     * @public
     * @returns {string[]} Gets target languages for translation that were set when the recognizer was created.
     */
    get targetLanguages() {
        Contracts.throwIfDisposed(this.privDisposedTranslationRecognizer);
        return this.properties.getProperty(PropertyId.SpeechServiceConnection_TranslationToLanguages).split(",");
    }
    /**
     * Gets the name of output voice.
     * @member TranslationRecognizer.prototype.voiceName
     * @function
     * @public
     * @returns {string} the name of output voice.
     */
    get voiceName() {
        Contracts.throwIfDisposed(this.privDisposedTranslationRecognizer);
        return this.properties.getProperty(PropertyId.SpeechServiceConnection_TranslationVoice, undefined);
    }
    /**
     * Gets the authorization token used to communicate with the service.
     * @member TranslationRecognizer.prototype.authorizationToken
     * @function
     * @public
     * @returns {string} Authorization token.
     */
    get authorizationToken() {
        return this.properties.getProperty(PropertyId.SpeechServiceAuthorization_Token);
    }
    /**
     * Gets/Sets the authorization token used to communicate with the service.
     * @member TranslationRecognizer.prototype.authorizationToken
     * @function
     * @public
     * @param {string} value - Authorization token.
     */
    set authorizationToken(value) {
        this.properties.setProperty(PropertyId.SpeechServiceAuthorization_Token, value);
    }
    /**
     * The collection of properties and their values defined for this TranslationRecognizer.
     * @member TranslationRecognizer.prototype.properties
     * @function
     * @public
     * @returns {PropertyCollection} The collection of properties and their values defined for this TranslationRecognizer.
     */
    get properties() {
        return this.privProperties;
    }
    /**
     * Starts recognition and translation, and stops after the first utterance is recognized.
     * The task returns the translation text as result.
     * Note: recognizeOnceAsync returns when the first utterance has been recognized, so it is suitableonly
     *       for single shot recognition like command or query. For long-running recognition,
     *       use startContinuousRecognitionAsync() instead.
     * @member TranslationRecognizer.prototype.recognizeOnceAsync
     * @function
     * @public
     * @param cb - Callback that received the result when the translation has completed.
     * @param err - Callback invoked in case of an error.
     */
    recognizeOnceAsync(cb, err) {
        Contracts.throwIfDisposed(this.privDisposedTranslationRecognizer);
        marshalPromiseToCallbacks(this.recognizeOnceAsyncImpl(RecognitionMode.Conversation), cb, err);
    }
    /**
     * Starts recognition and translation, until stopContinuousRecognitionAsync() is called.
     * User must subscribe to events to receive translation results.
     * @member TranslationRecognizer.prototype.startContinuousRecognitionAsync
     * @function
     * @public
     * @param cb - Callback that received the translation has started.
     * @param err - Callback invoked in case of an error.
     */
    startContinuousRecognitionAsync(cb, err) {
        marshalPromiseToCallbacks(this.startContinuousRecognitionAsyncImpl(RecognitionMode.Conversation), cb, err);
    }
    /**
     * Stops continuous recognition and translation.
     * @member TranslationRecognizer.prototype.stopContinuousRecognitionAsync
     * @function
     * @public
     * @param cb - Callback that received the translation has stopped.
     * @param err - Callback invoked in case of an error.
     */
    stopContinuousRecognitionAsync(cb, err) {
        marshalPromiseToCallbacks(this.stopContinuousRecognitionAsyncImpl(), cb, err);
    }
    /**
     * closes all external resources held by an instance of this class.
     * @member TranslationRecognizer.prototype.close
     * @function
     * @public
     */
    close(cb, errorCb) {
        Contracts.throwIfDisposed(this.privDisposedTranslationRecognizer);
        marshalPromiseToCallbacks(this.dispose(true), cb, errorCb);
    }
    async dispose(disposing) {
        if (this.privDisposedTranslationRecognizer) {
            return;
        }
        this.privDisposedTranslationRecognizer = true;
        if (disposing) {
            await this.implRecognizerStop();
            await super.dispose(disposing);
        }
    }
    createRecognizerConfig(speechConfig) {
        return new RecognizerConfig(speechConfig, this.properties);
    }
    createServiceRecognizer(authentication, connectionFactory, audioConfig, recognizerConfig) {
        const configImpl = audioConfig;
        return new TranslationServiceRecognizer(authentication, connectionFactory, configImpl, recognizerConfig, this);
    }
}

//# sourceMappingURL=TranslationRecognizer.js.map