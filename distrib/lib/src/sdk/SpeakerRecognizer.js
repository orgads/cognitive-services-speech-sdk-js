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
 * Defines SpeakerRecognizer class for Speaker Recognition
 * Handles operations from user for Voice Profile operations (e.g. createProfile, deleteProfile)
 * @class SpeakerRecognizer
 */
var SpeakerRecognizer = /** @class */ (function () {
    /**
     * SpeakerRecognizer constructor.
     * @constructor
     * @param {SpeechConfig} speechConfig - An set of initial properties for this recognizer (authentication key, region, &c)
     */
    function SpeakerRecognizer(speechConfig, audioConfig) {
        var speechConfigImpl = speechConfig;
        Contracts_1.Contracts.throwIfNull(speechConfigImpl, "speechConfig");
        this.privAudioConfigImpl = audioConfig;
        Contracts_1.Contracts.throwIfNull(this.privAudioConfigImpl, "audioConfig");
        this.privProperties = speechConfigImpl.properties.clone();
        this.implSRSetup();
    }
    Object.defineProperty(SpeakerRecognizer.prototype, "authorizationToken", {
        /**
         * Gets the authorization token used to communicate with the service.
         * @member SpeakerRecognizer.prototype.authorizationToken
         * @function
         * @public
         * @returns {string} Authorization token.
         */
        get: function () {
            return this.properties.getProperty(Exports_3.PropertyId.SpeechServiceAuthorization_Token);
        },
        /**
         * Gets/Sets the authorization token used to communicate with the service.
         * @member SpeakerRecognizer.prototype.authorizationToken
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
    Object.defineProperty(SpeakerRecognizer.prototype, "properties", {
        /**
         * The collection of properties and their values defined for this SpeakerRecognizer.
         * @member SpeakerRecognizer.prototype.properties
         * @function
         * @public
         * @returns {PropertyCollection} The collection of properties and their values defined for this SpeakerRecognizer.
         */
        get: function () {
            return this.privProperties;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get recognition result for model using given audio
     * @member SpeakerRecognizer.prototype.recognizeOnceAsync
     * @function
     * @public
     * @param {SpeakerIdentificationModel} model Model containing Voice Profiles to be identified
     * @param cb - Callback invoked once result is returned.
     * @param err - Callback invoked in case of an error.
     */
    SpeakerRecognizer.prototype.recognizeOnceAsync = function (model, cb, err) {
        if (model instanceof Exports_3.SpeakerIdentificationModel) {
            var responsePromise = this.privAdapter.identifySpeaker(model, this.privAudioConfigImpl);
            Exports_2.marshalPromiseToCallbacks(this.getResult(responsePromise, Exports_3.SpeakerRecognitionResultType.Identify, undefined), cb, err);
        }
        else if (model instanceof Exports_3.SpeakerVerificationModel) {
            var responsePromise = this.privAdapter.verifySpeaker(model, this.privAudioConfigImpl);
            Exports_2.marshalPromiseToCallbacks(this.getResult(responsePromise, Exports_3.SpeakerRecognitionResultType.Verify, model.voiceProfile.profileId), cb, err);
        }
        else {
            throw new Error("SpeakerRecognizer.recognizeOnce: Unexpected model type");
        }
    };
    /**
     * Included for compatibility
     * @member SpeakerRecognizer.prototype.close
     * @function
     * @public
     */
    SpeakerRecognizer.prototype.close = function () {
        return;
    };
    // Does class setup, swiped from Recognizer.
    SpeakerRecognizer.prototype.implSRSetup = function () {
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
    SpeakerRecognizer.prototype.getResult = function (responsePromise, resultType, profileId) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, responsePromise];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, new Exports_3.SpeakerRecognitionResult(resultType, response.data, profileId, response.ok ? Exports_3.ResultReason.RecognizedSpeaker : Exports_3.ResultReason.Canceled)];
                }
            });
        });
    };
    return SpeakerRecognizer;
}());
exports.SpeakerRecognizer = SpeakerRecognizer;

//# sourceMappingURL=SpeakerRecognizer.js.map