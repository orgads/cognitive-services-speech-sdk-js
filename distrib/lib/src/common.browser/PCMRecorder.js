"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = require("../common/Exports");
var PcmRecorder = /** @class */ (function () {
    function PcmRecorder() {
        var _this = this;
        this.record = function (context, mediaStream, outputStream) {
            var desiredSampleRate = 16000;
            var scriptNode = (function () {
                var bufferSize = 0;
                try {
                    return context.createScriptProcessor(bufferSize, 1, 1);
                }
                catch (error) {
                    // Webkit (<= version 31) requires a valid bufferSize.
                    bufferSize = 2048;
                    var audioSampleRate = context.sampleRate;
                    while (bufferSize < 16384 && audioSampleRate >= (2 * desiredSampleRate)) {
                        bufferSize <<= 1;
                        audioSampleRate >>= 1;
                    }
                    return context.createScriptProcessor(bufferSize, 1, 1);
                }
            })();
            var waveStreamEncoder = new Exports_1.RiffPcmEncoder(context.sampleRate, desiredSampleRate);
            var needHeader = true;
            var that = _this;
            scriptNode.onaudioprocess = function (event) {
                var inputFrame = event.inputBuffer.getChannelData(0);
                if (outputStream && !outputStream.isClosed) {
                    var waveFrame = waveStreamEncoder.encode(inputFrame);
                    if (!!waveFrame) {
                        outputStream.writeStreamChunk({
                            buffer: waveFrame,
                            isEnd: false,
                            timeReceived: Date.now(),
                        });
                        needHeader = false;
                    }
                }
            };
            var micInput = context.createMediaStreamSource(mediaStream);
            // https://webaudio.github.io/web-audio-api/#audioworklet
            // Using AudioWorklet to improve audio quality and avoid audio glitches due to blocking the UI thread
            if (!!_this.privSpeechProcessorScript && !!context.audioWorklet) {
                context.audioWorklet
                    .addModule(_this.privSpeechProcessorScript)
                    .then(function () {
                    var workletNode = new AudioWorkletNode(context, "speech-processor");
                    workletNode.port.onmessage = function (ev) {
                        var inputFrame = ev.data;
                        if (outputStream && !outputStream.isClosed) {
                            var waveFrame = waveStreamEncoder.encode(inputFrame);
                            if (!!waveFrame) {
                                outputStream.writeStreamChunk({
                                    buffer: waveFrame,
                                    isEnd: false,
                                    timeReceived: Date.now(),
                                });
                                needHeader = false;
                            }
                        }
                    };
                    micInput.connect(workletNode);
                    workletNode.connect(context.destination);
                    _this.privMediaResources = {
                        scriptProcessorNode: workletNode,
                        source: micInput,
                        stream: mediaStream,
                    };
                })
                    .catch(function () {
                    micInput.connect(scriptNode);
                    scriptNode.connect(context.destination);
                    _this.privMediaResources = {
                        scriptProcessorNode: scriptNode,
                        source: micInput,
                        stream: mediaStream,
                    };
                });
            }
            else {
                micInput.connect(scriptNode);
                scriptNode.connect(context.destination);
                _this.privMediaResources = {
                    scriptProcessorNode: scriptNode,
                    source: micInput,
                    stream: mediaStream,
                };
            }
        };
        this.releaseMediaResources = function (context) {
            if (_this.privMediaResources) {
                if (_this.privMediaResources.scriptProcessorNode) {
                    _this.privMediaResources.scriptProcessorNode.disconnect(context.destination);
                    _this.privMediaResources.scriptProcessorNode = null;
                }
                if (_this.privMediaResources.source) {
                    _this.privMediaResources.source.disconnect();
                    _this.privMediaResources.stream.getTracks().forEach(function (track) { return track.stop(); });
                    _this.privMediaResources.source = null;
                }
            }
        };
    }
    PcmRecorder.prototype.setWorkletUrl = function (url) {
        this.privSpeechProcessorScript = url;
    };
    return PcmRecorder;
}());
exports.PcmRecorder = PcmRecorder;

//# sourceMappingURL=PCMRecorder.js.map