"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents the JSON used in the synthesis.context message sent to the speech service.
 * The dynamic grammar is always refreshed from the encapsulated dynamic grammar object.
 */
var SynthesisContext = /** @class */ (function () {
    function SynthesisContext(speechSynthesizer) {
        this.privContext = {};
        this.privSpeechSynthesizer = speechSynthesizer;
    }
    /**
     * Adds a section to the synthesis.context object.
     * @param sectionName Name of the section to add.
     * @param value JSON serializable object that represents the value.
     */
    SynthesisContext.prototype.setSection = function (sectionName, value) {
        this.privContext[sectionName] = value;
    };
    Object.defineProperty(SynthesisContext.prototype, "audioOutputFormat", {
        /**
         * Sets the audio output format for synthesis context generation.
         * @param format {AudioOutputFormatImpl} the output format
         */
        set: function (format) {
            this.privAudioOutputFormat = format;
        },
        enumerable: true,
        configurable: true
    });
    SynthesisContext.prototype.toJSON = function () {
        var synthesisSection = this.buildSynthesisContext();
        this.setSection("synthesis", synthesisSection);
        return JSON.stringify(this.privContext);
    };
    SynthesisContext.prototype.buildSynthesisContext = function () {
        return {
            audio: {
                metadataOptions: {
                    sentenceBoundaryEnabled: false,
                    wordBoundaryEnabled: (!!this.privSpeechSynthesizer.wordBoundary),
                },
                outputFormat: this.privAudioOutputFormat.requestAudioFormatString,
            },
            language: {
                autoDetection: this.privSpeechSynthesizer.autoDetectSourceLanguage
            }
        };
    };
    return SynthesisContext;
}());
exports.SynthesisContext = SynthesisContext;

//# sourceMappingURL=SynthesisContext.js.map