// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/**
 * Define speech synthesis audio output formats.
 * @enum SpeechSynthesisOutputFormat
 * Added in version 1.11.0
 */
export var SpeechSynthesisOutputFormat;
(function (SpeechSynthesisOutputFormat) {
    /**
     * raw-8khz-8bit-mono-mulaw
     * @member SpeechSynthesisOutputFormat.Raw8Khz8BitMonoMULaw,
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Raw8Khz8BitMonoMULaw"] = 0] = "Raw8Khz8BitMonoMULaw";
    /**
     * riff-16khz-16kbps-mono-siren
     * @member SpeechSynthesisOutputFormat.Riff16Khz16KbpsMonoSiren
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Riff16Khz16KbpsMonoSiren"] = 1] = "Riff16Khz16KbpsMonoSiren";
    /**
     * audio-16khz-16kbps-mono-siren
     * @member SpeechSynthesisOutputFormat.Audio16Khz16KbpsMonoSiren
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Audio16Khz16KbpsMonoSiren"] = 2] = "Audio16Khz16KbpsMonoSiren";
    /**
     * audio-16khz-32kbitrate-mono-mp3
     * @member SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Audio16Khz32KBitRateMonoMp3"] = 3] = "Audio16Khz32KBitRateMonoMp3";
    /**
     * audio-16khz-128kbitrate-mono-mp3
     * @member SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Audio16Khz128KBitRateMonoMp3"] = 4] = "Audio16Khz128KBitRateMonoMp3";
    /**
     * audio-16khz-64kbitrate-mono-mp3
     * @member SpeechSynthesisOutputFormat.Audio16Khz64KBitRateMonoMp3
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Audio16Khz64KBitRateMonoMp3"] = 5] = "Audio16Khz64KBitRateMonoMp3";
    /**
     * audio-24khz-48kbitrate-mono-mp3
     * @member SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Audio24Khz48KBitRateMonoMp3"] = 6] = "Audio24Khz48KBitRateMonoMp3";
    /**
     * audio-24khz-96kbitrate-mono-mp3
     * @member SpeechSynthesisOutputFormat.Audio24Khz96KBitRateMonoMp3
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Audio24Khz96KBitRateMonoMp3"] = 7] = "Audio24Khz96KBitRateMonoMp3";
    /**
     * audio-24khz-160kbitrate-mono-mp3
     * @member SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Audio24Khz160KBitRateMonoMp3"] = 8] = "Audio24Khz160KBitRateMonoMp3";
    /**
     * raw-16khz-16bit-mono-truesilk
     * @member SpeechSynthesisOutputFormat.Raw16Khz16BitMonoTrueSilk
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Raw16Khz16BitMonoTrueSilk"] = 9] = "Raw16Khz16BitMonoTrueSilk";
    /**
     * riff-16khz-16bit-mono-pcm
     * @member SpeechSynthesisOutputFormat.Riff16Khz16BitMonoPcm
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Riff16Khz16BitMonoPcm"] = 10] = "Riff16Khz16BitMonoPcm";
    /**
     * riff-8khz-16bit-mono-pcm
     * @member SpeechSynthesisOutputFormat.Riff8Khz16BitMonoPcm
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Riff8Khz16BitMonoPcm"] = 11] = "Riff8Khz16BitMonoPcm";
    /**
     * riff-24khz-16bit-mono-pcm
     * @member SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Riff24Khz16BitMonoPcm"] = 12] = "Riff24Khz16BitMonoPcm";
    /**
     * riff-8khz-8bit-mono-mulaw
     * @member SpeechSynthesisOutputFormat.Riff8Khz8BitMonoMULaw
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Riff8Khz8BitMonoMULaw"] = 13] = "Riff8Khz8BitMonoMULaw";
    /**
     * raw-16khz-16bit-mono-pcm
     * @member SpeechSynthesisOutputFormat.Raw16Khz16BitMonoPcm
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Raw16Khz16BitMonoPcm"] = 14] = "Raw16Khz16BitMonoPcm";
    /**
     * raw-24khz-16bit-mono-pcm
     * @member SpeechSynthesisOutputFormat.Raw24Khz16BitMonoPcm
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Raw24Khz16BitMonoPcm"] = 15] = "Raw24Khz16BitMonoPcm";
    /**
     * raw-8khz-16bit-mono-pcm
     * @member SpeechSynthesisOutputFormat.Raw8Khz16BitMonoPcm
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Raw8Khz16BitMonoPcm"] = 16] = "Raw8Khz16BitMonoPcm";
    /**
     * ogg-16khz-16bit-mono-opus
     * @member SpeechSynthesisOutputFormat.Ogg16Khz16BitMonoOpus
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Ogg16Khz16BitMonoOpus"] = 17] = "Ogg16Khz16BitMonoOpus";
    /**
     * ogg-24khz-16bit-mono-opus
     * @member SpeechSynthesisOutputFormat.Ogg24Khz16BitMonoOpus
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Ogg24Khz16BitMonoOpus"] = 18] = "Ogg24Khz16BitMonoOpus";
    /**
     * raw-48khz-16bit-mono-pcm
     * @member SpeechSynthesisOutputFormat.Raw48Khz16BitMonoPcm
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Raw48Khz16BitMonoPcm"] = 19] = "Raw48Khz16BitMonoPcm";
    /**
     * riff-48khz-16bit-mono-pcm
     * @member SpeechSynthesisOutputFormat.Riff48Khz16BitMonoPcm
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Riff48Khz16BitMonoPcm"] = 20] = "Riff48Khz16BitMonoPcm";
    /**
     * audio-48khz-96kbitrate-mono-mp3
     * @member SpeechSynthesisOutputFormat.Audio48Khz96KBitRateMonoMp3
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Audio48Khz96KBitRateMonoMp3"] = 21] = "Audio48Khz96KBitRateMonoMp3";
    /**
     * audio-48khz-192kbitrate-mono-mp3
     * @member SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3
     */
    SpeechSynthesisOutputFormat[SpeechSynthesisOutputFormat["Audio48Khz192KBitRateMonoMp3"] = 22] = "Audio48Khz192KBitRateMonoMp3";
})(SpeechSynthesisOutputFormat || (SpeechSynthesisOutputFormat = {}));

//# sourceMappingURL=SpeechSynthesisOutputFormat.js.map