"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
 * Performs speech recognition from microphone, file, or other audio input streams, and gets transcribed text as result.
 * @class SpeechRecognizer
 */
var SpeechRecognizer = /** @class */ (function (_super) {
    __extends(SpeechRecognizer, _super);
    /**
     * SpeechRecognizer constructor.
     * @constructor
     * @param {SpeechConfig} speechConfig - an set of initial properties for this recognizer
     * @param {AudioConfig} audioConfig - An optional audio configuration associated with the recognizer
     */
    function SpeechRecognizer(speechConfig, audioConfig) {
        var _this = this;
        var speechConfigImpl = speechConfig;
        Contracts_1.Contracts.throwIfNull(speechConfigImpl, "speechConfig");
        Contracts_1.Contracts.throwIfNullOrWhitespace(speechConfigImpl.properties.getProperty(Exports_3.PropertyId.SpeechServiceConnection_RecoLanguage), Exports_3.PropertyId[Exports_3.PropertyId.SpeechServiceConnection_RecoLanguage]);
        _this = _super.call(this, audioConfig, speechConfigImpl.properties, new Exports_1.SpeechConnectionFactory()) || this;
        _this.privDisposedRecognizer = false;
        return _this;
    }
    /**
     * SpeechRecognizer constructor.
     * @constructor
     * @param {SpeechConfig} speechConfig - an set of initial properties for this recognizer
     * @param {AutoDetectSourceLanguageConfig} autoDetectSourceLanguageConfig - An source language detection configuration associated with the recognizer
     * @param {AudioConfig} audioConfig - An optional audio configuration associated with the recognizer
     */
    SpeechRecognizer.FromConfig = function (speechConfig, autoDetectSourceLanguageConfig, audioConfig) {
        var speechConfigImpl = speechConfig;
        autoDetectSourceLanguageConfig.properties.mergeTo(speechConfigImpl.properties);
        var recognizer = new SpeechRecognizer(speechConfig, audioConfig);
        return recognizer;
    };
    Object.defineProperty(SpeechRecognizer.prototype, "endpointId", {
        /**
         * Gets the endpoint id of a customized speech model that is used for speech recognition.
         * @member SpeechRecognizer.prototype.endpointId
         * @function
         * @public
         * @returns {string} the endpoint id of a customized speech model that is used for speech recognition.
         */
        get: function () {
            Contracts_1.Contracts.throwIfDisposed(this.privDisposedRecognizer);
            return this.properties.getProperty(Exports_3.PropertyId.SpeechServiceConnection_EndpointId, "00000000-0000-0000-0000-000000000000");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechRecognizer.prototype, "authorizationToken", {
        /**
         * Gets the authorization token used to communicate with the service.
         * @member SpeechRecognizer.prototype.authorizationToken
         * @function
         * @public
         * @returns {string} Authorization token.
         */
        get: function () {
            return this.properties.getProperty(Exports_3.PropertyId.SpeechServiceAuthorization_Token);
        },
        /**
         * Gets/Sets the authorization token used to communicate with the service.
         * @member SpeechRecognizer.prototype.authorizationToken
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
    Object.defineProperty(SpeechRecognizer.prototype, "speechRecognitionLanguage", {
        /**
         * Gets the spoken language of recognition.
         * @member SpeechRecognizer.prototype.speechRecognitionLanguage
         * @function
         * @public
         * @returns {string} The spoken language of recognition.
         */
        get: function () {
            Contracts_1.Contracts.throwIfDisposed(this.privDisposedRecognizer);
            return this.properties.getProperty(Exports_3.PropertyId.SpeechServiceConnection_RecoLanguage);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechRecognizer.prototype, "outputFormat", {
        /**
         * Gets the output format of recognition.
         * @member SpeechRecognizer.prototype.outputFormat
         * @function
         * @public
         * @returns {OutputFormat} The output format of recognition.
         */
        get: function () {
            Contracts_1.Contracts.throwIfDisposed(this.privDisposedRecognizer);
            if (this.properties.getProperty(Exports_1.OutputFormatPropertyName, Exports_3.OutputFormat[Exports_3.OutputFormat.Simple]) === Exports_3.OutputFormat[Exports_3.OutputFormat.Simple]) {
                return Exports_3.OutputFormat.Simple;
            }
            else {
                return Exports_3.OutputFormat.Detailed;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechRecognizer.prototype, "properties", {
        /**
         * The collection of properties and their values defined for this SpeechRecognizer.
         * @member SpeechRecognizer.prototype.properties
         * @function
         * @public
         * @returns {PropertyCollection} The collection of properties and their values defined for this SpeechRecognizer.
         */
        get: function () {
            return this.privProperties;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Starts speech recognition, and stops after the first utterance is recognized.
     * The task returns the recognition text as result.
     * Note: RecognizeOnceAsync() returns when the first utterance has been recognized,
     *       so it is suitable only for single shot recognition
     *       like command or query. For long-running recognition, use StartContinuousRecognitionAsync() instead.
     * @member SpeechRecognizer.prototype.recognizeOnceAsync
     * @function
     * @public
     * @param cb - Callback that received the SpeechRecognitionResult.
     * @param err - Callback invoked in case of an error.
     */
    SpeechRecognizer.prototype.recognizeOnceAsync = function (cb, err) {
        Exports_2.marshalPromiseToCallbacks(this.recognizeOnceAsyncImpl(Exports_1.RecognitionMode.Interactive), cb, err);
    };
    /**
     * Starts speech recognition, until stopContinuousRecognitionAsync() is called.
     * User must subscribe to events to receive recognition results.
     * @member SpeechRecognizer.prototype.startContinuousRecognitionAsync
     * @function
     * @public
     * @param cb - Callback invoked once the recognition has started.
     * @param err - Callback invoked in case of an error.
     */
    SpeechRecognizer.prototype.startContinuousRecognitionAsync = function (cb, err) {
        Exports_2.marshalPromiseToCallbacks(this.startContinuousRecognitionAsyncImpl(Exports_1.RecognitionMode.Conversation), cb, err);
    };
    /**
     * Stops continuous speech recognition.
     * @member SpeechRecognizer.prototype.stopContinuousRecognitionAsync
     * @function
     * @public
     * @param cb - Callback invoked once the recognition has stopped.
     * @param err - Callback invoked in case of an error.
     */
    SpeechRecognizer.prototype.stopContinuousRecognitionAsync = function (cb, err) {
        Exports_2.marshalPromiseToCallbacks(this.stopContinuousRecognitionAsyncImpl(), cb, err);
    };
    /**
     * Starts speech recognition with keyword spotting, until
     * stopKeywordRecognitionAsync() is called.
     * User must subscribe to events to receive recognition results.
     * Note: Key word spotting functionality is only available on the
     *      Speech Devices SDK. This functionality is currently not included in the SDK itself.
     * @member SpeechRecognizer.prototype.startKeywordRecognitionAsync
     * @function
     * @public
     * @param {KeywordRecognitionModel} model The keyword recognition model that
     *        specifies the keyword to be recognized.
     * @param cb - Callback invoked once the recognition has started.
     * @param err - Callback invoked in case of an error.
     */
    SpeechRecognizer.prototype.startKeywordRecognitionAsync = function (model, cb, err) {
        Contracts_1.Contracts.throwIfNull(model, "model");
        if (!!err) {
            err("Not yet implemented.");
        }
    };
    /**
     * Stops continuous speech recognition.
     * Note: Key word spotting functionality is only available on the
     *       Speech Devices SDK. This functionality is currently not included in the SDK itself.
     * @member SpeechRecognizer.prototype.stopKeywordRecognitionAsync
     * @function
     * @public
     * @param cb - Callback invoked once the recognition has stopped.
     * @param err - Callback invoked in case of an error.
     */
    SpeechRecognizer.prototype.stopKeywordRecognitionAsync = function (cb, err) {
        if (!!cb) {
            cb();
        }
    };
    /**
     * closes all external resources held by an instance of this class.
     * @member SpeechRecognizer.prototype.close
     * @function
     * @public
     */
    SpeechRecognizer.prototype.close = function (cb, errorCb) {
        Contracts_1.Contracts.throwIfDisposed(this.privDisposedRecognizer);
        Exports_2.marshalPromiseToCallbacks(this.dispose(true), cb, errorCb);
    };
    /**
     * Disposes any resources held by the object.
     * @member SpeechRecognizer.prototype.dispose
     * @function
     * @public
     * @param {boolean} disposing - true if disposing the object.
     */
    SpeechRecognizer.prototype.dispose = function (disposing) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.privDisposedRecognizer) {
                            return [2 /*return*/];
                        }
                        if (!disposing) return [3 /*break*/, 2];
                        this.privDisposedRecognizer = true;
                        return [4 /*yield*/, this.implRecognizerStop()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, _super.prototype.dispose.call(this, disposing)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SpeechRecognizer.prototype.createRecognizerConfig = function (speechConfig) {
        return new Exports_1.RecognizerConfig(speechConfig, this.properties);
    };
    SpeechRecognizer.prototype.createServiceRecognizer = function (authentication, connectionFactory, audioConfig, recognizerConfig) {
        var configImpl = audioConfig;
        return new Exports_1.SpeechServiceRecognizer(authentication, connectionFactory, configImpl, recognizerConfig, this);
    };
    return SpeechRecognizer;
}(Exports_3.Recognizer));
exports.SpeechRecognizer = SpeechRecognizer;

//# sourceMappingURL=SpeechRecognizer.js.map