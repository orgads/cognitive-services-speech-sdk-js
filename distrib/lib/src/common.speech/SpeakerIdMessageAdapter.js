"use strict";
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
var Exports_1 = require("../common.browser/Exports");
var Exports_2 = require("../sdk/Exports");
/**
 * Implements methods for speaker recognition classes, sending requests to endpoint
 * and parsing response into expected format
 * @class SpeakerIdMessageAdapter
 */
var SpeakerIdMessageAdapter = /** @class */ (function () {
    function SpeakerIdMessageAdapter(config) {
        var endpoint = config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_Endpoint, undefined);
        if (!endpoint) {
            var region = config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_Region, "westus");
            var hostSuffix = (region && region.toLowerCase().startsWith("china")) ? ".azure.cn" : ".microsoft.com";
            var host = config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_Host, "https://" + region + ".api.cognitive" + hostSuffix + "/speaker/{mode}/v2.0/{dependency}");
            endpoint = host + "/profiles";
        }
        this.privUri = endpoint;
        var options = Exports_1.RestConfigBase.requestOptions;
        options.headers[Exports_1.RestConfigBase.configParams.subscriptionKey] = config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_Key, undefined);
        this.privRestAdapter = new Exports_1.RestMessageAdapter(options);
    }
    /**
     * Sends create profile request to endpoint.
     * @function
     * @param {VoiceProfileType} profileType - type of voice profile to create.
     * @param {string} lang - language/locale of voice profile
     * @public
     * @returns {Promise<IRestResponse>} promised rest response containing id of created profile.
     */
    SpeakerIdMessageAdapter.prototype.createProfile = function (profileType, lang) {
        var uri = this.getOperationUri(profileType);
        this.privRestAdapter.setHeaders(Exports_1.RestConfigBase.configParams.contentTypeKey, "application/json");
        return this.privRestAdapter.request(Exports_1.RestRequestType.Post, uri, {}, { locale: lang });
    };
    /**
     * Sends create enrollment request to endpoint.
     * @function
     * @param {VoiceProfile} profileType - voice profile for which to create new enrollment.
     * @param {IAudioSource} audioSource - audioSource from which to pull data to send
     * @public
     * @returns {Promise<IRestResponse>} rest response to enrollment request.
     */
    SpeakerIdMessageAdapter.prototype.createEnrollment = function (profile, audioSource) {
        var _this = this;
        this.privRestAdapter.setHeaders(Exports_1.RestConfigBase.configParams.contentTypeKey, "multipart/form-data");
        var uri = this.getOperationUri(profile.profileType) + "/" + profile.profileId + "/enrollments";
        return audioSource.blob.then(function (result) {
            return _this.privRestAdapter.request(Exports_1.RestRequestType.File, uri, { ignoreMinLength: "true" }, null, result);
        });
    };
    /**
     * Sends verification request to endpoint.
     * @function
     * @param {SpeakerVerificationModel} model - voice model to verify against.
     * @param {IAudioSource} audioSource - audioSource from which to pull data to send
     * @public
     * @returns {Promise<IRestResponse>} rest response to enrollment request.
     */
    SpeakerIdMessageAdapter.prototype.verifySpeaker = function (model, audioSource) {
        return __awaiter(this, void 0, void 0, function () {
            var uri, result, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.privRestAdapter.setHeaders(Exports_1.RestConfigBase.configParams.contentTypeKey, "multipart/form-data");
                        uri = this.getOperationUri(model.voiceProfile.profileType) + "/" + model.voiceProfile.profileId + "/verify";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, audioSource.blob];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, this.privRestAdapter.request(Exports_1.RestRequestType.File, uri, { ignoreMinLength: "true" }, null, result)];
                    case 3:
                        e_1 = _a.sent();
                        return [2 /*return*/, Promise.resolve({ data: e_1 })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sends identification request to endpoint.
     * @function
     * @param {SpeakerIdentificationModel} model - voice profiles against which to identify.
     * @param {IAudioSource} audioSource - audioSource from which to pull data to send
     * @public
     * @returns {Promise<IRestResponse>} rest response to enrollment request.
     */
    SpeakerIdMessageAdapter.prototype.identifySpeaker = function (model, audioSource) {
        return __awaiter(this, void 0, void 0, function () {
            var uri, result, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.privRestAdapter.setHeaders(Exports_1.RestConfigBase.configParams.contentTypeKey, "multipart/form-data");
                        uri = this.getOperationUri(Exports_2.VoiceProfileType.TextIndependentIdentification) + "/identifySingleSpeaker";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, audioSource.blob];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, this.privRestAdapter.request(Exports_1.RestRequestType.File, uri, { profileIds: model.voiceProfileIds, ignoreMinLength: "true" }, null, result)];
                    case 3:
                        e_2 = _a.sent();
                        return [2 /*return*/, Promise.resolve({ data: e_2 })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sends delete profile request to endpoint.
     * @function
     * @param {VoiceProfile} profile - voice profile to delete.
     * @public
     * @returns {Promise<IRestResponse>} rest response to deletion request
     */
    SpeakerIdMessageAdapter.prototype.deleteProfile = function (profile) {
        var uri = this.getOperationUri(profile.profileType) + "/" + profile.profileId;
        return this.privRestAdapter.request(Exports_1.RestRequestType.Delete, uri, {});
    };
    /**
     * Sends reset profile request to endpoint.
     * @function
     * @param {VoiceProfile} profile - voice profile to reset enrollments for.
     * @public
     * @returns {Promise<IRestResponse>} rest response to reset request
     */
    SpeakerIdMessageAdapter.prototype.resetProfile = function (profile) {
        var uri = this.getOperationUri(profile.profileType) + "/" + profile.profileId + "/reset";
        return this.privRestAdapter.request(Exports_1.RestRequestType.Post, uri, {});
    };
    SpeakerIdMessageAdapter.prototype.getOperationUri = function (profileType) {
        var mode = profileType === Exports_2.VoiceProfileType.TextIndependentIdentification ? "identification" : "verification";
        var dependency = profileType === Exports_2.VoiceProfileType.TextDependentVerification ? "text-dependent" : "text-independent";
        return this.privUri.replace("{mode}", mode).replace("{dependency}", dependency);
    };
    return SpeakerIdMessageAdapter;
}());
exports.SpeakerIdMessageAdapter = SpeakerIdMessageAdapter;

//# sourceMappingURL=SpeakerIdMessageAdapter.js.map