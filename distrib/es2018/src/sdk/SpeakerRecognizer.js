// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { Context, OS, SpeakerIdMessageAdapter, SpeakerRecognitionConfig, } from "../common.speech/Exports";
import { marshalPromiseToCallbacks } from "../common/Exports";
import { Contracts } from "./Contracts";
import { PropertyId, ResultReason, SpeakerIdentificationModel, SpeakerRecognitionResult, SpeakerRecognitionResultType, SpeakerVerificationModel, } from "./Exports";
/**
 * Defines SpeakerRecognizer class for Speaker Recognition
 * Handles operations from user for Voice Profile operations (e.g. createProfile, deleteProfile)
 * @class SpeakerRecognizer
 */
export class SpeakerRecognizer {
    /**
     * SpeakerRecognizer constructor.
     * @constructor
     * @param {SpeechConfig} speechConfig - An set of initial properties for this recognizer (authentication key, region, &c)
     */
    constructor(speechConfig, audioConfig) {
        const speechConfigImpl = speechConfig;
        Contracts.throwIfNull(speechConfigImpl, "speechConfig");
        this.privAudioConfigImpl = audioConfig;
        Contracts.throwIfNull(this.privAudioConfigImpl, "audioConfig");
        this.privProperties = speechConfigImpl.properties.clone();
        this.implSRSetup();
    }
    /**
     * Gets the authorization token used to communicate with the service.
     * @member SpeakerRecognizer.prototype.authorizationToken
     * @function
     * @public
     * @returns {string} Authorization token.
     */
    get authorizationToken() {
        return this.properties.getProperty(PropertyId.SpeechServiceAuthorization_Token);
    }
    /**
     * Gets/Sets the authorization token used to communicate with the service.
     * @member SpeakerRecognizer.prototype.authorizationToken
     * @function
     * @public
     * @param {string} token - Authorization token.
     */
    set authorizationToken(token) {
        Contracts.throwIfNullOrWhitespace(token, "token");
        this.properties.setProperty(PropertyId.SpeechServiceAuthorization_Token, token);
    }
    /**
     * The collection of properties and their values defined for this SpeakerRecognizer.
     * @member SpeakerRecognizer.prototype.properties
     * @function
     * @public
     * @returns {PropertyCollection} The collection of properties and their values defined for this SpeakerRecognizer.
     */
    get properties() {
        return this.privProperties;
    }
    /**
     * Get recognition result for model using given audio
     * @member SpeakerRecognizer.prototype.recognizeOnceAsync
     * @function
     * @public
     * @param {SpeakerIdentificationModel} model Model containing Voice Profiles to be identified
     * @param cb - Callback invoked once result is returned.
     * @param err - Callback invoked in case of an error.
     */
    recognizeOnceAsync(model, cb, err) {
        if (model instanceof SpeakerIdentificationModel) {
            const responsePromise = this.privAdapter.identifySpeaker(model, this.privAudioConfigImpl);
            marshalPromiseToCallbacks(this.getResult(responsePromise, SpeakerRecognitionResultType.Identify, undefined), cb, err);
        }
        else if (model instanceof SpeakerVerificationModel) {
            const responsePromise = this.privAdapter.verifySpeaker(model, this.privAudioConfigImpl);
            marshalPromiseToCallbacks(this.getResult(responsePromise, SpeakerRecognitionResultType.Verify, model.voiceProfile.profileId), cb, err);
        }
        else {
            throw new Error("SpeakerRecognizer.recognizeOnce: Unexpected model type");
        }
    }
    /**
     * Included for compatibility
     * @member SpeakerRecognizer.prototype.close
     * @function
     * @public
     */
    close() {
        return;
    }
    // Does class setup, swiped from Recognizer.
    implSRSetup() {
        let osPlatform = (typeof window !== "undefined") ? "Browser" : "Node";
        let osName = "unknown";
        let osVersion = "unknown";
        if (typeof navigator !== "undefined") {
            osPlatform = osPlatform + "/" + navigator.platform;
            osName = navigator.userAgent;
            osVersion = navigator.appVersion;
        }
        const recognizerConfig = new SpeakerRecognitionConfig(new Context(new OS(osPlatform, osName, osVersion)), this.privProperties);
        this.privAdapter = new SpeakerIdMessageAdapter(recognizerConfig);
    }
    async getResult(responsePromise, resultType, profileId) {
        const response = await responsePromise;
        return new SpeakerRecognitionResult(resultType, response.data, profileId, response.ok ? ResultReason.RecognizedSpeaker : ResultReason.Canceled);
    }
}

//# sourceMappingURL=SpeakerRecognizer.js.map