"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
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
var Exports_1 = require("../common.speech/Exports");
var Exports_2 = require("../common/Exports");
var Contracts_1 = require("./Contracts");
var Exports_3 = require("./Exports");
/**
 * Defines VoiceProfileClient class for Speaker Recognition
 * Handles operations from user for Voice Profile operations (e.g. createProfile, deleteProfile)
 * @class VoiceProfileClient
 */
var VoiceProfileClient = /** @class */ (function () {
    /**
     * VoiceProfileClient constructor.
     * @constructor
     * @param {SpeechConfig} speechConfig - An set of initial properties for this synthesizer (authentication key, region, &c)
     */
    function VoiceProfileClient(speechConfig) {
        var speechConfigImpl = speechConfig;
        Contracts_1.Contracts.throwIfNull(speechConfigImpl, "speechConfig");
        this.privProperties = speechConfigImpl.properties.clone();
        this.implClientSetup();
    }
    Object.defineProperty(VoiceProfileClient.prototype, "authorizationToken", {
        /**
         * Gets the authorization token used to communicate with the service.
         * @member VoiceProfileClient.prototype.authorizationToken
         * @function
         * @public
         * @returns {string} Authorization token.
         */
        get: function () {
            return this.properties.getProperty(Exports_3.PropertyId.SpeechServiceAuthorization_Token);
        },
        /**
         * Gets/Sets the authorization token used to communicate with the service.
         * @member VoiceProfileClient.prototype.authorizationToken
         * @function
         * @public
         * @param {string} token - Authorization token.
         */
        set: function (token) {
            Contracts_1.Contracts.throwIfNullOrWhitespace(token, "token");
            this.properties.setProperty(Exports_3.PropertyId.SpeechServiceAuthorization_Token, token);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VoiceProfileClient.prototype, "properties", {
        /**
         * The collection of properties and their values defined for this VoiceProfileClient.
         * @member VoiceProfileClient.prototype.properties
         * @function
         * @public
         * @returns {PropertyCollection} The collection of properties and their values defined for this VoiceProfileClient.
         */
        get: function () {
            return this.privProperties;
        },
        enumerable: true,
        configurable: true
    });
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
    VoiceProfileClient.prototype.createProfileAsync = function (profileType, lang, cb, err) {
        var _this = this;
        Exports_2.marshalPromiseToCallbacks((function () { return __awaiter(_this, void 0, void 0, function () {
            var result, response, profile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.privAdapter.createProfile(profileType, lang)];
                    case 1:
                        result = _a.sent();
                        response = result.json();
                        profile = new Exports_3.VoiceProfile(response.profileId, profileType);
                        return [2 /*return*/, profile];
                }
            });
        }); })(), cb, err);
    };
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
    VoiceProfileClient.prototype.enrollProfileAsync = function (profile, audioConfig, cb, err) {
        var _this = this;
        var configImpl = audioConfig;
        Contracts_1.Contracts.throwIfNullOrUndefined(configImpl, "audioConfig");
        Exports_2.marshalPromiseToCallbacks((function () { return __awaiter(_this, void 0, void 0, function () {
            var result, ret;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.privAdapter.createEnrollment(profile, configImpl)];
                    case 1:
                        result = _a.sent();
                        ret = new Exports_3.VoiceProfileEnrollmentResult(result.ok ? Exports_3.ResultReason.EnrolledVoiceProfile : Exports_3.ResultReason.Canceled, result.data, result.statusText);
                        return [2 /*return*/, ret];
                }
            });
        }); })(), cb, err);
    };
    /**
     * Delete a speaker recognition voice profile
     * @member VoiceProfileClient.prototype.deleteProfileAsync
     * @function
     * @public
     * @param {VoiceProfile} profile Voice Profile to be deleted
     * @param cb - Callback invoked once Voice Profile has been deleted.
     * @param err - Callback invoked in case of an error.
     */
    VoiceProfileClient.prototype.deleteProfileAsync = function (profile, cb, err) {
        var _this = this;
        Exports_2.marshalPromiseToCallbacks((function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.privAdapter.deleteProfile(profile)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, this.getResult(result, Exports_3.ResultReason.DeletedVoiceProfile)];
                }
            });
        }); })(), cb, err);
    };
    /**
     * Remove all enrollments for a speaker recognition voice profile
     * @member VoiceProfileClient.prototype.resetProfileAsync
     * @function
     * @public
     * @param {VoiceProfile} profile Voice Profile to be reset
     * @param cb - Callback invoked once Voice Profile has been reset.
     * @param err - Callback invoked in case of an error.
     */
    VoiceProfileClient.prototype.resetProfileAsync = function (profile, cb, err) {
        var _this = this;
        Exports_2.marshalPromiseToCallbacks((function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.privAdapter.resetProfile(profile)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, this.getResult(result, Exports_3.ResultReason.ResetVoiceProfile)];
                }
            });
        }); })(), cb, err);
    };
    /**
     * Included for compatibility
     * @member VoiceProfileClient.prototype.close
     * @function
     * @public
     */
    VoiceProfileClient.prototype.close = function () {
        return;
    };
    // Does class setup, swiped from Recognizer.
    VoiceProfileClient.prototype.implClientSetup = function () {
        var osPlatform = (typeof window !== "undefined") ? "Browser" : "Node";
        var osName = "unknown";
        var osVersion = "unknown";
        if (typeof navigator !== "undefined") {
            osPlatform = osPlatform + "/" + navigator.platform;
            osName = navigator.userAgent;
            osVersion = navigator.appVersion;
        }
        var recognizerConfig = new Exports_1.SpeakerRecognitionConfig(new Exports_1.Context(new Exports_1.OS(osPlatform, osName, osVersion)), this.privProperties);
        this.privAdapter = new Exports_1.SpeakerIdMessageAdapter(recognizerConfig);
    };
    VoiceProfileClient.prototype.getResult = function (result, successReason, cb) {
        var response = new Exports_3.VoiceProfileResult(result.ok ? successReason : Exports_3.ResultReason.Canceled, result.statusText);
        return (response);
    };
    return VoiceProfileClient;
}());
exports.VoiceProfileClient = VoiceProfileClient;

//# sourceMappingURL=VoiceProfileClient.js.map