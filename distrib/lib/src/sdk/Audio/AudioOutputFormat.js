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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var SpeechSynthesisOutputFormat_1 = require("../SpeechSynthesisOutputFormat");
var AudioStreamFormat_1 = require("./AudioStreamFormat");
var AudioFormatTag;
(function (AudioFormatTag) {
    AudioFormatTag[AudioFormatTag["PCM"] = 1] = "PCM";
    AudioFormatTag[AudioFormatTag["MuLaw"] = 2] = "MuLaw";
    AudioFormatTag[AudioFormatTag["Siren"] = 3] = "Siren";
    AudioFormatTag[AudioFormatTag["MP3"] = 4] = "MP3";
    AudioFormatTag[AudioFormatTag["SILKSkype"] = 5] = "SILKSkype";
    AudioFormatTag[AudioFormatTag["Opus"] = 6] = "Opus";
})(AudioFormatTag = exports.AudioFormatTag || (exports.AudioFormatTag = {}));
/**
 * @private
 * @class AudioOutputFormatImpl
 * Added in version 1.11.0
 */
// tslint:disable-next-line:max-classes-per-file
var AudioOutputFormatImpl = /** @class */ (function (_super) {
    __extends(AudioOutputFormatImpl, _super);
    /**
     * Creates an instance with the given values.
     * @constructor
     * @param formatTag
     * @param {number} channels - Number of channels.
     * @param {number} samplesPerSec - Samples per second.
     * @param {number} avgBytesPerSec - Average bytes per second.
     * @param {number} blockAlign - Block alignment.
     * @param {number} bitsPerSample - Bits per sample.
     * @param {string} audioFormatString - Audio format string
     * @param {string} requestAudioFormatString - Audio format string sent to service.
     * @param {boolean} hasHeader - If the format has header or not.
     */
    function AudioOutputFormatImpl(formatTag, channels, samplesPerSec, avgBytesPerSec, blockAlign, bitsPerSample, audioFormatString, requestAudioFormatString, hasHeader) {
        var _this = _super.call(this, samplesPerSec, bitsPerSample, channels) || this;
        _this.formatTag = formatTag;
        _this.avgBytesPerSec = avgBytesPerSec;
        _this.blockAlign = blockAlign;
        _this.priAudioFormatString = audioFormatString;
        _this.priRequestAudioFormatString = requestAudioFormatString;
        _this.priHasHeader = hasHeader;
        return _this;
    }
    AudioOutputFormatImpl.fromSpeechSynthesisOutputFormat = function (speechSynthesisOutputFormat) {
        if (speechSynthesisOutputFormat === undefined) {
            return AudioOutputFormatImpl.getDefaultOutputFormat();
        }
        return AudioOutputFormatImpl.fromSpeechSynthesisOutputFormatString(AudioOutputFormatImpl.SpeechSynthesisOutputFormatToString[speechSynthesisOutputFormat]);
    };
    AudioOutputFormatImpl.fromSpeechSynthesisOutputFormatString = function (speechSynthesisOutputFormatString) {
        switch (speechSynthesisOutputFormatString) {
            case "raw-8khz-8bit-mono-mulaw":
                return new AudioOutputFormatImpl(AudioFormatTag.PCM, 1, 8000, 8000, 1, 8, speechSynthesisOutputFormatString, speechSynthesisOutputFormatString, false);
            case "riff-16khz-16kbps-mono-siren":
                return new AudioOutputFormatImpl(AudioFormatTag.Siren, 1, 16000, 2000, 40, 0, speechSynthesisOutputFormatString, "audio-16khz-16kbps-mono-siren", true);
            case "audio-16khz-16kbps-mono-siren":
                return new AudioOutputFormatImpl(AudioFormatTag.Siren, 1, 16000, 2000, 40, 0, speechSynthesisOutputFormatString, speechSynthesisOutputFormatString, false);
            case "audio-16khz-32kbitrate-mono-mp3":
                return new AudioOutputFormatImpl(AudioFormatTag.MP3, 1, 16000, 32 << 7, 2, 16, speechSynthesisOutputFormatString, speechSynthesisOutputFormatString, false);
            case "audio-16khz-128kbitrate-mono-mp3":
                return new AudioOutputFormatImpl(AudioFormatTag.MP3, 1, 16000, 128 << 7, 2, 16, speechSynthesisOutputFormatString, speechSynthesisOutputFormatString, false);
            case "audio-16khz-64kbitrate-mono-mp3":
                return new AudioOutputFormatImpl(AudioFormatTag.MP3, 1, 16000, 64 << 7, 2, 16, speechSynthesisOutputFormatString, speechSynthesisOutputFormatString, false);
            case "audio-24khz-48kbitrate-mono-mp3":
                return new AudioOutputFormatImpl(AudioFormatTag.MP3, 1, 24000, 48 << 7, 2, 16, speechSynthesisOutputFormatString, speechSynthesisOutputFormatString, false);
            case "audio-24khz-96kbitrate-mono-mp3":
                return new AudioOutputFormatImpl(AudioFormatTag.MP3, 1, 24000, 96 << 7, 2, 16, speechSynthesisOutputFormatString, speechSynthesisOutputFormatString, false);
            case "audio-24khz-160kbitrate-mono-mp3":
                return new AudioOutputFormatImpl(AudioFormatTag.MP3, 1, 24000, 160 << 7, 2, 16, speechSynthesisOutputFormatString, speechSynthesisOutputFormatString, false);
            case "raw-16khz-16bit-mono-truesilk":
                return new AudioOutputFormatImpl(AudioFormatTag.SILKSkype, 1, 16000, 32000, 2, 16, speechSynthesisOutputFormatString, speechSynthesisOutputFormatString, false);
            case "riff-8khz-16bit-mono-pcm":
                return new AudioOutputFormatImpl(AudioFormatTag.PCM, 1, 8000, 16000, 2, 16, speechSynthesisOutputFormatString, "raw-8khz-16bit-mono-pcm", true);
            case "riff-24khz-16bit-mono-pcm":
                return new AudioOutputFormatImpl(AudioFormatTag.PCM, 1, 24000, 48000, 2, 16, speechSynthesisOutputFormatString, "raw-24khz-16bit-mono-pcm", true);
            case "riff-8khz-8bit-mono-mulaw":
                return new AudioOutputFormatImpl(AudioFormatTag.MuLaw, 1, 8000, 8000, 1, 8, speechSynthesisOutputFormatString, "raw-8khz-8bit-mono-mulaw", true);
            case "raw-16khz-16bit-mono-pcm":
                return new AudioOutputFormatImpl(AudioFormatTag.PCM, 1, 16000, 32000, 2, 16, speechSynthesisOutputFormatString, "raw-16khz-16bit-mono-pcm", false);
            case "raw-24khz-16bit-mono-pcm":
                return new AudioOutputFormatImpl(AudioFormatTag.PCM, 1, 24000, 48000, 2, 16, speechSynthesisOutputFormatString, "raw-24khz-16bit-mono-pcm", false);
            case "raw-8khz-16bit-mono-pcm":
                return new AudioOutputFormatImpl(AudioFormatTag.PCM, 1, 8000, 16000, 2, 16, speechSynthesisOutputFormatString, "raw-8khz-16bit-mono-pcm", false);
            case "ogg-16khz-16bit-mono-opus":
                return new AudioOutputFormatImpl(AudioFormatTag.Opus, 1, 16000, 8192, 2, 16, speechSynthesisOutputFormatString, "ogg-16khz-16bit-mono-opus", false);
            case "ogg-24khz-16bit-mono-opus":
                return new AudioOutputFormatImpl(AudioFormatTag.Opus, 1, 24000, 8192, 2, 16, speechSynthesisOutputFormatString, "ogg-24khz-16bit-mono-opus", false);
            case "raw-48khz-16bit-mono-pcm":
                return new AudioOutputFormatImpl(AudioFormatTag.PCM, 1, 48000, 96000, 2, 16, speechSynthesisOutputFormatString, "raw-48khz-16bit-mono-pcm", false);
            case "riff-48khz-16bit-mono-pcm":
                return new AudioOutputFormatImpl(AudioFormatTag.PCM, 1, 48000, 96000, 2, 16, speechSynthesisOutputFormatString, "raw-48khz-16bit-mono-pcm", true);
            case "audio-48khz-96kbitrate-mono-mp3":
                return new AudioOutputFormatImpl(AudioFormatTag.MP3, 1, 48000, 96 << 7, 2, 16, speechSynthesisOutputFormatString, speechSynthesisOutputFormatString, false);
            case "audio-48khz-192kbitrate-mono-mp3":
                return new AudioOutputFormatImpl(AudioFormatTag.MP3, 1, 48000, 192 << 7, 2, 16, speechSynthesisOutputFormatString, speechSynthesisOutputFormatString, false);
            case "riff-16khz-16bit-mono-pcm":
            default:
                return new AudioOutputFormatImpl(AudioFormatTag.PCM, 1, 16000, 32000, 2, 16, "riff-16khz-16bit-mono-pcm", "raw-16khz-16bit-mono-pcm", true);
        }
    };
    AudioOutputFormatImpl.getDefaultOutputFormat = function () {
        return AudioOutputFormatImpl.fromSpeechSynthesisOutputFormatString((typeof window !== "undefined") ? "audio-24khz-48kbitrate-mono-mp3" : "riff-16khz-16bit-mono-pcm");
    };
    Object.defineProperty(AudioOutputFormatImpl.prototype, "hasHeader", {
        /**
         * Specifies if this audio output format has a header
         * @boolean AudioOutputFormatImpl.prototype.hasHeader
         * @function
         * @public
         */
        get: function () {
            return this.priHasHeader;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AudioOutputFormatImpl.prototype, "header", {
        /**
         * Specifies the header of this format
         * @ArrayBuffer AudioOutputFormatImpl.prototype.header
         * @function
         * @public
         */
        get: function () {
            if (this.hasHeader) {
                return this.privHeader;
            }
            return undefined;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Updates the header based on the audio length
     * @member AudioOutputFormatImpl.updateHeader
     * @function
     * @public
     * @param {number} audioLength - the audio length
     */
    AudioOutputFormatImpl.prototype.updateHeader = function (audioLength) {
        if (this.priHasHeader) {
            var view = new DataView(this.privHeader);
            view.setUint32(40, audioLength, true);
        }
    };
    Object.defineProperty(AudioOutputFormatImpl.prototype, "requestAudioFormatString", {
        /**
         * Specifies the audio format string to be sent to the service
         * @string AudioOutputFormatImpl.prototype.requestAudioFormatString
         * @function
         * @public
         */
        get: function () {
            return this.priRequestAudioFormatString;
        },
        enumerable: true,
        configurable: true
    });
    AudioOutputFormatImpl.SpeechSynthesisOutputFormatToString = (_a = {},
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Raw8Khz8BitMonoMULaw] = "raw-8khz-8bit-mono-mulaw",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Riff16Khz16KbpsMonoSiren] = "riff-16khz-16kbps-mono-siren",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Audio16Khz16KbpsMonoSiren] = "audio-16khz-16kbps-mono-siren",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3] = "audio-16khz-32kbitrate-mono-mp3",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3] = "audio-16khz-128kbitrate-mono-mp3",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Audio16Khz64KBitRateMonoMp3] = "audio-16khz-64kbitrate-mono-mp3",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3] = "audio-24khz-48kbitrate-mono-mp3",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Audio24Khz96KBitRateMonoMp3] = "audio-24khz-96kbitrate-mono-mp3",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3] = "audio-24khz-160kbitrate-mono-mp3",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Raw16Khz16BitMonoTrueSilk] = "raw-16khz-16bit-mono-truesilk",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Riff16Khz16BitMonoPcm] = "riff-16khz-16bit-mono-pcm",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Riff8Khz16BitMonoPcm] = "riff-8khz-16bit-mono-pcm",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm] = "riff-24khz-16bit-mono-pcm",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Riff8Khz8BitMonoMULaw] = "riff-8khz-8bit-mono-mulaw",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Raw16Khz16BitMonoPcm] = "raw-16khz-16bit-mono-pcm",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Raw24Khz16BitMonoPcm] = "raw-24khz-16bit-mono-pcm",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Raw8Khz16BitMonoPcm] = "raw-8khz-16bit-mono-pcm",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Ogg16Khz16BitMonoOpus] = "ogg-16khz-16bit-mono-opus",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Ogg24Khz16BitMonoOpus] = "ogg-24khz-16bit-mono-opus",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Raw48Khz16BitMonoPcm] = "raw-48khz-16bit-mono-pcm",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Riff48Khz16BitMonoPcm] = "riff-48khz-16bit-mono-pcm",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Audio48Khz96KBitRateMonoMp3] = "audio-48khz-96kbitrate-mono-mp3",
        _a[SpeechSynthesisOutputFormat_1.SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3] = "audio-48khz-192kbitrate-mono-mp3",
        _a);
    return AudioOutputFormatImpl;
}(AudioStreamFormat_1.AudioStreamFormatImpl));
exports.AudioOutputFormatImpl = AudioOutputFormatImpl;

//# sourceMappingURL=AudioOutputFormat.js.map