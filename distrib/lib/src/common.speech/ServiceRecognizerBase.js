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
var Exports_1 = require("../common.browser/Exports");
var Exports_2 = require("../common/Exports");
var Exports_3 = require("../sdk/Exports");
var Exports_4 = require("./Exports");
var SpeechConnectionMessage_Internal_1 = require("./SpeechConnectionMessage.Internal");
var ServiceRecognizerBase = /** @class */ (function () {
    function ServiceRecognizerBase(authentication, connectionFactory, audioSource, recognizerConfig, recognizer) {
        var _this = this;
        this.privSetTimeout = setTimeout;
        this.recognizeOverride = undefined;
        this.disconnectOverride = undefined;
        this.receiveMessageOverride = undefined;
        this.sendSpeechContext = function (connection) {
            var speechContextJson = _this.speechContext.toJSON();
            if (speechContextJson) {
                return connection.send(new SpeechConnectionMessage_Internal_1.SpeechConnectionMessage(Exports_2.MessageType.Text, "speech.context", _this.privRequestSession.requestId, "application/json", speechContextJson));
            }
            return;
        };
        this.sendPrePayloadJSONOverride = undefined;
        this.postConnectImplOverride = undefined;
        this.configConnectionOverride = undefined;
        this.sendSpeechServiceConfig = function (connection, requestSession, SpeechServiceConfigJson) {
            // filter out anything that is not required for the service to work.
            if (ServiceRecognizerBase.telemetryDataEnabled !== true) {
                var withTelemetry = JSON.parse(SpeechServiceConfigJson);
                var replacement = {
                    context: {
                        system: withTelemetry.context.system,
                    },
                };
                SpeechServiceConfigJson = JSON.stringify(replacement);
            }
            if (SpeechServiceConfigJson) {
                return connection.send(new SpeechConnectionMessage_Internal_1.SpeechConnectionMessage(Exports_2.MessageType.Text, "speech.config", requestSession.requestId, "application/json", SpeechServiceConfigJson));
            }
            return;
        };
        if (!authentication) {
            throw new Exports_2.ArgumentNullError("authentication");
        }
        if (!connectionFactory) {
            throw new Exports_2.ArgumentNullError("connectionFactory");
        }
        if (!audioSource) {
            throw new Exports_2.ArgumentNullError("audioSource");
        }
        if (!recognizerConfig) {
            throw new Exports_2.ArgumentNullError("recognizerConfig");
        }
        this.privMustReportEndOfStream = false;
        this.privAuthentication = authentication;
        this.privConnectionFactory = connectionFactory;
        this.privAudioSource = audioSource;
        this.privRecognizerConfig = recognizerConfig;
        this.privIsDisposed = false;
        this.privRecognizer = recognizer;
        this.privRequestSession = new Exports_4.RequestSession(this.privAudioSource.id());
        this.privConnectionEvents = new Exports_2.EventSource();
        this.privServiceEvents = new Exports_2.EventSource();
        this.privDynamicGrammar = new Exports_4.DynamicGrammarBuilder();
        this.privSpeechContext = new Exports_4.SpeechContext(this.privDynamicGrammar);
        this.privAgentConfig = new Exports_4.AgentConfig();
        if (typeof (Blob) !== "undefined" && typeof (Worker) !== "undefined") {
            this.privSetTimeout = Exports_2.Timeout.setTimeout;
        }
        this.connectionEvents.attach(function (connectionEvent) { return __awaiter(_this, void 0, void 0, function () {
            var connectionClosedEvent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(connectionEvent.name === "ConnectionClosedEvent")) return [3 /*break*/, 2];
                        connectionClosedEvent = connectionEvent;
                        if (!(connectionClosedEvent.statusCode !== 1000)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.cancelRecognitionLocal(Exports_3.CancellationReason.Error, connectionClosedEvent.statusCode === 1007 ? Exports_3.CancellationErrorCode.BadRequestParameters : Exports_3.CancellationErrorCode.ConnectionFailure, connectionClosedEvent.reason + " websocket error code: " + connectionClosedEvent.statusCode)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); });
    }
    Object.defineProperty(ServiceRecognizerBase.prototype, "audioSource", {
        get: function () {
            return this.privAudioSource;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceRecognizerBase.prototype, "speechContext", {
        get: function () {
            return this.privSpeechContext;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceRecognizerBase.prototype, "dynamicGrammar", {
        get: function () {
            return this.privDynamicGrammar;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceRecognizerBase.prototype, "agentConfig", {
        get: function () {
            return this.privAgentConfig;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceRecognizerBase.prototype, "conversationTranslatorToken", {
        set: function (token) {
            this.privRecognizerConfig.parameters.setProperty(Exports_3.PropertyId.ConversationTranslator_Token, token);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceRecognizerBase.prototype, "authentication", {
        set: function (auth) {
            this.privAuthentication = this.authentication;
        },
        enumerable: true,
        configurable: true
    });
    ServiceRecognizerBase.prototype.isDisposed = function () {
        return this.privIsDisposed;
    };
    ServiceRecognizerBase.prototype.dispose = function (reason) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.privIsDisposed = true;
                        if (!this.privConnectionConfigurationPromise) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.privConnectionConfigurationPromise];
                    case 2:
                        connection = _a.sent();
                        return [4 /*yield*/, connection.dispose(reason)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        // The connection is in a bad state. But we're trying to kill it, so...
                        return [2 /*return*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(ServiceRecognizerBase.prototype, "connectionEvents", {
        get: function () {
            return this.privConnectionEvents;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceRecognizerBase.prototype, "serviceEvents", {
        get: function () {
            return this.privServiceEvents;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ServiceRecognizerBase.prototype, "recognitionMode", {
        get: function () {
            return this.privRecognizerConfig.recognitionMode;
        },
        enumerable: true,
        configurable: true
    });
    ServiceRecognizerBase.prototype.recognize = function (recoMode, successCallback, errorCallBack) {
        return __awaiter(this, void 0, void 0, function () {
            var conPromise, audioStreamNode, format, deviceInfo, audioNode, error_2, sessionStartEventArgs, messageRetrievalPromise, audioSendPromise;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.recognizeOverride !== undefined) {
                            return [2 /*return*/, this.recognizeOverride(recoMode, successCallback, errorCallBack)];
                        }
                        // Clear the existing configuration promise to force a re-transmission of config and context.
                        this.privConnectionConfigurationPromise = null;
                        this.privRecognizerConfig.recognitionMode = recoMode;
                        this.privSuccessCallback = successCallback;
                        this.privErrorCallback = errorCallBack;
                        this.privRequestSession.startNewRecognition();
                        this.privRequestSession.listenForServiceTelemetry(this.privAudioSource.events);
                        conPromise = this.connectImpl();
                        return [4 /*yield*/, this.audioSource.attach(this.privRequestSession.audioNodeId)];
                    case 1:
                        audioStreamNode = _a.sent();
                        return [4 /*yield*/, this.audioSource.format];
                    case 2:
                        format = _a.sent();
                        return [4 /*yield*/, this.audioSource.deviceInfo];
                    case 3:
                        deviceInfo = _a.sent();
                        audioNode = new Exports_1.ReplayableAudioNode(audioStreamNode, format.avgBytesPerSec);
                        return [4 /*yield*/, this.privRequestSession.onAudioSourceAttachCompleted(audioNode, false)];
                    case 4:
                        _a.sent();
                        this.privRecognizerConfig.SpeechServiceConfig.Context.audio = { source: deviceInfo };
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 9]);
                        return [4 /*yield*/, conPromise];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 7:
                        error_2 = _a.sent();
                        return [4 /*yield*/, this.cancelRecognitionLocal(Exports_3.CancellationReason.Error, Exports_3.CancellationErrorCode.ConnectionFailure, error_2)];
                    case 8:
                        _a.sent();
                        return [2 /*return*/];
                    case 9:
                        sessionStartEventArgs = new Exports_3.SessionEventArgs(this.privRequestSession.sessionId);
                        if (!!this.privRecognizer.sessionStarted) {
                            this.privRecognizer.sessionStarted(this.privRecognizer, sessionStartEventArgs);
                        }
                        messageRetrievalPromise = this.receiveMessage();
                        audioSendPromise = this.sendAudio(audioNode);
                        audioSendPromise.catch(function (error) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.cancelRecognitionLocal(Exports_3.CancellationReason.Error, Exports_3.CancellationErrorCode.RuntimeError, error)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    ServiceRecognizerBase.prototype.stopRecognizing = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.privRequestSession.isRecognizing) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.audioSource.turnOff()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.sendFinalAudio()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.privRequestSession.onStopRecognizing()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.privRequestSession.turnCompletionPromise];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.privRequestSession.dispose()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ServiceRecognizerBase.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connectImpl()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, Promise.resolve()];
                }
            });
        });
    };
    ServiceRecognizerBase.prototype.connectAsync = function (cb, err) {
        this.connectImpl().then(function (connection) {
            try {
                if (!!cb) {
                    cb();
                }
            }
            catch (e) {
                if (!!err) {
                    err(e);
                }
            }
        }, function (reason) {
            try {
                if (!!err) {
                    err(reason);
                }
                /* tslint:disable:no-empty */
            }
            catch (error) {
            }
        });
    };
    ServiceRecognizerBase.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cancelRecognitionLocal(Exports_3.CancellationReason.Error, Exports_3.CancellationErrorCode.NoError, "Disconnecting")];
                    case 1:
                        _a.sent();
                        if (!(this.disconnectOverride !== undefined)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.disconnectOverride()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, this.privConnectionPromise];
                    case 4: return [4 /*yield*/, (_a.sent()).dispose()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_3 = _a.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        this.privConnectionPromise = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    ServiceRecognizerBase.prototype.sendMessage = function (message) { };
    ServiceRecognizerBase.prototype.sendNetworkMessage = function (path, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var type, contentType, connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        type = typeof payload === "string" ? Exports_2.MessageType.Text : Exports_2.MessageType.Binary;
                        contentType = typeof payload === "string" ? "application/json" : "";
                        return [4 /*yield*/, this.fetchConnection()];
                    case 1:
                        connection = _a.sent();
                        return [2 /*return*/, connection.send(new SpeechConnectionMessage_Internal_1.SpeechConnectionMessage(type, path, this.privRequestSession.requestId, contentType, payload))];
                }
            });
        });
    };
    Object.defineProperty(ServiceRecognizerBase.prototype, "activityTemplate", {
        get: function () { return this.privActivityTemplate; },
        set: function (messagePayload) { this.privActivityTemplate = messagePayload; },
        enumerable: true,
        configurable: true
    });
    ServiceRecognizerBase.prototype.sendTelemetryData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var telemetryData, connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        telemetryData = this.privRequestSession.getTelemetry();
                        if (ServiceRecognizerBase.telemetryDataEnabled !== true ||
                            this.privIsDisposed ||
                            null === telemetryData) {
                            return [2 /*return*/];
                        }
                        if (!!ServiceRecognizerBase.telemetryData) {
                            try {
                                ServiceRecognizerBase.telemetryData(telemetryData);
                                /* tslint:disable:no-empty */
                            }
                            catch (_b) { }
                        }
                        return [4 /*yield*/, this.fetchConnection()];
                    case 1:
                        connection = _a.sent();
                        return [4 /*yield*/, connection.send(new SpeechConnectionMessage_Internal_1.SpeechConnectionMessage(Exports_2.MessageType.Text, "telemetry", this.privRequestSession.requestId, "application/json", telemetryData))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Cancels recognition.
    ServiceRecognizerBase.prototype.cancelRecognitionLocal = function (cancellationReason, errorCode, error) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!!this.privRequestSession.isRecognizing) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.privRequestSession.onStopRecognizing()];
                    case 1:
                        _a.sent();
                        this.cancelRecognition(this.privRequestSession.sessionId, this.privRequestSession.requestId, cancellationReason, errorCode, error);
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ServiceRecognizerBase.prototype.receiveMessage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connection, message, connectionMessage, _a, speechStartDetected, speechStartEventArgs, json, speechStopDetected, speechStopEventArgs, sessionStopEventArgs, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 18, , 19]);
                        if (this.privIsDisposed) {
                            // We're done.
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.fetchConnection()];
                    case 1:
                        connection = _b.sent();
                        return [4 /*yield*/, connection.read()];
                    case 2:
                        message = _b.sent();
                        if (this.receiveMessageOverride !== undefined) {
                            return [2 /*return*/, this.receiveMessageOverride()];
                        }
                        // indicates we are draining the queue and it came with no message;
                        if (!message) {
                            if (!this.privRequestSession.isRecognizing) {
                                return [2 /*return*/];
                            }
                            else {
                                return [2 /*return*/, this.receiveMessage()];
                            }
                        }
                        this.privServiceHasSentMessage = true;
                        connectionMessage = SpeechConnectionMessage_Internal_1.SpeechConnectionMessage.fromConnectionMessage(message);
                        if (!(connectionMessage.requestId.toLowerCase() === this.privRequestSession.requestId.toLowerCase())) return [3 /*break*/, 17];
                        _a = connectionMessage.path.toLowerCase();
                        switch (_a) {
                            case "turn.start": return [3 /*break*/, 3];
                            case "speech.startdetected": return [3 /*break*/, 4];
                            case "speech.enddetected": return [3 /*break*/, 5];
                            case "turn.end": return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 15];
                    case 3:
                        this.privMustReportEndOfStream = true;
                        this.privRequestSession.onServiceTurnStartResponse();
                        return [3 /*break*/, 17];
                    case 4:
                        speechStartDetected = Exports_4.SpeechDetected.fromJSON(connectionMessage.textBody);
                        speechStartEventArgs = new Exports_3.RecognitionEventArgs(speechStartDetected.Offset, this.privRequestSession.sessionId);
                        if (!!this.privRecognizer.speechStartDetected) {
                            this.privRecognizer.speechStartDetected(this.privRecognizer, speechStartEventArgs);
                        }
                        return [3 /*break*/, 17];
                    case 5:
                        json = void 0;
                        if (connectionMessage.textBody.length > 0) {
                            json = connectionMessage.textBody;
                        }
                        else {
                            // If the request was empty, the JSON returned is empty.
                            json = "{ Offset: 0 }";
                        }
                        speechStopDetected = Exports_4.SpeechDetected.fromJSON(json);
                        // Only shrink the buffers for continuous recognition.
                        // For single shot, the speech.phrase message will come after the speech.end and it should own buffer shrink.
                        if (this.privRecognizerConfig.isContinuousRecognition) {
                            this.privRequestSession.onServiceRecognized(speechStopDetected.Offset + this.privRequestSession.currentTurnAudioOffset);
                        }
                        speechStopEventArgs = new Exports_3.RecognitionEventArgs(speechStopDetected.Offset + this.privRequestSession.currentTurnAudioOffset, this.privRequestSession.sessionId);
                        if (!!this.privRecognizer.speechEndDetected) {
                            this.privRecognizer.speechEndDetected(this.privRecognizer, speechStopEventArgs);
                        }
                        return [3 /*break*/, 17];
                    case 6: return [4 /*yield*/, this.sendTelemetryData()];
                    case 7:
                        _b.sent();
                        if (!(this.privRequestSession.isSpeechEnded && this.privMustReportEndOfStream)) return [3 /*break*/, 9];
                        this.privMustReportEndOfStream = false;
                        return [4 /*yield*/, this.cancelRecognitionLocal(Exports_3.CancellationReason.EndOfStream, Exports_3.CancellationErrorCode.NoError, undefined)];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9:
                        sessionStopEventArgs = new Exports_3.SessionEventArgs(this.privRequestSession.sessionId);
                        return [4 /*yield*/, this.privRequestSession.onServiceTurnEndResponse(this.privRecognizerConfig.isContinuousRecognition)];
                    case 10:
                        _b.sent();
                        if (!(!this.privRecognizerConfig.isContinuousRecognition || this.privRequestSession.isSpeechEnded || !this.privRequestSession.isRecognizing)) return [3 /*break*/, 11];
                        if (!!this.privRecognizer.sessionStopped) {
                            this.privRecognizer.sessionStopped(this.privRecognizer, sessionStopEventArgs);
                        }
                        return [2 /*return*/];
                    case 11: return [4 /*yield*/, this.fetchConnection()];
                    case 12:
                        connection = _b.sent();
                        return [4 /*yield*/, this.sendPrePayloadJSON(connection)];
                    case 13:
                        _b.sent();
                        _b.label = 14;
                    case 14: return [3 /*break*/, 17];
                    case 15: return [4 /*yield*/, this.processTypeSpecificMessages(connectionMessage)];
                    case 16:
                        if (!(_b.sent())) {
                            // here are some messages that the derived class has not processed, dispatch them to connect class
                            if (!!this.privServiceEvents) {
                                this.serviceEvents.onEvent(new Exports_2.ServiceEvent(connectionMessage.path.toLowerCase(), connectionMessage.textBody));
                            }
                        }
                        _b.label = 17;
                    case 17: return [2 /*return*/, this.receiveMessage()];
                    case 18:
                        error_4 = _b.sent();
                        return [2 /*return*/, null];
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    // Encapsulated for derived service recognizers that need to send additional JSON
    ServiceRecognizerBase.prototype.sendPrePayloadJSON = function (connection) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.sendPrePayloadJSONOverride !== undefined) {
                            return [2 /*return*/, this.sendPrePayloadJSONOverride(connection)];
                        }
                        return [4 /*yield*/, this.sendSpeechContext(connection)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.sendWaveHeader(connection)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ServiceRecognizerBase.prototype.sendWaveHeader = function (connection) {
        return __awaiter(this, void 0, void 0, function () {
            var format;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.audioSource.format];
                    case 1:
                        format = _a.sent();
                        // this.writeBufferToConsole(format.header);
                        return [2 /*return*/, connection.send(new SpeechConnectionMessage_Internal_1.SpeechConnectionMessage(Exports_2.MessageType.Binary, "audio", this.privRequestSession.requestId, "audio/x-wav", format.header))];
                }
            });
        });
    };
    // Establishes a websocket connection to the end point.
    ServiceRecognizerBase.prototype.connectImpl = function (isUnAuthorized) {
        var _this = this;
        if (isUnAuthorized === void 0) { isUnAuthorized = false; }
        if (this.privConnectionPromise) {
            return this.privConnectionPromise.then(function (connection) {
                if (connection.state() === Exports_2.ConnectionState.Disconnected) {
                    _this.privConnectionId = null;
                    _this.privConnectionPromise = null;
                    _this.privServiceHasSentMessage = false;
                    return _this.connectImpl();
                }
                return _this.privConnectionPromise;
            }, function (error) {
                _this.privConnectionId = null;
                _this.privConnectionPromise = null;
                _this.privServiceHasSentMessage = false;
                return _this.connectImpl();
            });
        }
        this.privAuthFetchEventId = Exports_2.createNoDashGuid();
        var sessionId = this.privRecognizerConfig.parameters.getProperty(Exports_3.PropertyId.Speech_SessionId, undefined);
        this.privConnectionId = (sessionId !== undefined) ? sessionId : Exports_2.createNoDashGuid();
        this.privRequestSession.onPreConnectionStart(this.privAuthFetchEventId, this.privConnectionId);
        var authPromise = isUnAuthorized ? this.privAuthentication.fetchOnExpiry(this.privAuthFetchEventId) : this.privAuthentication.fetch(this.privAuthFetchEventId);
        this.privConnectionPromise = authPromise.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
            var connection, response;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.privRequestSession.onAuthCompleted(false)];
                    case 1:
                        _a.sent();
                        connection = this.privConnectionFactory.create(this.privRecognizerConfig, result, this.privConnectionId);
                        this.privRequestSession.listenForServiceTelemetry(connection.events);
                        // Attach to the underlying event. No need to hold onto the detach pointers as in the event the connection goes away,
                        // it'll stop sending events.
                        connection.events.attach(function (event) {
                            _this.connectionEvents.onEvent(event);
                        });
                        return [4 /*yield*/, connection.open()];
                    case 2:
                        response = _a.sent();
                        if (!(response.statusCode === 200)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.privRequestSession.onConnectionEstablishCompleted(response.statusCode)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, Promise.resolve(connection)];
                    case 4:
                        if (!(response.statusCode === 403 && !isUnAuthorized)) return [3 /*break*/, 5];
                        return [2 /*return*/, this.connectImpl(true)];
                    case 5: return [4 /*yield*/, this.privRequestSession.onConnectionEstablishCompleted(response.statusCode, response.reason)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, Promise.reject("Unable to contact server. StatusCode: " + response.statusCode + ", " + this.privRecognizerConfig.parameters.getProperty(Exports_3.PropertyId.SpeechServiceConnection_Endpoint) + " Reason: " + response.reason)];
                }
            });
        }); }, function (error) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.privRequestSession.onAuthCompleted(true, error)];
                    case 1:
                        _a.sent();
                        throw new Error(error);
                }
            });
        }); });
        // Attach an empty handler to allow the promise to run in the background while
        // other startup events happen. It'll eventually be awaited on.
        this.privConnectionPromise.catch(function () { });
        if (this.postConnectImplOverride !== undefined) {
            return this.postConnectImplOverride(this.privConnectionPromise);
        }
        return this.privConnectionPromise;
    };
    ServiceRecognizerBase.prototype.fetchConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.privConnectionConfigurationPromise) {
                            return [2 /*return*/, this.privConnectionConfigurationPromise.then(function (connection) {
                                    if (connection.state() === Exports_2.ConnectionState.Disconnected) {
                                        _this.privConnectionId = null;
                                        _this.privConnectionConfigurationPromise = null;
                                        _this.privServiceHasSentMessage = false;
                                        return _this.fetchConnection();
                                    }
                                    return _this.privConnectionConfigurationPromise;
                                }, function (error) {
                                    _this.privConnectionId = null;
                                    _this.privConnectionConfigurationPromise = null;
                                    _this.privServiceHasSentMessage = false;
                                    return _this.fetchConnection();
                                })];
                        }
                        this.privConnectionConfigurationPromise = this.configureConnection();
                        return [4 /*yield*/, this.privConnectionConfigurationPromise];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ServiceRecognizerBase.prototype.sendAudio = function (audioStreamNode) {
        return __awaiter(this, void 0, void 0, function () {
            var audioFormat, nextSendTime, fastLaneSizeMs, maxSendUnthrottledBytes, startRecogNumber, readAndUploadCycle;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.audioSource.format];
                    case 1:
                        audioFormat = _a.sent();
                        nextSendTime = Date.now();
                        fastLaneSizeMs = this.privRecognizerConfig.parameters.getProperty("SPEECH-TransmitLengthBeforThrottleMs", "5000");
                        maxSendUnthrottledBytes = audioFormat.avgBytesPerSec / 1000 * parseInt(fastLaneSizeMs, 10);
                        startRecogNumber = this.privRequestSession.recogNumber;
                        readAndUploadCycle = function () { return __awaiter(_this, void 0, void 0, function () {
                            var connection, audioStreamChunk, payload, sendDelay;
                            var _this = this;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!(!this.privIsDisposed &&
                                            !this.privRequestSession.isSpeechEnded &&
                                            this.privRequestSession.isRecognizing &&
                                            this.privRequestSession.recogNumber === startRecogNumber)) return [3 /*break*/, 5];
                                        return [4 /*yield*/, this.fetchConnection()];
                                    case 1:
                                        connection = _b.sent();
                                        return [4 /*yield*/, audioStreamNode.read()];
                                    case 2:
                                        audioStreamChunk = _b.sent();
                                        // we have a new audio chunk to upload.
                                        if (this.privRequestSession.isSpeechEnded) {
                                            // If service already recognized audio end then don't send any more audio
                                            return [2 /*return*/];
                                        }
                                        payload = void 0;
                                        sendDelay = void 0;
                                        if (!audioStreamChunk || audioStreamChunk.isEnd) {
                                            payload = null;
                                            sendDelay = 0;
                                        }
                                        else {
                                            payload = audioStreamChunk.buffer;
                                            this.privRequestSession.onAudioSent(payload.byteLength);
                                            if (maxSendUnthrottledBytes >= this.privRequestSession.bytesSent) {
                                                sendDelay = 0;
                                            }
                                            else {
                                                sendDelay = Math.max(0, nextSendTime - Date.now());
                                            }
                                        }
                                        if (!(0 !== sendDelay)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, this.delay(sendDelay)];
                                    case 3:
                                        _b.sent();
                                        _b.label = 4;
                                    case 4:
                                        if (payload !== null) {
                                            nextSendTime = Date.now() + (payload.byteLength * 1000 / (audioFormat.avgBytesPerSec * 2));
                                        }
                                        // Are we still alive?
                                        if (!this.privIsDisposed &&
                                            !this.privRequestSession.isSpeechEnded &&
                                            this.privRequestSession.isRecognizing &&
                                            this.privRequestSession.recogNumber === startRecogNumber) {
                                            connection.send(new SpeechConnectionMessage_Internal_1.SpeechConnectionMessage(Exports_2.MessageType.Binary, "audio", this.privRequestSession.requestId, null, payload)).catch(function () {
                                                _this.privRequestSession.onServiceTurnEndResponse(_this.privRecognizerConfig.isContinuousRecognition).catch(function () { });
                                            });
                                            if (!((_a = audioStreamChunk) === null || _a === void 0 ? void 0 : _a.isEnd)) {
                                                // this.writeBufferToConsole(payload);
                                                // Regardless of success or failure, schedule the next upload.
                                                // If the underlying connection was broken, the next cycle will
                                                // get a new connection and re-transmit missing audio automatically.
                                                return [2 /*return*/, readAndUploadCycle()];
                                            }
                                            else {
                                                // the audio stream has been closed, no need to schedule next
                                                // read-upload cycle.
                                                this.privRequestSession.onSpeechEnded();
                                            }
                                        }
                                        _b.label = 5;
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); };
                        return [2 /*return*/, readAndUploadCycle()];
                }
            });
        });
    };
    ServiceRecognizerBase.prototype.delay = function (delayMs) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.privSetTimeout(resolve, delayMs);
        });
    };
    ServiceRecognizerBase.prototype.writeBufferToConsole = function (buffer) {
        var out = "Buffer Size: ";
        if (null === buffer) {
            out += "null";
        }
        else {
            var readView = new Uint8Array(buffer);
            out += buffer.byteLength + "\r\n";
            for (var i = 0; i < buffer.byteLength; i++) {
                out += readView[i].toString(16).padStart(2, "0") + " ";
            }
        }
        // tslint:disable-next-line:no-console
        console.info(out);
    };
    ServiceRecognizerBase.prototype.sendFinalAudio = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchConnection()];
                    case 1:
                        connection = _a.sent();
                        return [4 /*yield*/, connection.send(new SpeechConnectionMessage_Internal_1.SpeechConnectionMessage(Exports_2.MessageType.Binary, "audio", this.privRequestSession.requestId, null, null))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Takes an established websocket connection to the endpoint and sends speech configuration information.
    ServiceRecognizerBase.prototype.configureConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connectImpl()];
                    case 1:
                        connection = _a.sent();
                        if (this.configConnectionOverride !== undefined) {
                            return [2 /*return*/, this.configConnectionOverride(connection)];
                        }
                        return [4 /*yield*/, this.sendSpeechServiceConfig(connection, this.privRequestSession, this.privRecognizerConfig.SpeechServiceConfig.serialize())];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.sendPrePayloadJSON(connection)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, connection];
                }
            });
        });
    };
    ServiceRecognizerBase.telemetryDataEnabled = true;
    return ServiceRecognizerBase;
}());
exports.ServiceRecognizerBase = ServiceRecognizerBase;

//# sourceMappingURL=ServiceRecognizerBase.js.map