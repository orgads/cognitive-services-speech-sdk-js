"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
var Contracts_1 = require("./Contracts");
var Exports_1 = require("./Exports");
/**
 * Pronunciation assessment configuration.
 * @class PronunciationAssessmentConfig
 * Added in version 1.15.0.
 */
var PronunciationAssessmentConfig = /** @class */ (function () {
    /**
     * PronunciationAssessmentConfig constructor.
     * @constructor
     * @param {string} referenceText
     * @param gradingSystem
     * @param granularity
     * @param enableMiscue
     */
    function PronunciationAssessmentConfig(referenceText, gradingSystem, granularity, enableMiscue) {
        if (gradingSystem === void 0) { gradingSystem = Exports_1.PronunciationAssessmentGradingSystem.FivePoint; }
        if (granularity === void 0) { granularity = Exports_1.PronunciationAssessmentGranularity.Phoneme; }
        if (enableMiscue === void 0) { enableMiscue = false; }
        Contracts_1.Contracts.throwIfNullOrUndefined(referenceText, "referenceText");
        this.privProperties = new Exports_1.PropertyCollection();
        this.privProperties.setProperty(Exports_1.PropertyId.PronunciationAssessment_ReferenceText, referenceText);
        this.privProperties.setProperty(Exports_1.PropertyId.PronunciationAssessment_GradingSystem, Exports_1.PronunciationAssessmentGradingSystem[gradingSystem]);
        this.privProperties.setProperty(Exports_1.PropertyId.PronunciationAssessment_Granularity, Exports_1.PronunciationAssessmentGranularity[gradingSystem]);
        this.privProperties.setProperty(Exports_1.PropertyId.PronunciationAssessment_EnableMiscue, String(enableMiscue));
    }
    /**
     * @member PronunciationAssessmentConfig.fromJSON
     * @function
     * @public
     * @param {string} json The json string containing the pronunciation assessment parameters.
     * @return {PronunciationAssessmentConfig} Instance of PronunciationAssessmentConfig
     * @summary Creates an instance of the PronunciationAssessmentConfig from json.
     */
    PronunciationAssessmentConfig.fromJSON = function (json) {
        Contracts_1.Contracts.throwIfNullOrUndefined(json, "json");
        var config = new PronunciationAssessmentConfig("");
        config.privProperties = new Exports_1.PropertyCollection();
        config.properties.setProperty(Exports_1.PropertyId.PronunciationAssessment_Json, json);
        return config;
    };
    PronunciationAssessmentConfig.prototype.toJSON = function () {
        this.updateJson();
        return this.privProperties.getProperty(Exports_1.PropertyId.PronunciationAssessment_Params);
    };
    PronunciationAssessmentConfig.prototype.applyTo = function (recognizer) {
        this.updateJson();
        var recoBase = recognizer.internalData;
        recoBase.speechContext.setPronunciationAssessmentParams(this.properties.getProperty(Exports_1.PropertyId.PronunciationAssessment_Params));
    };
    Object.defineProperty(PronunciationAssessmentConfig.prototype, "referenceText", {
        /**
         * Gets the reference text.
         * @member PronunciationAssessmentConfig.prototype.referenceText
         * @function
         * @public
         * @returns {string} Reference text.
         */
        get: function () {
            return this.properties.getProperty(Exports_1.PropertyId.PronunciationAssessment_ReferenceText);
        },
        /**
         * Gets/Sets the reference text.
         * @member PronunciationAssessmentConfig.prototype.referenceText
         * @function
         * @public
         * @param {string} referenceText - Reference text.
         */
        set: function (referenceText) {
            Contracts_1.Contracts.throwIfNullOrWhitespace(referenceText, "referenceText");
            this.properties.setProperty(Exports_1.PropertyId.PronunciationAssessment_ReferenceText, referenceText);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PronunciationAssessmentConfig.prototype, "properties", {
        /**
         * @member PronunciationAssessmentConfig.prototype.properties
         * @function
         * @public
         * @return {PropertyCollection} Properties of the config.
         * @summary Gets a pronunciation assessment config properties
         */
        get: function () {
            return this.privProperties;
        },
        enumerable: true,
        configurable: true
    });
    PronunciationAssessmentConfig.prototype.updateJson = function () {
        var jsonString = this.privProperties.getProperty(Exports_1.PropertyId.PronunciationAssessment_Json, "{}");
        var paramsJson = JSON.parse(jsonString);
        var referenceText = this.privProperties.getProperty(Exports_1.PropertyId.PronunciationAssessment_ReferenceText);
        if (referenceText) {
            paramsJson.referenceText = referenceText;
        }
        var gradingSystem = this.privProperties.getProperty(Exports_1.PropertyId.PronunciationAssessment_GradingSystem);
        if (gradingSystem) {
            paramsJson.gradingSystem = gradingSystem;
        }
        var granularity = this.privProperties.getProperty(Exports_1.PropertyId.PronunciationAssessment_Granularity);
        if (granularity) {
            paramsJson.granularity = granularity;
        }
        // always set dimension to Comprehensive
        paramsJson.dimension = "Comprehensive";
        var enableMiscueString = this.privProperties.getProperty(Exports_1.PropertyId.PronunciationAssessment_EnableMiscue);
        if (enableMiscueString === "true") {
            paramsJson.enableMiscue = true;
        }
        else if (enableMiscueString === "false") {
            paramsJson.enableMiscue = false;
        }
        this.privProperties.setProperty(Exports_1.PropertyId.PronunciationAssessment_Params, JSON.stringify(paramsJson));
    };
    return PronunciationAssessmentConfig;
}());
exports.PronunciationAssessmentConfig = PronunciationAssessmentConfig;

//# sourceMappingURL=PronunciationAssessmentConfig.js.map