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
 * Translation recognizer
 * @class TranslationRecognizer
 */
var TranslationRecognizer = /** @class */ (function (_super) {
    __extends(TranslationRecognizer, _super);
    /**
     * Initializes an instance of the TranslationRecognizer.
     * @constructor
     * @param {SpeechTranslationConfig} speechConfig - Set of properties to configure this recognizer.
     * @param {AudioConfig} audioConfig - An optional audio config associated with the recognizer
     */
    function TranslationRecognizer(speechConfig, audioConfig) {
        var _this = this;
        var configImpl = speechConfig;
        Contracts_1.Contracts.throwIfNull(configImpl, "speechConfig");
        _this = _super.call(this, audioConfig, configImpl.properties, new Exports_1.TranslationConnectionFactory()) || this;
        _this.privDisposedTranslationRecognizer = false;
        _this.privProperties = configImpl.properties.clone();
        if (_this.properties.getProperty(Exports_3.PropertyId.SpeechServiceConnection_TranslationVoice, undefined) !== undefined) {
            Contracts_1.Contracts.throwIfNullOrWhitespace(_this.properties.getProperty(Exports_3.PropertyId.SpeechServiceConnection_TranslationVoice), Exports_3.PropertyId[Exports_3.PropertyId.SpeechServiceConnection_TranslationVoice]);
        }
        Contracts_1.Contracts.throwIfNullOrWhitespace(_this.properties.getProperty(Exports_3.PropertyId.SpeechServiceConnection_TranslationToLanguages), Exports_3.PropertyId[Exports_3.PropertyId.SpeechServiceConnection_TranslationToLanguages]);
        Contracts_1.Contracts.throwIfNullOrWhitespace(_this.properties.getProperty(Exports_3.PropertyId.SpeechServiceConnection_RecoLanguage), Exports_3.PropertyId[Exports_3.PropertyId.SpeechServiceConnection_RecoLanguage]);
        return _this;
    }
    Object.defineProperty(TranslationRecognizer.prototype, "speechRecognitionLanguage", {
        /**
         * Gets the language name that was set when the recognizer was created.
         * @member TranslationRecognizer.prototype.speechRecognitionLanguage
         * @function
         * @public
         * @returns {string} Gets the language name that was set when the recognizer was created.
         */
        get: function () {
            Contracts_1.Contracts.throwIfDisposed(this.privDisposedTranslationRecognizer);
            return this.properties.getProperty(Exports_3.PropertyId.SpeechServiceConnection_RecoLanguage);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TranslationRecognizer.prototype, "targetLanguages", {
        /**
         * Gets target languages for translation that were set when the recognizer was created.
         * The language is specified in BCP-47 format. The translation will provide translated text for each of language.
         * @member TranslationRecognizer.prototype.targetLanguages
         * @function
         * @public
         * @returns {string[]} Gets target languages for translation that were set when the recognizer was created.
         */
        get: function () {
            Contracts_1.Contracts.throwIfDisposed(this.privDisposedTranslationRecognizer);
            return this.properties.getProperty(Exports_3.PropertyId.SpeechServiceConnection_TranslationToLanguages).split(",");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TranslationRecognizer.prototype, "voiceName", {
        /**
         * Gets the name of output voice.
         * @member TranslationRecognizer.prototype.voiceName
         * @function
         * @public
         * @returns {string} the name of output voice.
         */
        get: function () {
            Contracts_1.Contracts.throwIfDisposed(this.privDisposedTranslationRecognizer);
            return this.properties.getProperty(Exports_3.PropertyId.SpeechServiceConnection_TranslationVoice, undefined);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TranslationRecognizer.prototype, "authorizationToken", {
        /**
         * Gets the authorization token used to communicate with the service.
         * @member TranslationRecognizer.prototype.authorizationToken
         * @function
         * @public
         * @returns {string} Authorization token.
         */
        get: function () {
            return this.properties.getProperty(Exports_3.PropertyId.SpeechServiceAuthorization_Token);
        },
        /**
         * Gets/Sets the authorization token used to communicate with the service.
         * @member TranslationRecognizer.prototype.authorizationToken
         * @function
         * @public
         * @param {string} value - Authorization token.
         */
        set: function (value) {
            this.properties.setProperty(Exports_3.PropertyId.SpeechServiceAuthorization_Token, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TranslationRecognizer.prototype, "properties", {
        /**
         * The collection of properties and their values defined for this TranslationRecognizer.
         * @member TranslationRecognizer.prototype.properties
         * @function
         * @public
         * @returns {PropertyCollection} The collection of properties and their values defined for this TranslationRecognizer.
         */
        get: function () {
            return this.privProperties;
        },
        enumerable: true,
        configurable: true
    });
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
    TranslationRecognizer.prototype.recognizeOnceAsync = function (cb, err) {
        Contracts_1.Contracts.throwIfDisposed(this.privDisposedTranslationRecognizer);
        Exports_2.marshalPromiseToCallbacks(this.recognizeOnceAsyncImpl(Exports_1.RecognitionMode.Conversation), cb, err);
    };
    /**
     * Starts recognition and translation, until stopContinuousRecognitionAsync() is called.
     * User must subscribe to events to receive translation results.
     * @member TranslationRecognizer.prototype.startContinuousRecognitionAsync
     * @function
     * @public
     * @param cb - Callback that received the translation has started.
     * @param err - Callback invoked in case of an error.
     */
    TranslationRecognizer.prototype.startContinuousRecognitionAsync = function (cb, err) {
        Exports_2.marshalPromiseToCallbacks(this.startContinuousRecognitionAsyncImpl(Exports_1.RecognitionMode.Conversation), cb, err);
    };
    /**
     * Stops continuous recognition and translation.
     * @member TranslationRecognizer.prototype.stopContinuousRecognitionAsync
     * @function
     * @public
     * @param cb - Callback that received the translation has stopped.
     * @param err - Callback invoked in case of an error.
     */
    TranslationRecognizer.prototype.stopContinuousRecognitionAsync = function (cb, err) {
        Exports_2.marshalPromiseToCallbacks(this.stopContinuousRecognitionAsyncImpl(), cb, err);
    };
    /**
     * closes all external resources held by an instance of this class.
     * @member TranslationRecognizer.prototype.close
     * @function
     * @public
     */
    TranslationRecognizer.prototype.close = function (cb, errorCb) {
        Contracts_1.Contracts.throwIfDisposed(this.privDisposedTranslationRecognizer);
        Exports_2.marshalPromiseToCallbacks(this.dispose(true), cb, errorCb);
    };
    TranslationRecognizer.prototype.dispose = function (disposing) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.privDisposedTranslationRecognizer) {
                            return [2 /*return*/];
                        }
                        this.privDisposedTranslationRecognizer = true;
                        if (!disposing) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.implRecognizerStop()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, _super.prototype.dispose.call(this, disposing)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TranslationRecognizer.prototype.createRecognizerConfig = function (speechConfig) {
        return new Exports_1.RecognizerConfig(speechConfig, this.properties);
    };
    TranslationRecognizer.prototype.createServiceRecognizer = function (authentication, connectionFactory, audioConfig, recognizerConfig) {
        var configImpl = audioConfig;
        return new Exports_1.TranslationServiceRecognizer(authentication, connectionFactory, configImpl, recognizerConfig, this);
    };
    return TranslationRecognizer;
}(Exports_3.Recognizer));
exports.TranslationRecognizer = TranslationRecognizer;

//# sourceMappingURL=TranslationRecognizer.js.map