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
var Exports_1 = require("../../common/Exports");
var Contracts_1 = require("../../sdk/Contracts");
var Exports_2 = require("../../sdk/Exports");
var Exports_3 = require("../Exports");
var TranscriberRecognizer = /** @class */ (function (_super) {
    __extends(TranscriberRecognizer, _super);
    /**
     * TranscriberRecognizer constructor.
     * @constructor
     * @param {AudioConfig} audioConfig - An optional audio configuration associated with the recognizer
     */
    function TranscriberRecognizer(speechTranslationConfig, audioConfig) {
        var _this = this;
        var speechTranslationConfigImpl = speechTranslationConfig;
        Contracts_1.Contracts.throwIfNull(speechTranslationConfigImpl, "speechTranslationConfig");
        Contracts_1.Contracts.throwIfNullOrWhitespace(speechTranslationConfigImpl.speechRecognitionLanguage, Exports_2.PropertyId[Exports_2.PropertyId.SpeechServiceConnection_RecoLanguage]);
        _this = _super.call(this, audioConfig, speechTranslationConfigImpl.properties, new Exports_3.TranscriberConnectionFactory()) || this;
        _this.privDisposedRecognizer = false;
        return _this;
    }
    TranscriberRecognizer.prototype.getConversationInfo = function () {
        Contracts_1.Contracts.throwIfNullOrUndefined(this.privConversation, "Conversation");
        return this.privConversation.conversationInfo;
    };
    Object.defineProperty(TranscriberRecognizer.prototype, "authorizationToken", {
        get: function () {
            return this.properties.getProperty(Exports_2.PropertyId.SpeechServiceAuthorization_Token);
        },
        set: function (token) {
            Contracts_1.Contracts.throwIfNullOrWhitespace(token, "token");
            this.properties.setProperty(Exports_2.PropertyId.SpeechServiceAuthorization_Token, token);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TranscriberRecognizer.prototype, "conversation", {
        set: function (c) {
            Contracts_1.Contracts.throwIfNullOrUndefined(c, "Conversation");
            this.privConversation = c;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TranscriberRecognizer.prototype, "speechRecognitionLanguage", {
        get: function () {
            Contracts_1.Contracts.throwIfDisposed(this.privDisposedRecognizer);
            return this.properties.getProperty(Exports_2.PropertyId.SpeechServiceConnection_RecoLanguage);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TranscriberRecognizer.prototype, "properties", {
        get: function () {
            return this.privProperties;
        },
        enumerable: true,
        configurable: true
    });
    TranscriberRecognizer.prototype.startContinuousRecognitionAsync = function (cb, err) {
        Exports_1.marshalPromiseToCallbacks(this.startContinuousRecognitionAsyncImpl(Exports_3.RecognitionMode.Conversation), cb, err);
    };
    TranscriberRecognizer.prototype.stopContinuousRecognitionAsync = function (cb, err) {
        Exports_1.marshalPromiseToCallbacks(this.stopContinuousRecognitionAsyncImpl(), cb, err);
    };
    TranscriberRecognizer.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Contracts_1.Contracts.throwIfDisposed(this.privDisposedRecognizer);
                        return [4 /*yield*/, this.dispose(true)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Push async join/leave conversation message via serviceRecognizer
    TranscriberRecognizer.prototype.pushConversationEvent = function (conversationInfo, command) {
        return __awaiter(this, void 0, void 0, function () {
            var reco;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reco = (this.privReco);
                        Contracts_1.Contracts.throwIfNullOrUndefined(reco, "serviceRecognizer");
                        return [4 /*yield*/, reco.sendSpeechEventAsync(conversationInfo, command)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TranscriberRecognizer.prototype.connectCallbacks = function (transcriber) {
        this.canceled = function (s, e) {
            if (!!transcriber.canceled) {
                transcriber.canceled(transcriber, e);
            }
        };
        this.recognizing = function (s, e) {
            if (!!transcriber.transcribing) {
                transcriber.transcribing(transcriber, e);
            }
        };
        this.recognized = function (s, e) {
            if (!!transcriber.transcribed) {
                transcriber.transcribed(transcriber, e);
            }
        };
        this.sessionStarted = function (s, e) {
            if (!!transcriber.sessionStarted) {
                transcriber.sessionStarted(transcriber, e);
            }
        };
        this.sessionStopped = function (s, e) {
            if (!!transcriber.sessionStopped) {
                transcriber.sessionStopped(transcriber, e);
            }
        };
    };
    TranscriberRecognizer.prototype.disconnectCallbacks = function () {
        this.canceled = undefined;
        this.recognizing = undefined;
        this.recognized = undefined;
        this.sessionStarted = undefined;
        this.sessionStopped = undefined;
    };
    /**
     * Disposes any resources held by the object.
     * @member ConversationTranscriber.prototype.dispose
     * @function
     * @public
     * @param {boolean} disposing - true if disposing the object.
     */
    TranscriberRecognizer.prototype.dispose = function (disposing) {
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
    TranscriberRecognizer.prototype.createRecognizerConfig = function (speechConfig) {
        return new Exports_3.RecognizerConfig(speechConfig, this.properties);
    };
    TranscriberRecognizer.prototype.createServiceRecognizer = function (authentication, connectionFactory, audioConfig, recognizerConfig) {
        var configImpl = audioConfig;
        return new Exports_3.TranscriptionServiceRecognizer(authentication, connectionFactory, configImpl, recognizerConfig, this);
    };
    return TranscriberRecognizer;
}(Exports_2.Recognizer));
exports.TranscriberRecognizer = TranscriberRecognizer;

//# sourceMappingURL=TranscriberRecognizer.js.map