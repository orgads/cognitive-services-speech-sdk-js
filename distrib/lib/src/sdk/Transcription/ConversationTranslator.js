"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// Multi-device Conversation is a Preview feature.
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
var Exports_1 = require("../../common.speech/Exports");
var Exports_2 = require("../../common/Exports");
var Contracts_1 = require("../Contracts");
var Exports_3 = require("../Exports");
var Conversation_1 = require("./Conversation");
var Exports_4 = require("./Exports");
var SpeechState;
(function (SpeechState) {
    SpeechState[SpeechState["Inactive"] = 0] = "Inactive";
    SpeechState[SpeechState["Connecting"] = 1] = "Connecting";
    SpeechState[SpeechState["Connected"] = 2] = "Connected";
})(SpeechState = exports.SpeechState || (exports.SpeechState = {}));
/***
 * Join, leave or connect to a conversation.
 */
var ConversationTranslator = /** @class */ (function (_super) {
    __extends(ConversationTranslator, _super);
    function ConversationTranslator(audioConfig) {
        var _this = _super.call(this, audioConfig) || this;
        _this.privIsDisposed = false;
        _this.privIsSpeaking = false;
        _this.privSpeechState = SpeechState.Inactive;
        _this.privErrors = Exports_1.ConversationConnectionConfig.restErrors;
        _this.privPlaceholderKey = "abcdefghijklmnopqrstuvwxyz012345";
        _this.privPlaceholderRegion = "westus";
        /** Recognizer callbacks */
        _this.onSpeechConnected = function (e) {
            _this.privSpeechState = SpeechState.Connected;
        };
        _this.onSpeechRecognizing = function (r, e) {
            // TODO: add support for getting recognitions from here if own speech
        };
        _this.onSpeechSessionStarted = function (r, e) {
            _this.privSpeechState = SpeechState.Connected;
        };
        _this.onSpeechSessionStopped = function (r, e) {
            _this.privSpeechState = SpeechState.Inactive;
        };
        _this.privProperties = new Exports_3.PropertyCollection();
        return _this;
    }
    Object.defineProperty(ConversationTranslator.prototype, "properties", {
        get: function () {
            return this.privProperties;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConversationTranslator.prototype, "speechRecognitionLanguage", {
        get: function () {
            return this.privSpeechRecognitionLanguage;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConversationTranslator.prototype, "participants", {
        get: function () {
            var _a;
            return (_a = this.privConversation) === null || _a === void 0 ? void 0 : _a.participants;
        },
        enumerable: true,
        configurable: true
    });
    ConversationTranslator.prototype.joinConversationAsync = function (conversation, nickname, param1, param2, param3) {
        var _this = this;
        try {
            if (typeof conversation === "string") {
                Contracts_1.Contracts.throwIfNullOrUndefined(conversation, this.privErrors.invalidArgs.replace("{arg}", "conversation id"));
                Contracts_1.Contracts.throwIfNullOrWhitespace(nickname, this.privErrors.invalidArgs.replace("{arg}", "nickname"));
                if (!!this.privConversation) {
                    this.handleError(new Error(this.privErrors.permissionDeniedStart), param3);
                }
                var lang = param1;
                if (lang === undefined || lang === null || lang === "") {
                    lang = Exports_1.ConversationConnectionConfig.defaultLanguageCode;
                }
                // create a placeholder config
                this.privSpeechTranslationConfig = Exports_3.SpeechTranslationConfig.fromSubscription(this.privPlaceholderKey, this.privPlaceholderRegion);
                this.privSpeechTranslationConfig.setProfanity(Exports_3.ProfanityOption.Masked);
                this.privSpeechTranslationConfig.addTargetLanguage(lang);
                this.privSpeechTranslationConfig.setProperty(Exports_3.PropertyId[Exports_3.PropertyId.SpeechServiceConnection_RecoLanguage], lang);
                this.privSpeechTranslationConfig.setProperty(Exports_3.PropertyId[Exports_3.PropertyId.ConversationTranslator_Name], nickname);
                var endpoint = this.privProperties.getProperty(Exports_3.PropertyId.ConversationTranslator_Host);
                if (endpoint) {
                    this.privSpeechTranslationConfig.setProperty(Exports_3.PropertyId[Exports_3.PropertyId.ConversationTranslator_Host], endpoint);
                }
                var speechEndpointHost = this.privProperties.getProperty(Exports_3.PropertyId.SpeechServiceConnection_Host);
                if (speechEndpointHost) {
                    this.privSpeechTranslationConfig.setProperty(Exports_3.PropertyId[Exports_3.PropertyId.SpeechServiceConnection_Host], speechEndpointHost);
                }
                // join the conversation
                this.privConversation = new Conversation_1.ConversationImpl(this.privSpeechTranslationConfig);
                this.privConversation.conversationTranslator = this;
                this.privConversation.joinConversationAsync(conversation, nickname, lang, (function (result) {
                    if (!result) {
                        _this.handleError(new Error(_this.privErrors.permissionDeniedConnect), param3);
                    }
                    _this.privSpeechTranslationConfig.authorizationToken = result;
                    // connect to the ws
                    _this.privConversation.startConversationAsync((function () {
                        _this.handleCallback(param2, param3);
                    }), (function (error) {
                        _this.handleError(error, param3);
                    }));
                }), (function (error) {
                    _this.handleError(error, param3);
                }));
            }
            else if (typeof conversation === "object") {
                Contracts_1.Contracts.throwIfNullOrUndefined(conversation, this.privErrors.invalidArgs.replace("{arg}", "conversation id"));
                Contracts_1.Contracts.throwIfNullOrWhitespace(nickname, this.privErrors.invalidArgs.replace("{arg}", "nickname"));
                // save the nickname
                this.privProperties.setProperty(Exports_3.PropertyId.ConversationTranslator_Name, nickname);
                // ref the conversation object
                this.privConversation = conversation;
                // ref the conversation translator object
                this.privConversation.conversationTranslator = this;
                Contracts_1.Contracts.throwIfNullOrUndefined(this.privConversation, this.privErrors.permissionDeniedConnect);
                Contracts_1.Contracts.throwIfNullOrUndefined(this.privConversation.room.token, this.privErrors.permissionDeniedConnect);
                this.privSpeechTranslationConfig = conversation.config;
                this.handleCallback(param1, param2);
            }
            else {
                this.handleError(new Error(this.privErrors.invalidArgs.replace("{arg}", "invalid conversation type")), param2);
            }
        }
        catch (error) {
            this.handleError(error, typeof param1 === "string" ? param3 : param2);
        }
    };
    /**
     * Leave the conversation
     * @param cb
     * @param err
     */
    ConversationTranslator.prototype.leaveConversationAsync = function (cb, err) {
        var _this = this;
        Exports_2.marshalPromiseToCallbacks((function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // stop the speech websocket
                    return [4 /*yield*/, this.cancelSpeech()];
                    case 1:
                        // stop the speech websocket
                        _a.sent();
                        // stop the websocket
                        return [4 /*yield*/, this.privConversation.endConversationImplAsync()];
                    case 2:
                        // stop the websocket
                        _a.sent();
                        // https delete request
                        return [4 /*yield*/, this.privConversation.deleteConversationImplAsync()];
                    case 3:
                        // https delete request
                        _a.sent();
                        this.dispose();
                        return [2 /*return*/];
                }
            });
        }); })(), cb, err);
    };
    /**
     * Send a text message
     * @param message
     * @param cb
     * @param err
     */
    ConversationTranslator.prototype.sendTextMessageAsync = function (message, cb, err) {
        var _a;
        try {
            Contracts_1.Contracts.throwIfNullOrUndefined(this.privConversation, this.privErrors.permissionDeniedSend);
            Contracts_1.Contracts.throwIfNullOrWhitespace(message, this.privErrors.invalidArgs.replace("{arg}", message));
            (_a = this.privConversation) === null || _a === void 0 ? void 0 : _a.sendTextMessageAsync(message, cb, err);
        }
        catch (error) {
            this.handleError(error, err);
        }
    };
    /**
     * Start speaking
     * @param cb
     * @param err
     */
    ConversationTranslator.prototype.startTranscribingAsync = function (cb, err) {
        var _this = this;
        Exports_2.marshalPromiseToCallbacks((function () { return __awaiter(_this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 6]);
                        Contracts_1.Contracts.throwIfNullOrUndefined(this.privConversation, this.privErrors.permissionDeniedSend);
                        Contracts_1.Contracts.throwIfNullOrUndefined(this.privConversation.room.token, this.privErrors.permissionDeniedConnect);
                        if (!this.canSpeak) {
                            this.handleError(new Error(this.privErrors.permissionDeniedSend), err);
                        }
                        if (!(this.privTranslationRecognizer === undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.connectTranslatorRecognizer()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.startContinuousRecognition()];
                    case 3:
                        _a.sent();
                        this.privIsSpeaking = true;
                        return [3 /*break*/, 6];
                    case 4:
                        error_1 = _a.sent();
                        this.privIsSpeaking = false;
                        // this.fireCancelEvent(error);
                        return [4 /*yield*/, this.cancelSpeech()];
                    case 5:
                        // this.fireCancelEvent(error);
                        _a.sent();
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        }); })(), cb, err);
    };
    /**
     * Stop speaking
     * @param cb
     * @param err
     */
    ConversationTranslator.prototype.stopTranscribingAsync = function (cb, err) {
        var _this = this;
        Exports_2.marshalPromiseToCallbacks((function () { return __awaiter(_this, void 0, void 0, function () {
            var error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 6]);
                        if (!!this.privIsSpeaking) return [3 /*break*/, 2];
                        // stop speech
                        return [4 /*yield*/, this.cancelSpeech()];
                    case 1:
                        // stop speech
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        // stop the recognition but leave the websocket open
                        this.privIsSpeaking = false;
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                var _a;
                                (_a = _this.privTranslationRecognizer) === null || _a === void 0 ? void 0 : _a.stopContinuousRecognitionAsync(resolve, reject);
                            })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        error_2 = _a.sent();
                        return [4 /*yield*/, this.cancelSpeech()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); })(), cb, err);
    };
    ConversationTranslator.prototype.isDisposed = function () {
        return this.privIsDisposed;
    };
    ConversationTranslator.prototype.dispose = function (reason, success, err) {
        var _this = this;
        Exports_2.marshalPromiseToCallbacks((function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.isDisposed && !this.privIsSpeaking) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.cancelSpeech()];
                    case 1:
                        _c.sent();
                        this.privIsDisposed = true;
                        (_a = this.privSpeechTranslationConfig) === null || _a === void 0 ? void 0 : _a.close();
                        this.privSpeechRecognitionLanguage = undefined;
                        this.privProperties = undefined;
                        this.privAudioConfig = undefined;
                        this.privSpeechTranslationConfig = undefined;
                        (_b = this.privConversation) === null || _b === void 0 ? void 0 : _b.dispose();
                        this.privConversation = undefined;
                        return [2 /*return*/];
                }
            });
        }); })(), success, err);
    };
    /**
     * Cancel the speech websocket
     */
    ConversationTranslator.prototype.cancelSpeech = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        this.privIsSpeaking = false;
                        (_a = this.privTranslationRecognizer) === null || _a === void 0 ? void 0 : _a.stopContinuousRecognitionAsync();
                        return [4 /*yield*/, ((_b = this.privTranslationRecognizerConnection) === null || _b === void 0 ? void 0 : _b.closeConnection())];
                    case 1:
                        _c.sent();
                        this.privTranslationRecognizerConnection = undefined;
                        this.privTranslationRecognizer = undefined;
                        this.privSpeechState = SpeechState.Inactive;
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _c.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Connect to the speech translation recognizer.
     * Currently there is no language validation performed before sending the SpeechLanguage code to the service.
     * If it's an invalid language the raw error will be: 'Error during WebSocket handshake: Unexpected response code: 400'
     * e.g. pass in 'fr' instead of 'fr-FR', or a text-only language 'cy'
     * @param cb
     * @param err
     */
    ConversationTranslator.prototype.connectTranslatorRecognizer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var token, endpointHost, url, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 1, , 3]);
                        if (this.privAudioConfig === undefined) {
                            this.privAudioConfig = Exports_3.AudioConfig.fromDefaultMicrophoneInput();
                        }
                        // clear the temp subscription key if it's a participant joining
                        if (this.privSpeechTranslationConfig.getProperty(Exports_3.PropertyId[Exports_3.PropertyId.SpeechServiceConnection_Key])
                            === this.privPlaceholderKey) {
                            this.privSpeechTranslationConfig.setProperty(Exports_3.PropertyId[Exports_3.PropertyId.SpeechServiceConnection_Key], "");
                        }
                        token = encodeURIComponent(this.privConversation.room.token);
                        endpointHost = this.privSpeechTranslationConfig.getProperty(Exports_3.PropertyId[Exports_3.PropertyId.SpeechServiceConnection_Host], Exports_1.ConversationConnectionConfig.speechHost);
                        endpointHost = endpointHost.replace("{region}", this.privConversation.room.cognitiveSpeechRegion);
                        url = "wss://" + endpointHost + Exports_1.ConversationConnectionConfig.speechPath + "?" + Exports_1.ConversationConnectionConfig.configParams.token + "=" + token;
                        this.privSpeechTranslationConfig.setProperty(Exports_3.PropertyId[Exports_3.PropertyId.SpeechServiceConnection_Endpoint], url);
                        this.privTranslationRecognizer = new Exports_3.TranslationRecognizer(this.privSpeechTranslationConfig, this.privAudioConfig);
                        this.privTranslationRecognizerConnection = Exports_3.Connection.fromRecognizer(this.privTranslationRecognizer);
                        this.privTranslationRecognizerConnection.connected = this.onSpeechConnected;
                        this.privTranslationRecognizerConnection.disconnected = this.onSpeechDisconnected;
                        this.privTranslationRecognizer.recognized = this.onSpeechRecognized;
                        this.privTranslationRecognizer.recognizing = this.onSpeechRecognizing;
                        this.privTranslationRecognizer.canceled = this.onSpeechCanceled;
                        this.privTranslationRecognizer.sessionStarted = this.onSpeechSessionStarted;
                        this.privTranslationRecognizer.sessionStopped = this.onSpeechSessionStopped;
                        return [3 /*break*/, 3];
                    case 1:
                        error_3 = _a.sent();
                        return [4 /*yield*/, this.cancelSpeech()];
                    case 2:
                        _a.sent();
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle the start speaking request
     * @param cb
     * @param err
     */
    ConversationTranslator.prototype.startContinuousRecognition = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.privTranslationRecognizer.startContinuousRecognitionAsync(resolve, reject);
        });
    };
    ConversationTranslator.prototype.onSpeechDisconnected = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.privSpeechState = SpeechState.Inactive;
                        return [4 /*yield*/, this.cancelSpeech()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ConversationTranslator.prototype.onSpeechRecognized = function (r, e) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!((_a = e.result) === null || _a === void 0 ? void 0 : _a.errorDetails)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.cancelSpeech()];
                    case 1:
                        _b.sent();
                        // TODO: format the error message contained in 'errorDetails'
                        this.fireCancelEvent(e.result.errorDetails);
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ConversationTranslator.prototype.onSpeechCanceled = function (r, e) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.privSpeechState !== SpeechState.Inactive)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.cancelSpeech()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        this.privSpeechState = SpeechState.Inactive;
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fire a cancel event
     * @param error
     */
    ConversationTranslator.prototype.fireCancelEvent = function (error) {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            if (!!this.canceled) {
                var cancelEvent = new Exports_4.ConversationTranslationCanceledEventArgs((_b = (_a = error) === null || _a === void 0 ? void 0 : _a.reason, (_b !== null && _b !== void 0 ? _b : Exports_3.CancellationReason.Error)), (_d = (_c = error) === null || _c === void 0 ? void 0 : _c.errorDetails, (_d !== null && _d !== void 0 ? _d : error)), (_f = (_e = error) === null || _e === void 0 ? void 0 : _e.errorCode, (_f !== null && _f !== void 0 ? _f : Exports_3.CancellationErrorCode.RuntimeError)), undefined, (_g = error) === null || _g === void 0 ? void 0 : _g.sessionId);
                this.canceled(this, cancelEvent);
            }
        }
        catch (e) {
            //
        }
    };
    Object.defineProperty(ConversationTranslator.prototype, "canSpeak", {
        get: function () {
            // is there a Conversation websocket available
            if (!this.privConversation.isConnected) {
                return false;
            }
            // is the user already speaking
            if (this.privIsSpeaking || this.privSpeechState === SpeechState.Connected || this.privSpeechState === SpeechState.Connecting) {
                return false;
            }
            // is the user muted
            if (this.privConversation.isMutedByHost) {
                return false;
            }
            return true;
        },
        enumerable: true,
        configurable: true
    });
    return ConversationTranslator;
}(Exports_4.ConversationCommon));
exports.ConversationTranslator = ConversationTranslator;

//# sourceMappingURL=ConversationTranslator.js.map