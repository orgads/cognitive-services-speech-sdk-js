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
var AudioFileWriter_1 = require("./Audio/AudioFileWriter");
var AudioOutputFormat_1 = require("./Audio/AudioOutputFormat");
var AudioOutputStream_1 = require("./Audio/AudioOutputStream");
var Contracts_1 = require("./Contracts");
var Exports_3 = require("./Exports");
/**
 * Defines the class SpeechSynthesizer for text to speech.
 * Added in version 1.11.0
 * @class SpeechSynthesizer
 */
var SpeechSynthesizer = /** @class */ (function () {
    /**
     * SpeechSynthesizer constructor.
     * @constructor
     * @param {SpeechConfig} speechConfig - An set of initial properties for this synthesizer.
     * @param {AudioConfig} audioConfig - An optional audio configuration associated with the synthesizer.
     */
    function SpeechSynthesizer(speechConfig, audioConfig) {
        var speechConfigImpl = speechConfig;
        Contracts_1.Contracts.throwIfNull(speechConfigImpl, "speechConfig");
        if (audioConfig !== null) {
            if (audioConfig === undefined) {
                this.audioConfig = (typeof window === "undefined") ? undefined : Exports_3.AudioConfig.fromDefaultSpeakerOutput();
            }
            else {
                this.audioConfig = audioConfig;
            }
        }
        this.privProperties = speechConfigImpl.properties.clone();
        this.privDisposed = false;
        this.privSynthesizing = false;
        this.privConnectionFactory = new Exports_1.SpeechSynthesisConnectionFactory();
        this.synthesisRequestQueue = new Exports_2.Queue();
        this.implCommonSynthesizeSetup();
    }
    Object.defineProperty(SpeechSynthesizer.prototype, "authorizationToken", {
        /**
         * Gets the authorization token used to communicate with the service.
         * @member SpeechSynthesizer.prototype.authorizationToken
         * @function
         * @public
         * @returns {string} Authorization token.
         */
        get: function () {
            return this.properties.getProperty(Exports_3.PropertyId.SpeechServiceAuthorization_Token);
        },
        /**
         * Gets/Sets the authorization token used to communicate with the service.
         * @member SpeechSynthesizer.prototype.authorizationToken
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
    Object.defineProperty(SpeechSynthesizer.prototype, "properties", {
        /**
         * The collection of properties and their values defined for this SpeechSynthesizer.
         * @member SpeechSynthesizer.prototype.properties
         * @function
         * @public
         * @returns {PropertyCollection} The collection of properties and their values defined for this SpeechSynthesizer.
         */
        get: function () {
            return this.privProperties;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechSynthesizer.prototype, "autoDetectSourceLanguage", {
        /**
         * Indicates if auto detect source language is enabled
         * @member SpeechSynthesizer.prototype.properties
         * @function
         * @public
         * @returns {boolean} if auto detect source language is enabled
         */
        get: function () {
            return this.properties.getProperty(Exports_3.PropertyId.SpeechServiceConnection_AutoDetectSourceLanguages) === Exports_1.AutoDetectSourceLanguagesOpenRangeOptionName;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * SpeechSynthesizer constructor.
     * @constructor
     * @param {SpeechConfig} speechConfig - an set of initial properties for this synthesizer
     * @param {AutoDetectSourceLanguageConfig} autoDetectSourceLanguageConfig - An source language detection configuration associated with the synthesizer
     * @param {AudioConfig} audioConfig - An optional audio configuration associated with the synthesizer
     */
    SpeechSynthesizer.FromConfig = function (speechConfig, autoDetectSourceLanguageConfig, audioConfig) {
        var speechConfigImpl = speechConfig;
        autoDetectSourceLanguageConfig.properties.mergeTo(speechConfigImpl.properties);
        return new SpeechSynthesizer(speechConfig, audioConfig);
    };
    SpeechSynthesizer.prototype.buildSsml = function (text) {
        var _a;
        var languageToDefaultVoice = (_a = {},
            _a["ar-EG"] = "Microsoft Server Speech Text to Speech Voice (ar-EG, Hoda)",
            _a["ar-SA"] = "Microsoft Server Speech Text to Speech Voice (ar-SA, Naayf)",
            _a["bg-BG"] = "Microsoft Server Speech Text to Speech Voice (bg-BG, Ivan)",
            _a["ca-ES"] = "Microsoft Server Speech Text to Speech Voice (ca-ES, HerenaRUS)",
            _a["cs-CZ"] = "Microsoft Server Speech Text to Speech Voice (cs-CZ, Jakub)",
            _a["da-DK"] = "Microsoft Server Speech Text to Speech Voice (da-DK, HelleRUS)",
            _a["de-AT"] = "Microsoft Server Speech Text to Speech Voice (de-AT, Michael)",
            _a["de-CH"] = "Microsoft Server Speech Text to Speech Voice (de-CH, Karsten)",
            _a["de-DE"] = "Microsoft Server Speech Text to Speech Voice (de-DE, HeddaRUS)",
            _a["el-GR"] = "Microsoft Server Speech Text to Speech Voice (el-GR, Stefanos)",
            _a["en-AU"] = "Microsoft Server Speech Text to Speech Voice (en-AU, HayleyRUS)",
            _a["en-CA"] = "Microsoft Server Speech Text to Speech Voice (en-CA, HeatherRUS)",
            _a["en-GB"] = "Microsoft Server Speech Text to Speech Voice (en-GB, HazelRUS)",
            _a["en-IE"] = "Microsoft Server Speech Text to Speech Voice (en-IE, Sean)",
            _a["en-IN"] = "Microsoft Server Speech Text to Speech Voice (en-IN, PriyaRUS)",
            _a["en-US"] = "Microsoft Server Speech Text to Speech Voice (en-US, AriaRUS)",
            _a["es-ES"] = "Microsoft Server Speech Text to Speech Voice (es-ES, HelenaRUS)",
            _a["es-MX"] = "Microsoft Server Speech Text to Speech Voice (es-MX, HildaRUS)",
            _a["fi-FI"] = "Microsoft Server Speech Text to Speech Voice (fi-FI, HeidiRUS)",
            _a["fr-CA"] = "Microsoft Server Speech Text to Speech Voice (fr-CA, HarmonieRUS)",
            _a["fr-CH"] = "Microsoft Server Speech Text to Speech Voice (fr-CH, Guillaume)",
            _a["fr-FR"] = "Microsoft Server Speech Text to Speech Voice (fr-FR, HortenseRUS)",
            _a["he-IL"] = "Microsoft Server Speech Text to Speech Voice (he-IL, Asaf)",
            _a["hi-IN"] = "Microsoft Server Speech Text to Speech Voice (hi-IN, Kalpana)",
            _a["hr-HR"] = "Microsoft Server Speech Text to Speech Voice (hr-HR, Matej)",
            _a["hu-HU"] = "Microsoft Server Speech Text to Speech Voice (hu-HU, Szabolcs)",
            _a["id-ID"] = "Microsoft Server Speech Text to Speech Voice (id-ID, Andika)",
            _a["it-IT"] = "Microsoft Server Speech Text to Speech Voice (it-IT, LuciaRUS)",
            _a["ja-JP"] = "Microsoft Server Speech Text to Speech Voice (ja-JP, HarukaRUS)",
            _a["ko-KR"] = "Microsoft Server Speech Text to Speech Voice (ko-KR, HeamiRUS)",
            _a["ms-MY"] = "Microsoft Server Speech Text to Speech Voice (ms-MY, Rizwan)",
            _a["nb-NO"] = "Microsoft Server Speech Text to Speech Voice (nb-NO, HuldaRUS)",
            _a["nl-NL"] = "Microsoft Server Speech Text to Speech Voice (nl-NL, HannaRUS)",
            _a["pl-PL"] = "Microsoft Server Speech Text to Speech Voice (pl-PL, PaulinaRUS)",
            _a["pt-BR"] = "Microsoft Server Speech Text to Speech Voice (pt-BR, HeloisaRUS)",
            _a["pt-PT"] = "Microsoft Server Speech Text to Speech Voice (pt-PT, HeliaRUS)",
            _a["ro-RO"] = "Microsoft Server Speech Text to Speech Voice (ro-RO, Andrei)",
            _a["ru-RU"] = "Microsoft Server Speech Text to Speech Voice (ru-RU, EkaterinaRUS)",
            _a["sk-SK"] = "Microsoft Server Speech Text to Speech Voice (sk-SK, Filip)",
            _a["sl-SI"] = "Microsoft Server Speech Text to Speech Voice (sl-SI, Lado)",
            _a["sv-SE"] = "Microsoft Server Speech Text to Speech Voice (sv-SE, HedvigRUS)",
            _a["ta-IN"] = "Microsoft Server Speech Text to Speech Voice (ta-IN, Valluvar)",
            _a["te-IN"] = "Microsoft Server Speech Text to Speech Voice (te-IN, Chitra)",
            _a["th-TH"] = "Microsoft Server Speech Text to Speech Voice (th-TH, Pattara)",
            _a["tr-TR"] = "Microsoft Server Speech Text to Speech Voice (tr-TR, SedaRUS)",
            _a["vi-VN"] = "Microsoft Server Speech Text to Speech Voice (vi-VN, An)",
            _a["zh-CN"] = "Microsoft Server Speech Text to Speech Voice (zh-CN, HuihuiRUS)",
            _a["zh-HK"] = "Microsoft Server Speech Text to Speech Voice (zh-HK, TracyRUS)",
            _a["zh-TW"] = "Microsoft Server Speech Text to Speech Voice (zh-TW, HanHanRUS)",
            _a);
        var language = this.properties.getProperty(Exports_3.PropertyId.SpeechServiceConnection_SynthLanguage, "en-US");
        var voice = this.properties.getProperty(Exports_3.PropertyId.SpeechServiceConnection_SynthVoice, "");
        var ssml = SpeechSynthesizer.XMLEncode(text);
        if (this.autoDetectSourceLanguage) {
            language = "en-US";
        }
        else {
            voice = voice || languageToDefaultVoice[language];
        }
        if (voice) {
            ssml = "<voice name='" + voice + "'>" + ssml + "</voice>";
        }
        ssml = "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xmlns:emo='http://www.w3.org/2009/10/emotionml' xml:lang='" + language + "'>" + ssml + "</speak>";
        return ssml;
    };
    /**
     * Executes speech synthesis on plain text.
     * The task returns the synthesis result.
     * @member SpeechSynthesizer.prototype.speakTextAsync
     * @function
     * @public
     * @param text - Text to be synthesized.
     * @param cb - Callback that received the SpeechSynthesisResult.
     * @param err - Callback invoked in case of an error.
     * @param stream - AudioOutputStream to receive the synthesized audio.
     */
    SpeechSynthesizer.prototype.speakTextAsync = function (text, cb, err, stream) {
        this.speakImpl(text, false, cb, err, stream);
    };
    /**
     * Executes speech synthesis on SSML.
     * The task returns the synthesis result.
     * @member SpeechSynthesizer.prototype.speakSsmlAsync
     * @function
     * @public
     * @param ssml - SSML to be synthesized.
     * @param cb - Callback that received the SpeechSynthesisResult.
     * @param err - Callback invoked in case of an error.
     * @param stream - AudioOutputStream to receive the synthesized audio.
     */
    SpeechSynthesizer.prototype.speakSsmlAsync = function (ssml, cb, err, stream) {
        this.speakImpl(ssml, true, cb, err, stream);
    };
    /**
     * Dispose of associated resources.
     * @member SpeechSynthesizer.prototype.close
     * @function
     * @public
     */
    SpeechSynthesizer.prototype.close = function (cb, err) {
        Contracts_1.Contracts.throwIfDisposed(this.privDisposed);
        Exports_2.marshalPromiseToCallbacks(this.dispose(true), cb, err);
    };
    Object.defineProperty(SpeechSynthesizer.prototype, "internalData", {
        /**
         * @Internal
         * Do not use externally, object returned will change without warning or notice.
         */
        get: function () {
            return this.privAdapter;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * This method performs cleanup of resources.
     * The Boolean parameter disposing indicates whether the method is called
     * from Dispose (if disposing is true) or from the finalizer (if disposing is false).
     * Derived classes should override this method to dispose resource if needed.
     * @member SpeechSynthesizer.prototype.dispose
     * @function
     * @public
     * @param {boolean} disposing - Flag to request disposal.
     */
    SpeechSynthesizer.prototype.dispose = function (disposing) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.privDisposed) {
                            return [2 /*return*/];
                        }
                        if (!disposing) return [3 /*break*/, 2];
                        if (!this.privAdapter) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.privAdapter.dispose()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.privDisposed = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    //
    // ################################################################################################################
    // IMPLEMENTATION.
    // Move to independent class
    // ################################################################################################################
    //
    SpeechSynthesizer.prototype.createSynthesizerConfig = function (speechConfig) {
        return new Exports_1.SynthesizerConfig(speechConfig, this.privProperties);
    };
    // Creates the synthesis adapter
    SpeechSynthesizer.prototype.createSynthesisAdapter = function (authentication, connectionFactory, audioConfig, synthesizerConfig) {
        return new Exports_1.SynthesisAdapterBase(authentication, connectionFactory, synthesizerConfig, this, this.audioConfig);
    };
    SpeechSynthesizer.prototype.implCommonSynthesizeSetup = function () {
        var _this = this;
        var osPlatform = (typeof window !== "undefined") ? "Browser" : "Node";
        var osName = "unknown";
        var osVersion = "unknown";
        if (typeof navigator !== "undefined") {
            osPlatform = osPlatform + "/" + navigator.platform;
            osName = navigator.userAgent;
            osVersion = navigator.appVersion;
        }
        var synthesizerConfig = this.createSynthesizerConfig(new Exports_1.SpeechServiceConfig(new Exports_1.Context(new Exports_1.OS(osPlatform, osName, osVersion))));
        var subscriptionKey = this.privProperties.getProperty(Exports_3.PropertyId.SpeechServiceConnection_Key, undefined);
        var authentication = (subscriptionKey && subscriptionKey !== "") ?
            new Exports_1.CognitiveSubscriptionKeyAuthentication(subscriptionKey) :
            new Exports_1.CognitiveTokenAuthentication(function (authFetchEventId) {
                var authorizationToken = _this.privProperties.getProperty(Exports_3.PropertyId.SpeechServiceAuthorization_Token, undefined);
                return Promise.resolve(authorizationToken);
            }, function (authFetchEventId) {
                var authorizationToken = _this.privProperties.getProperty(Exports_3.PropertyId.SpeechServiceAuthorization_Token, undefined);
                return Promise.resolve(authorizationToken);
            });
        this.privAdapter = this.createSynthesisAdapter(authentication, this.privConnectionFactory, this.audioConfig, synthesizerConfig);
        this.privAdapter.audioOutputFormat = AudioOutputFormat_1.AudioOutputFormatImpl.fromSpeechSynthesisOutputFormat(Exports_3.SpeechSynthesisOutputFormat[this.properties.getProperty(Exports_3.PropertyId.SpeechServiceConnection_SynthOutputFormat, undefined)]);
    };
    SpeechSynthesizer.prototype.speakImpl = function (text, IsSsml, cb, err, dataStream) {
        var _this = this;
        try {
            Contracts_1.Contracts.throwIfDisposed(this.privDisposed);
            var requestId = Exports_2.createNoDashGuid();
            var audioDestination = void 0;
            if (dataStream instanceof Exports_3.PushAudioOutputStreamCallback) {
                audioDestination = new AudioOutputStream_1.PushAudioOutputStreamImpl(dataStream);
            }
            else if (dataStream instanceof Exports_3.PullAudioOutputStream) {
                audioDestination = dataStream;
            }
            else if (dataStream !== undefined) {
                audioDestination = new AudioFileWriter_1.AudioFileWriter(dataStream);
            }
            else {
                audioDestination = undefined;
            }
            this.synthesisRequestQueue.enqueue(new SynthesisRequest(requestId, text, IsSsml, function (e) {
                _this.privSynthesizing = false;
                if (!!cb) {
                    try {
                        cb(e);
                    }
                    catch (e) {
                        if (!!err) {
                            err(e);
                        }
                    }
                }
                cb = undefined;
                /* tslint:disable:no-empty */
                _this.adapterSpeak().catch(function () { });
            }, function (e) {
                if (!!err) {
                    err(e);
                }
            }, audioDestination));
            /* tslint:disable:no-empty */
            this.adapterSpeak().catch(function () { });
        }
        catch (error) {
            if (!!err) {
                if (error instanceof Error) {
                    var typedError = error;
                    err(typedError.name + ": " + typedError.message);
                }
                else {
                    err(error);
                }
            }
            // Destroy the synthesizer.
            /* tslint:disable:no-empty */
            this.dispose(true).catch(function () { });
        }
    };
    SpeechSynthesizer.prototype.adapterSpeak = function () {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!this.privDisposed && !this.privSynthesizing)) return [3 /*break*/, 2];
                        this.privSynthesizing = true;
                        return [4 /*yield*/, this.synthesisRequestQueue.dequeue()];
                    case 1:
                        request = _a.sent();
                        return [2 /*return*/, this.privAdapter.Speak(request.text, request.isSSML, request.requestId, request.cb, request.err, request.dataStream)];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    SpeechSynthesizer.XMLEncode = function (text) {
        return text.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    };
    return SpeechSynthesizer;
}());
exports.SpeechSynthesizer = SpeechSynthesizer;
// tslint:disable-next-line:max-classes-per-file
var SynthesisRequest = /** @class */ (function () {
    function SynthesisRequest(requestId, text, isSSML, cb, err, dataStream) {
        this.requestId = requestId;
        this.text = text;
        this.isSSML = isSSML;
        this.cb = cb;
        this.err = err;
        this.dataStream = dataStream;
    }
    return SynthesisRequest;
}());
exports.SynthesisRequest = SynthesisRequest;

//# sourceMappingURL=SpeechSynthesizer.js.map