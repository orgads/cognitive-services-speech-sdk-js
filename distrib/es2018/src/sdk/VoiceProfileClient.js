// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { Context, OS, SpeakerIdMessageAdapter, SpeakerRecognitionConfig, } from "../common.speech/Exports";
import { marshalPromiseToCallbacks } from "../common/Exports";
import { Contracts } from "./Contracts";
import { PropertyId, ResultReason, VoiceProfile, VoiceProfileEnrollmentResult, VoiceProfileResult, } from "./Exports";
/**
 * Defines VoiceProfileClient class for Speaker Recognition
 * Handles operations from user for Voice Profile operations (e.g. createProfile, deleteProfile)
 * @class VoiceProfileClient
 */
export class VoiceProfileClient {
    /**
     * VoiceProfileClient constructor.
     * @constructor
     * @param {SpeechConfig} speechConfig - An set of initial properties for this synthesizer (authentication key, region, &c)
     */
    constructor(speechConfig) {
        const speechConfigImpl = speechConfig;
        Contracts.throwIfNull(speechConfigImpl, "speechConfig");
        this.privProperties = speechConfigImpl.properties.clone();
        this.implClientSetup();
    }
    /**
     * Gets the authorization token used to communicate with the service.
     * @member VoiceProfileClient.prototype.authorizationToken
     * @function
     * @public
     * @returns {string} Authorization token.
     */
    get authorizationToken() {
        return this.properties.getProperty(PropertyId.SpeechServiceAuthorization_Token);
    }
    /**
     * Gets/Sets the authorization token used to communicate with the service.
     * @member VoiceProfileClient.prototype.authorizationToken
     * @function
     * @public
     * @param {string} token - Authorization token.
     */
    set authorizationToken(token) {
        Contracts.throwIfNullOrWhitespace(token, "token");
        this.properties.setProperty(PropertyId.SpeechServiceAuthorization_Token, token);
    }
    /**
     * The collection of properties and their values defined for this VoiceProfileClient.
     * @member VoiceProfileClient.prototype.properties
     * @function
     * @public
     * @returns {PropertyCollection} The collection of properties and their values defined for this VoiceProfileClient.
     */
    get properties() {
        return this.privProperties;
    }
    /**
     * Create a speaker recognition voice profile
     * @member VoiceProfileClient.prototype.createProfileAsync
     * @function
     * @public
     * @param {VoiceProfileType} profileType Type of Voice Profile to be created
     *        specifies the keyword to be recognized.
     * @param {string} lang Language string (locale) for Voice Profile
     * @param cb - Callback invoked once Voice Profile has been created.
     * @param err - Callback invoked in case of an error.
     */
    createProfileAsync(profileType, lang, cb, err) {
        marshalPromiseToCallbacks((async () => {
            const result = await this.privAdapter.createProfile(profileType, lang);
            const response = result.json();
            const profile = new VoiceProfile(response.profileId, profileType);
            return profile;
        })(), cb, err);
    }
    /**
     * Create a speaker recognition voice profile
     * @member VoiceProfileClient.prototype.enrollProfileAsync
     * @function
     * @public
     * @param {VoiceProfile} profile Voice Profile to create enrollment for
     * @param {AudioConfig} audioConfig source info from which to create enrollment
     * @param cb - Callback invoked once Enrollment request has been submitted.
     * @param err - Callback invoked in case of an error.
     */
    enrollProfileAsync(profile, audioConfig, cb, err) {
        const configImpl = audioConfig;
        Contracts.throwIfNullOrUndefined(configImpl, "audioConfig");
        marshalPromiseToCallbacks((async () => {
            const result = await this.privAdapter.createEnrollment(profile, configImpl);
            const ret = new VoiceProfileEnrollmentResult(result.ok ? ResultReason.EnrolledVoiceProfile : ResultReason.Canceled, result.data, result.statusText);
            return ret;
        })(), cb, err);
    }
    /**
     * Delete a speaker recognition voice profile
     * @member VoiceProfileClient.prototype.deleteProfileAsync
     * @function
     * @public
     * @param {VoiceProfile} profile Voice Profile to be deleted
     * @param cb - Callback invoked once Voice Profile has been deleted.
     * @param err - Callback invoked in case of an error.
     */
    deleteProfileAsync(profile, cb, err) {
        marshalPromiseToCallbacks((async () => {
            const result = await this.privAdapter.deleteProfile(profile);
            return this.getResult(result, ResultReason.DeletedVoiceProfile);
        })(), cb, err);
    }
    /**
     * Remove all enrollments for a speaker recognition voice profile
     * @member VoiceProfileClient.prototype.resetProfileAsync
     * @function
     * @public
     * @param {VoiceProfile} profile Voice Profile to be reset
     * @param cb - Callback invoked once Voice Profile has been reset.
     * @param err - Callback invoked in case of an error.
     */
    resetProfileAsync(profile, cb, err) {
        marshalPromiseToCallbacks((async () => {
            const result = await this.privAdapter.resetProfile(profile);
            return this.getResult(result, ResultReason.ResetVoiceProfile);
        })(), cb, err);
    }
    /**
     * Included for compatibility
     * @member VoiceProfileClient.prototype.close
     * @function
     * @public
     */
    close() {
        return;
    }
    // Does class setup, swiped from Recognizer.
    implClientSetup() {
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
    getResult(result, successReason, cb) {
        const response = new VoiceProfileResult(result.ok ? successReason : ResultReason.Canceled, result.statusText);
        return (response);
    }
}

//# sourceMappingURL=VoiceProfileClient.js.map