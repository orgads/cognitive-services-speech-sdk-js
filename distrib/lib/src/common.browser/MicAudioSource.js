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
var AudioStreamFormat_1 = require("../sdk/Audio/AudioStreamFormat");
exports.AudioWorkletSourceURLPropertyName = "MICROPHONE-WorkletSourceUrl";
var MicAudioSource = /** @class */ (function () {
    function MicAudioSource(privRecorder, deviceId, audioSourceId, mediaStream) {
        var _this = this;
        this.privRecorder = privRecorder;
        this.deviceId = deviceId;
        this.privStreams = {};
        this.turnOn = function () {
            if (_this.privInitializeDeferral) {
                return _this.privInitializeDeferral.promise;
            }
            _this.privInitializeDeferral = new Exports_2.Deferred();
            try {
                _this.createAudioContext();
            }
            catch (error) {
                if (error instanceof Error) {
                    var typedError = error;
                    _this.privInitializeDeferral.reject(typedError.name + ": " + typedError.message);
                }
                else {
                    _this.privInitializeDeferral.reject(error);
                }
                return _this.privInitializeDeferral.promise;
            }
            var nav = window.navigator;
            var getUserMedia = (nav.getUserMedia ||
                nav.webkitGetUserMedia ||
                nav.mozGetUserMedia ||
                nav.msGetUserMedia);
            if (!!nav.mediaDevices) {
                getUserMedia = function (constraints, successCallback, errorCallback) {
                    nav.mediaDevices
                        .getUserMedia(constraints)
                        .then(successCallback)
                        .catch(errorCallback);
                };
            }
            if (!getUserMedia) {
                var errorMsg = "Browser does not support getUserMedia.";
                _this.privInitializeDeferral.reject(errorMsg);
                _this.onEvent(new Exports_2.AudioSourceErrorEvent(errorMsg, "")); // mic initialized error - no streamid at this point
            }
            else {
                var next = function () {
                    _this.onEvent(new Exports_2.AudioSourceInitializingEvent(_this.privId)); // no stream id
                    if (_this.privMediaStream && _this.privMediaStream.active) {
                        _this.onEvent(new Exports_2.AudioSourceReadyEvent(_this.privId));
                        _this.privInitializeDeferral.resolve();
                    }
                    else {
                        getUserMedia({ audio: _this.deviceId ? { deviceId: _this.deviceId } : true, video: false }, function (mediaStream) {
                            _this.privMediaStream = mediaStream;
                            _this.onEvent(new Exports_2.AudioSourceReadyEvent(_this.privId));
                            _this.privInitializeDeferral.resolve();
                        }, function (error) {
                            var errorMsg = "Error occurred during microphone initialization: " + error;
                            _this.privInitializeDeferral.reject(errorMsg);
                            _this.onEvent(new Exports_2.AudioSourceErrorEvent(_this.privId, errorMsg));
                        });
                    }
                };
                if (_this.privContext.state === "suspended") {
                    // NOTE: On iOS, the Web Audio API requires sounds to be triggered from an explicit user action.
                    // https://github.com/WebAudio/web-audio-api/issues/790
                    _this.privContext.resume()
                        .then(next)
                        .catch(function (reason) {
                        _this.privInitializeDeferral.reject("Failed to initialize audio context: " + reason);
                    });
                }
                else {
                    next();
                }
            }
            return _this.privInitializeDeferral.promise;
        };
        this.id = function () {
            return _this.privId;
        };
        this.attach = function (audioNodeId) {
            _this.onEvent(new Exports_2.AudioStreamNodeAttachingEvent(_this.privId, audioNodeId));
            return _this.listen(audioNodeId).then(function (stream) {
                _this.onEvent(new Exports_2.AudioStreamNodeAttachedEvent(_this.privId, audioNodeId));
                return {
                    detach: function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            stream.readEnded();
                            delete this.privStreams[audioNodeId];
                            this.onEvent(new Exports_2.AudioStreamNodeDetachedEvent(this.privId, audioNodeId));
                            return [2 /*return*/, this.turnOff()];
                        });
                    }); },
                    id: function () {
                        return audioNodeId;
                    },
                    read: function () {
                        return stream.read();
                    },
                };
            });
        };
        this.detach = function (audioNodeId) {
            if (audioNodeId && _this.privStreams[audioNodeId]) {
                _this.privStreams[audioNodeId].close();
                delete _this.privStreams[audioNodeId];
                _this.onEvent(new Exports_2.AudioStreamNodeDetachedEvent(_this.privId, audioNodeId));
            }
        };
        this.listen = function (audioNodeId) { return __awaiter(_this, void 0, void 0, function () {
            var stream, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.turnOn()];
                    case 1:
                        _a.sent();
                        stream = new Exports_2.ChunkedArrayBufferStream(this.privOutputChunkSize, audioNodeId);
                        this.privStreams[audioNodeId] = stream;
                        try {
                            this.privRecorder.record(this.privContext, this.privMediaStream, stream);
                        }
                        catch (error) {
                            this.onEvent(new Exports_2.AudioStreamNodeErrorEvent(this.privId, audioNodeId, error));
                            throw error;
                        }
                        result = stream;
                        return [2 /*return*/, result];
                }
            });
        }); };
        this.onEvent = function (event) {
            _this.privEvents.onEvent(event);
            Exports_2.Events.instance.onEvent(event);
        };
        this.createAudioContext = function () {
            if (!!_this.privContext) {
                return;
            }
            _this.privContext = AudioStreamFormat_1.AudioStreamFormatImpl.getAudioContext(MicAudioSource.AUDIOFORMAT.samplesPerSec);
        };
        this.privOutputChunkSize = MicAudioSource.AUDIOFORMAT.avgBytesPerSec / 10;
        this.privId = audioSourceId ? audioSourceId : Exports_2.createNoDashGuid();
        this.privEvents = new Exports_2.EventSource();
        this.privMediaStream = mediaStream || null;
    }
    Object.defineProperty(MicAudioSource.prototype, "format", {
        get: function () {
            return Promise.resolve(MicAudioSource.AUDIOFORMAT);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MicAudioSource.prototype, "blob", {
        get: function () {
            return Promise.reject("Not implemented for Mic input");
        },
        enumerable: true,
        configurable: true
    });
    MicAudioSource.prototype.turnOff = function () {
        return __awaiter(this, void 0, void 0, function () {
            var streamId, stream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        for (streamId in this.privStreams) {
                            if (streamId) {
                                stream = this.privStreams[streamId];
                                if (stream) {
                                    stream.close();
                                }
                            }
                        }
                        this.onEvent(new Exports_2.AudioSourceOffEvent(this.privId)); // no stream now
                        this.privInitializeDeferral = null;
                        return [4 /*yield*/, this.destroyAudioContext()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(MicAudioSource.prototype, "events", {
        get: function () {
            return this.privEvents;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MicAudioSource.prototype, "deviceInfo", {
        get: function () {
            return this.getMicrophoneLabel().then(function (label) {
                return {
                    bitspersample: MicAudioSource.AUDIOFORMAT.bitsPerSample,
                    channelcount: MicAudioSource.AUDIOFORMAT.channels,
                    connectivity: Exports_1.connectivity.Unknown,
                    manufacturer: "Speech SDK",
                    model: label,
                    samplerate: MicAudioSource.AUDIOFORMAT.samplesPerSec,
                    type: Exports_1.type.Microphones,
                };
            });
        },
        enumerable: true,
        configurable: true
    });
    MicAudioSource.prototype.setProperty = function (name, value) {
        if (name === exports.AudioWorkletSourceURLPropertyName) {
            this.privRecorder.setWorkletUrl(value);
        }
        else {
            throw new Error("Property '" + name + "' is not supported on Microphone.");
        }
    };
    MicAudioSource.prototype.getMicrophoneLabel = function () {
        var _this = this;
        var defaultMicrophoneName = "microphone";
        // If we did this already, return the value.
        if (this.privMicrophoneLabel !== undefined) {
            return Promise.resolve(this.privMicrophoneLabel);
        }
        // If the stream isn't currently running, we can't query devices because security.
        if (this.privMediaStream === undefined || !this.privMediaStream.active) {
            return Promise.resolve(defaultMicrophoneName);
        }
        // Setup a default
        this.privMicrophoneLabel = defaultMicrophoneName;
        // Get the id of the device running the audio track.
        var microphoneDeviceId = this.privMediaStream.getTracks()[0].getSettings().deviceId;
        // If the browser doesn't support getting the device ID, set a default and return.
        if (undefined === microphoneDeviceId) {
            return Promise.resolve(this.privMicrophoneLabel);
        }
        var deferred = new Exports_2.Deferred();
        // Enumerate the media devices.
        navigator.mediaDevices.enumerateDevices().then(function (devices) {
            for (var _i = 0, devices_1 = devices; _i < devices_1.length; _i++) {
                var device = devices_1[_i];
                if (device.deviceId === microphoneDeviceId) {
                    // Found the device
                    _this.privMicrophoneLabel = device.label;
                    break;
                }
            }
            deferred.resolve(_this.privMicrophoneLabel);
        }, function () { return deferred.resolve(_this.privMicrophoneLabel); });
        return deferred.promise;
    };
    MicAudioSource.prototype.destroyAudioContext = function () {
        return __awaiter(this, void 0, void 0, function () {
            var hasClose;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.privContext) {
                            return [2 /*return*/];
                        }
                        this.privRecorder.releaseMediaResources(this.privContext);
                        hasClose = false;
                        if ("close" in this.privContext) {
                            hasClose = true;
                        }
                        if (!hasClose) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.privContext.close()];
                    case 1:
                        _a.sent();
                        this.privContext = null;
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(null !== this.privContext && this.privContext.state === "running")) return [3 /*break*/, 4];
                        // Suspend actually takes a callback, but analogous to the
                        // resume method, it'll be only fired if suspend is called
                        // in a direct response to a user action. The later is not always
                        // the case, as TurnOff is also called, when we receive an
                        // end-of-speech message from the service. So, doing a best effort
                        // fire-and-forget here.
                        return [4 /*yield*/, this.privContext.suspend()];
                    case 3:
                        // Suspend actually takes a callback, but analogous to the
                        // resume method, it'll be only fired if suspend is called
                        // in a direct response to a user action. The later is not always
                        // the case, as TurnOff is also called, when we receive an
                        // end-of-speech message from the service. So, doing a best effort
                        // fire-and-forget here.
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MicAudioSource.AUDIOFORMAT = AudioStreamFormat_1.AudioStreamFormat.getDefaultInputFormat();
    return MicAudioSource;
}());
exports.MicAudioSource = MicAudioSource;

//# sourceMappingURL=MicAudioSource.js.map