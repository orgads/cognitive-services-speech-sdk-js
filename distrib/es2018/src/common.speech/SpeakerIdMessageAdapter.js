import { RestConfigBase, RestMessageAdapter, RestRequestType, } from "../common.browser/Exports";
import { PropertyId, VoiceProfileType, } from "../sdk/Exports";
/**
 * Implements methods for speaker recognition classes, sending requests to endpoint
 * and parsing response into expected format
 * @class SpeakerIdMessageAdapter
 */
export class SpeakerIdMessageAdapter {
    constructor(config) {
        let endpoint = config.parameters.getProperty(PropertyId.SpeechServiceConnection_Endpoint, undefined);
        if (!endpoint) {
            const region = config.parameters.getProperty(PropertyId.SpeechServiceConnection_Region, "westus");
            const hostSuffix = (region && region.toLowerCase().startsWith("china")) ? ".azure.cn" : ".microsoft.com";
            const host = config.parameters.getProperty(PropertyId.SpeechServiceConnection_Host, "https://" + region + ".api.cognitive" + hostSuffix + "/speaker/{mode}/v2.0/{dependency}");
            endpoint = host + "/profiles";
        }
        this.privUri = endpoint;
        const options = RestConfigBase.requestOptions;
        options.headers[RestConfigBase.configParams.subscriptionKey] = config.parameters.getProperty(PropertyId.SpeechServiceConnection_Key, undefined);
        this.privRestAdapter = new RestMessageAdapter(options);
    }
    /**
     * Sends create profile request to endpoint.
     * @function
     * @param {VoiceProfileType} profileType - type of voice profile to create.
     * @param {string} lang - language/locale of voice profile
     * @public
     * @returns {Promise<IRestResponse>} promised rest response containing id of created profile.
     */
    createProfile(profileType, lang) {
        const uri = this.getOperationUri(profileType);
        this.privRestAdapter.setHeaders(RestConfigBase.configParams.contentTypeKey, "application/json");
        return this.privRestAdapter.request(RestRequestType.Post, uri, {}, { locale: lang });
    }
    /**
     * Sends create enrollment request to endpoint.
     * @function
     * @param {VoiceProfile} profileType - voice profile for which to create new enrollment.
     * @param {IAudioSource} audioSource - audioSource from which to pull data to send
     * @public
     * @returns {Promise<IRestResponse>} rest response to enrollment request.
     */
    createEnrollment(profile, audioSource) {
        this.privRestAdapter.setHeaders(RestConfigBase.configParams.contentTypeKey, "multipart/form-data");
        const uri = this.getOperationUri(profile.profileType) + "/" + profile.profileId + "/enrollments";
        return audioSource.blob.then((result) => {
            return this.privRestAdapter.request(RestRequestType.File, uri, { ignoreMinLength: "true" }, null, result);
        });
    }
    /**
     * Sends verification request to endpoint.
     * @function
     * @param {SpeakerVerificationModel} model - voice model to verify against.
     * @param {IAudioSource} audioSource - audioSource from which to pull data to send
     * @public
     * @returns {Promise<IRestResponse>} rest response to enrollment request.
     */
    async verifySpeaker(model, audioSource) {
        this.privRestAdapter.setHeaders(RestConfigBase.configParams.contentTypeKey, "multipart/form-data");
        const uri = this.getOperationUri(model.voiceProfile.profileType) + "/" + model.voiceProfile.profileId + "/verify";
        try {
            const result = await audioSource.blob;
            return this.privRestAdapter.request(RestRequestType.File, uri, { ignoreMinLength: "true" }, null, result);
        }
        catch (e) {
            return Promise.resolve({ data: e });
        }
    }
    /**
     * Sends identification request to endpoint.
     * @function
     * @param {SpeakerIdentificationModel} model - voice profiles against which to identify.
     * @param {IAudioSource} audioSource - audioSource from which to pull data to send
     * @public
     * @returns {Promise<IRestResponse>} rest response to enrollment request.
     */
    async identifySpeaker(model, audioSource) {
        this.privRestAdapter.setHeaders(RestConfigBase.configParams.contentTypeKey, "multipart/form-data");
        const uri = this.getOperationUri(VoiceProfileType.TextIndependentIdentification) + "/identifySingleSpeaker";
        try {
            const result = await audioSource.blob;
            return this.privRestAdapter.request(RestRequestType.File, uri, { profileIds: model.voiceProfileIds, ignoreMinLength: "true" }, null, result);
        }
        catch (e) {
            return Promise.resolve({ data: e });
        }
    }
    /**
     * Sends delete profile request to endpoint.
     * @function
     * @param {VoiceProfile} profile - voice profile to delete.
     * @public
     * @returns {Promise<IRestResponse>} rest response to deletion request
     */
    deleteProfile(profile) {
        const uri = this.getOperationUri(profile.profileType) + "/" + profile.profileId;
        return this.privRestAdapter.request(RestRequestType.Delete, uri, {});
    }
    /**
     * Sends reset profile request to endpoint.
     * @function
     * @param {VoiceProfile} profile - voice profile to reset enrollments for.
     * @public
     * @returns {Promise<IRestResponse>} rest response to reset request
     */
    resetProfile(profile) {
        const uri = this.getOperationUri(profile.profileType) + "/" + profile.profileId + "/reset";
        return this.privRestAdapter.request(RestRequestType.Post, uri, {});
    }
    getOperationUri(profileType) {
        const mode = profileType === VoiceProfileType.TextIndependentIdentification ? "identification" : "verification";
        const dependency = profileType === VoiceProfileType.TextDependentVerification ? "text-dependent" : "text-independent";
        return this.privUri.replace("{mode}", mode).replace("{dependency}", dependency);
    }
}

//# sourceMappingURL=SpeakerIdMessageAdapter.js.map