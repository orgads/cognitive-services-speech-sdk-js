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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents audio stream format used for custom audio input configurations.
 * @class AudioStreamFormat
 */
var AudioStreamFormat = /** @class */ (function () {
    function AudioStreamFormat() {
    }
    /**
     * Creates an audio stream format object representing the default audio stream
     * format (16KHz 16bit mono PCM).
     * @member AudioStreamFormat.getDefaultInputFormat
     * @function
     * @public
     * @returns {AudioStreamFormat} The audio stream format being created.
     */
    AudioStreamFormat.getDefaultInputFormat = function () {
        return AudioStreamFormatImpl.getDefaultInputFormat();
    };
    /**
     * Creates an audio stream format object with the specified pcm waveformat characteristics.
     * @member AudioStreamFormat.getWaveFormatPCM
     * @function
     * @public
     * @param {number} samplesPerSecond - Sample rate, in samples per second (Hertz).
     * @param {number} bitsPerSample - Bits per sample, typically 16.
     * @param {number} channels - Number of channels in the waveform-audio data. Monaural data
     *        uses one channel and stereo data uses two channels.
     * @returns {AudioStreamFormat} The audio stream format being created.
     */
    AudioStreamFormat.getWaveFormatPCM = function (samplesPerSecond, bitsPerSample, channels) {
        return new AudioStreamFormatImpl(samplesPerSecond, bitsPerSample, channels);
    };
    return AudioStreamFormat;
}());
exports.AudioStreamFormat = AudioStreamFormat;
/**
 * @private
 * @class AudioStreamFormatImpl
 */
// tslint:disable-next-line:max-classes-per-file
var AudioStreamFormatImpl = /** @class */ (function (_super) {
    __extends(AudioStreamFormatImpl, _super);
    /**
     * Creates an instance with the given values.
     * @constructor
     * @param {number} samplesPerSec - Samples per second.
     * @param {number} bitsPerSample - Bits per sample.
     * @param {number} channels - Number of channels.
     */
    function AudioStreamFormatImpl(samplesPerSec, bitsPerSample, channels) {
        if (samplesPerSec === void 0) { samplesPerSec = 16000; }
        if (bitsPerSample === void 0) { bitsPerSample = 16; }
        if (channels === void 0) { channels = 1; }
        var _this = _super.call(this) || this;
        _this.setString = function (view, offset, str) {
            for (var i = 0; i < str.length; i++) {
                view.setUint8(offset + i, str.charCodeAt(i));
            }
        };
        _this.formatTag = 1;
        _this.bitsPerSample = bitsPerSample;
        _this.samplesPerSec = samplesPerSec;
        _this.channels = channels;
        _this.avgBytesPerSec = _this.samplesPerSec * _this.channels * (_this.bitsPerSample / 8);
        _this.blockAlign = _this.channels * Math.max(_this.bitsPerSample, 8);
        _this.privHeader = new ArrayBuffer(44);
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
        var view = new DataView(_this.privHeader);
        /* RIFF identifier */
        _this.setString(view, 0, "RIFF");
        /* file length */
        view.setUint32(4, 0, true);
        /* RIFF type & Format */
        _this.setString(view, 8, "WAVEfmt ");
        /* format chunk length */
        view.setUint32(16, 16, true);
        /* sample format (raw) */
        view.setUint16(20, 1, true);
        /* channel count */
        view.setUint16(22, _this.channels, true);
        /* sample rate */
        view.setUint32(24, _this.samplesPerSec, true);
        /* byte rate (sample rate * block align) */
        view.setUint32(28, _this.avgBytesPerSec, true);
        /* block align (channel count * bytes per sample) */
        view.setUint16(32, _this.channels * (_this.bitsPerSample / 8), true);
        /* bits per sample */
        view.setUint16(34, _this.bitsPerSample, true);
        /* data chunk identifier */
        _this.setString(view, 36, "data");
        /* data chunk length */
        view.setUint32(40, 0, true);
        return _this;
    }
    /**
     * Retrieves the default input format.
     * @member AudioStreamFormatImpl.getDefaultInputFormat
     * @function
     * @public
     * @returns {AudioStreamFormatImpl} The default input format.
     */
    AudioStreamFormatImpl.getDefaultInputFormat = function () {
        return new AudioStreamFormatImpl();
    };
    /**
     * Creates an audio context appropriate to current browser
     * @member AudioStreamFormatImpl.getAudioContext
     * @function
     * @public
     * @returns {AudioContext} An audio context instance
     */
    AudioStreamFormatImpl.getAudioContext = function (sampleRate) {
        // Workaround for Speech SDK bug in Safari.
        var AudioContext = window.AudioContext // our preferred impl
            || window.webkitAudioContext // fallback, mostly when on Safari
            || false; // could not find.
        // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
        if (!!AudioContext) {
            if (sampleRate !== undefined && navigator.mediaDevices.getSupportedConstraints().sampleRate) {
                return new AudioContext({ sampleRate: sampleRate });
            }
            else {
                return new AudioContext();
            }
        }
        else {
            throw new Error("Browser does not support Web Audio API (AudioContext is not available).");
        }
    };
    /**
     * Closes the configuration object.
     * @member AudioStreamFormatImpl.prototype.close
     * @function
     * @public
     */
    AudioStreamFormatImpl.prototype.close = function () { return; };
    Object.defineProperty(AudioStreamFormatImpl.prototype, "header", {
        get: function () {
            return this.privHeader;
        },
        enumerable: true,
        configurable: true
    });
    return AudioStreamFormatImpl;
}(AudioStreamFormat));
exports.AudioStreamFormatImpl = AudioStreamFormatImpl;

//# sourceMappingURL=AudioStreamFormat.js.map