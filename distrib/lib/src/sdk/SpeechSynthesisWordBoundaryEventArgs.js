"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Defines contents of speech synthesis word boundary event.
 * @class SpeechSynthesisWordBoundaryEventArgs
 * Added in version 1.11.0
 */
var SpeechSynthesisWordBoundaryEventArgs = /** @class */ (function () {
    /**
     * Creates and initializes an instance of this class.
     * @constructor
     * @param {number} audioOffset - The audio offset.
     * @param {string} text - The text.
     * @param {number} wordLength - The length of the word.
     * @param {number} textOffset - The text offset.
     */
    function SpeechSynthesisWordBoundaryEventArgs(audioOffset, text, wordLength, textOffset) {
        this.privAudioOffset = audioOffset;
        this.privText = text;
        this.privWordLength = wordLength;
        this.privTextOffset = textOffset;
    }
    Object.defineProperty(SpeechSynthesisWordBoundaryEventArgs.prototype, "audioOffset", {
        /**
         * Specifies the audio offset.
         * @member SpeechSynthesisWordBoundaryEventArgs.prototype.audioOffset
         * @function
         * @public
         * @returns {number} the audio offset.
         */
        get: function () {
            return this.privAudioOffset;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechSynthesisWordBoundaryEventArgs.prototype, "text", {
        /**
         * Specifies the text of the word boundary event.
         * @member SpeechSynthesisWordBoundaryEventArgs.prototype.text
         * @function
         * @public
         * @returns {string} the text.
         */
        get: function () {
            return this.privText;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechSynthesisWordBoundaryEventArgs.prototype, "wordLength", {
        /**
         * Specifies the word length
         * @member SpeechSynthesisWordBoundaryEventArgs.prototype.wordLength
         * @function
         * @public
         * @returns {number} the word length
         */
        get: function () {
            return this.privWordLength;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechSynthesisWordBoundaryEventArgs.prototype, "textOffset", {
        /**
         * Specifies the text offset.
         * @member SpeechSynthesisWordBoundaryEventArgs.prototype.textOffset
         * @function
         * @public
         * @returns {number} the text offset.
         */
        get: function () {
            return this.privTextOffset;
        },
        enumerable: true,
        configurable: true
    });
    return SpeechSynthesisWordBoundaryEventArgs;
}());
exports.SpeechSynthesisWordBoundaryEventArgs = SpeechSynthesisWordBoundaryEventArgs;

//# sourceMappingURL=SpeechSynthesisWordBoundaryEventArgs.js.map