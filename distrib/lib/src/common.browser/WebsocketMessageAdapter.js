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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var HeaderNames_1 = require("../common.speech/HeaderNames");
var Exports_1 = require("../common/Exports");
// Node.JS specific web socket / browser support.
var ws_1 = __importDefault(require("ws"));
var CertChecks_1 = require("./CertChecks");
var WebsocketMessageAdapter = /** @class */ (function () {
    function WebsocketMessageAdapter(uri, connectionId, messageFormatter, proxyInfo, headers, enableCompression) {
        var _this = this;
        this.open = function () {
            if (_this.privConnectionState === Exports_1.ConnectionState.Disconnected) {
                return Promise.reject("Cannot open a connection that is in " + _this.privConnectionState + " state");
            }
            if (_this.privConnectionEstablishDeferral) {
                return _this.privConnectionEstablishDeferral.promise;
            }
            _this.privConnectionEstablishDeferral = new Exports_1.Deferred();
            _this.privCertificateValidatedDeferral = new Exports_1.Deferred();
            _this.privConnectionState = Exports_1.ConnectionState.Connecting;
            try {
                if (typeof WebSocket !== "undefined" && !WebsocketMessageAdapter.forceNpmWebSocket) {
                    // Browser handles cert checks.
                    _this.privCertificateValidatedDeferral.resolve();
                    _this.privWebsocketClient = new WebSocket(_this.privUri);
                }
                else {
                    var options = { headers: _this.privHeaders, perMessageDeflate: _this.privEnableCompression };
                    // The ocsp library will handle validation for us and fail the connection if needed.
                    _this.privCertificateValidatedDeferral.resolve();
                    var checkAgent = new CertChecks_1.CertCheckAgent(_this.proxyInfo);
                    options.agent = checkAgent.GetAgent();
                    _this.privWebsocketClient = new ws_1.default(_this.privUri, options);
                }
                _this.privWebsocketClient.binaryType = "arraybuffer";
                _this.privReceivingMessageQueue = new Exports_1.Queue();
                _this.privDisconnectDeferral = new Exports_1.Deferred();
                _this.privSendMessageQueue = new Exports_1.Queue();
                _this.processSendQueue().catch(function (reason) {
                    Exports_1.Events.instance.onEvent(new Exports_1.BackgroundEvent(reason));
                });
            }
            catch (error) {
                _this.privConnectionEstablishDeferral.resolve(new Exports_1.ConnectionOpenResponse(500, error));
                return _this.privConnectionEstablishDeferral.promise;
            }
            _this.onEvent(new Exports_1.ConnectionStartEvent(_this.privConnectionId, _this.privUri));
            _this.privWebsocketClient.onopen = function (e) {
                _this.privCertificateValidatedDeferral.promise.then(function () {
                    _this.privConnectionState = Exports_1.ConnectionState.Connected;
                    _this.onEvent(new Exports_1.ConnectionEstablishedEvent(_this.privConnectionId));
                    _this.privConnectionEstablishDeferral.resolve(new Exports_1.ConnectionOpenResponse(200, ""));
                }, function (error) {
                    _this.privConnectionEstablishDeferral.reject(error);
                });
            };
            _this.privWebsocketClient.onerror = function (e) {
                _this.onEvent(new Exports_1.ConnectionErrorEvent(_this.privConnectionId, e.message, e.type));
                _this.privLastErrorReceived = e.message;
            };
            _this.privWebsocketClient.onclose = function (e) {
                if (_this.privConnectionState === Exports_1.ConnectionState.Connecting) {
                    _this.privConnectionState = Exports_1.ConnectionState.Disconnected;
                    // this.onEvent(new ConnectionEstablishErrorEvent(this.connectionId, e.code, e.reason));
                    _this.privConnectionEstablishDeferral.resolve(new Exports_1.ConnectionOpenResponse(e.code, e.reason + " " + _this.privLastErrorReceived));
                }
                else {
                    _this.privConnectionState = Exports_1.ConnectionState.Disconnected;
                    _this.onEvent(new Exports_1.ConnectionClosedEvent(_this.privConnectionId, e.code, e.reason));
                }
                _this.onClose(e.code, e.reason).catch(function (reason) {
                    Exports_1.Events.instance.onEvent(new Exports_1.BackgroundEvent(reason));
                });
            };
            _this.privWebsocketClient.onmessage = function (e) {
                var networkReceivedTime = new Date().toISOString();
                if (_this.privConnectionState === Exports_1.ConnectionState.Connected) {
                    var deferred_1 = new Exports_1.Deferred();
                    // let id = ++this.idCounter;
                    _this.privReceivingMessageQueue.enqueueFromPromise(deferred_1.promise);
                    if (e.data instanceof ArrayBuffer) {
                        var rawMessage = new Exports_1.RawWebsocketMessage(Exports_1.MessageType.Binary, e.data);
                        _this.privMessageFormatter
                            .toConnectionMessage(rawMessage)
                            .then(function (connectionMessage) {
                            _this.onEvent(new Exports_1.ConnectionMessageReceivedEvent(_this.privConnectionId, networkReceivedTime, connectionMessage));
                            deferred_1.resolve(connectionMessage);
                        }, function (error) {
                            // TODO: Events for these ?
                            deferred_1.reject("Invalid binary message format. Error: " + error);
                        });
                    }
                    else {
                        var rawMessage = new Exports_1.RawWebsocketMessage(Exports_1.MessageType.Text, e.data);
                        _this.privMessageFormatter
                            .toConnectionMessage(rawMessage)
                            .then(function (connectionMessage) {
                            _this.onEvent(new Exports_1.ConnectionMessageReceivedEvent(_this.privConnectionId, networkReceivedTime, connectionMessage));
                            deferred_1.resolve(connectionMessage);
                        }, function (error) {
                            // TODO: Events for these ?
                            deferred_1.reject("Invalid text message format. Error: " + error);
                        });
                    }
                }
            };
            return _this.privConnectionEstablishDeferral.promise;
        };
        this.send = function (message) {
            if (_this.privConnectionState !== Exports_1.ConnectionState.Connected) {
                return Promise.reject("Cannot send on connection that is in " + Exports_1.ConnectionState[_this.privConnectionState] + " state");
            }
            var messageSendStatusDeferral = new Exports_1.Deferred();
            var messageSendDeferral = new Exports_1.Deferred();
            _this.privSendMessageQueue.enqueueFromPromise(messageSendDeferral.promise);
            _this.privMessageFormatter
                .fromConnectionMessage(message)
                .then(function (rawMessage) {
                messageSendDeferral.resolve({
                    Message: message,
                    RawWebsocketMessage: rawMessage,
                    sendStatusDeferral: messageSendStatusDeferral,
                });
            }, function (error) {
                messageSendDeferral.reject("Error formatting the message. " + error);
            });
            return messageSendStatusDeferral.promise;
        };
        this.read = function () {
            if (_this.privConnectionState !== Exports_1.ConnectionState.Connected) {
                return Promise.reject("Cannot read on connection that is in " + _this.privConnectionState + " state");
            }
            return _this.privReceivingMessageQueue.dequeue();
        };
        this.close = function (reason) {
            if (_this.privWebsocketClient) {
                if (_this.privConnectionState !== Exports_1.ConnectionState.Disconnected) {
                    _this.privWebsocketClient.close(1000, reason ? reason : "Normal closure by client");
                }
            }
            else {
                return Promise.resolve();
            }
            return _this.privDisconnectDeferral.promise;
        };
        this.sendRawMessage = function (sendItem) {
            try {
                // indicates we are draining the queue and it came with no message;
                if (!sendItem) {
                    return Promise.resolve();
                }
                _this.onEvent(new Exports_1.ConnectionMessageSentEvent(_this.privConnectionId, new Date().toISOString(), sendItem.Message));
                // add a check for the ws readystate in order to stop the red console error 'WebSocket is already in CLOSING or CLOSED state' appearing
                if (_this.isWebsocketOpen) {
                    _this.privWebsocketClient.send(sendItem.RawWebsocketMessage.payload);
                }
                else {
                    return Promise.reject("websocket send error: Websocket not ready " + _this.privConnectionId + " " + sendItem.Message.id + " " + new Error().stack);
                }
                return Promise.resolve();
            }
            catch (e) {
                return Promise.reject("websocket send error: " + e);
            }
        };
        this.onEvent = function (event) {
            _this.privConnectionEvents.onEvent(event);
            Exports_1.Events.instance.onEvent(event);
        };
        if (!uri) {
            throw new Exports_1.ArgumentNullError("uri");
        }
        if (!messageFormatter) {
            throw new Exports_1.ArgumentNullError("messageFormatter");
        }
        this.proxyInfo = proxyInfo;
        this.privConnectionEvents = new Exports_1.EventSource();
        this.privConnectionId = connectionId;
        this.privMessageFormatter = messageFormatter;
        this.privConnectionState = Exports_1.ConnectionState.None;
        this.privUri = uri;
        this.privHeaders = headers;
        this.privEnableCompression = enableCompression;
        // Add the connection ID to the headers
        this.privHeaders[HeaderNames_1.HeaderNames.ConnectionId] = this.privConnectionId;
        this.privLastErrorReceived = "";
    }
    Object.defineProperty(WebsocketMessageAdapter.prototype, "state", {
        get: function () {
            return this.privConnectionState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebsocketMessageAdapter.prototype, "events", {
        get: function () {
            return this.privConnectionEvents;
        },
        enumerable: true,
        configurable: true
    });
    WebsocketMessageAdapter.prototype.onClose = function (code, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var closeReason;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        closeReason = "Connection closed. " + code + ": " + reason;
                        this.privConnectionState = Exports_1.ConnectionState.Disconnected;
                        this.privDisconnectDeferral.resolve();
                        return [4 /*yield*/, this.privReceivingMessageQueue.drainAndDispose(function (pendingReceiveItem) {
                                // TODO: Events for these ?
                                // Logger.instance.onEvent(new LoggingEvent(LogType.Warning, null, `Failed to process received message. Reason: ${closeReason}, Message: ${JSON.stringify(pendingReceiveItem)}`));
                            }, closeReason)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.privSendMessageQueue.drainAndDispose(function (pendingSendItem) {
                                pendingSendItem.sendStatusDeferral.reject(closeReason);
                            }, closeReason)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    WebsocketMessageAdapter.prototype.processSendQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var itemToSend, sendItem, sendError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!true) return [3 /*break*/, 6];
                        itemToSend = this.privSendMessageQueue.dequeue();
                        return [4 /*yield*/, itemToSend];
                    case 1:
                        sendItem = _a.sent();
                        // indicates we are draining the queue and it came with no message;
                        if (!sendItem) {
                            return [2 /*return*/];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.sendRawMessage(sendItem)];
                    case 3:
                        _a.sent();
                        sendItem.sendStatusDeferral.resolve();
                        return [3 /*break*/, 5];
                    case 4:
                        sendError_1 = _a.sent();
                        sendItem.sendStatusDeferral.reject(sendError_1);
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 0];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(WebsocketMessageAdapter.prototype, "isWebsocketOpen", {
        get: function () {
            return this.privWebsocketClient && this.privWebsocketClient.readyState === this.privWebsocketClient.OPEN;
        },
        enumerable: true,
        configurable: true
    });
    WebsocketMessageAdapter.forceNpmWebSocket = false;
    return WebsocketMessageAdapter;
}());
exports.WebsocketMessageAdapter = WebsocketMessageAdapter;

//# sourceMappingURL=WebsocketMessageAdapter.js.map