"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Defines result of speech synthesis.
 * @class SpeechSynthesisResult
 * Added in version 1.11.0
 */
var SpeechSynthesisResult = /** @class */ (function () {
    /**
     * Creates and initializes an instance of this class.
     * @constructor
     * @param {string} resultId - The result id.
     * @param {ResultReason} reason - The reason.
     * @param {number} audioData - The offset into the stream.
     * @param {string} errorDetails - Error details, if provided.
     * @param {PropertyCollection} properties - Additional properties, if provided.
     */
    function SpeechSynthesisResult(resultId, reason, audioData, errorDetails, properties) {
        this.privResultId = resultId;
        this.privReason = reason;
        this.privAudioData = audioData;
        this.privErrorDetails = errorDetails;
        this.privProperties = properties;
    }
    Object.defineProperty(SpeechSynthesisResult.prototype, "resultId", {
        /**
         * Specifies the result identifier.
         * @member SpeechSynthesisResult.prototype.resultId
         * @function
         * @public
         * @returns {string} Specifies the result identifier.
         */
        get: function () {
            return this.privResultId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechSynthesisResult.prototype, "reason", {
        /**
         * Specifies status of the result.
         * @member SpeechSynthesisResult.prototype.reason
         * @function
         * @public
         * @returns {ResultReason} Specifies status of the result.
         */
        get: function () {
            return this.privReason;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechSynthesisResult.prototype, "audioData", {
        /**
         * The synthesized audio data
         * @member SpeechSynthesisResult.prototype.audioData
         * @function
         * @public
         * @returns {ArrayBuffer} The synthesized audio data.
         */
        get: function () {
            return this.privAudioData;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechSynthesisResult.prototype, "errorDetails", {
        /**
         * In case of an unsuccessful synthesis, provides details of the occurred error.
         * @member SpeechSynthesisResult.prototype.errorDetails
         * @function
         * @public
         * @returns {string} a brief description of an error.
         */
        get: function () {
            return this.privErrorDetails;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechSynthesisResult.prototype, "properties", {
        /**
         *  The set of properties exposed in the result.
         * @member SpeechSynthesisResult.prototype.properties
         * @function
         * @public
         * @returns {PropertyCollection} The set of properties exposed in the result.
         */
        get: function () {
            return this.privProperties;
        },
        enumerable: true,
        configurable: true
    });
    return SpeechSynthesisResult;
}());
exports.SpeechSynthesisResult = SpeechSynthesisResult;

//# sourceMappingURL=SpeechSynthesisResult.js.map