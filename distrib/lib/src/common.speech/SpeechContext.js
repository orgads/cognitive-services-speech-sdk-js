"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents the JSON used in the speech.context message sent to the speech service.
 * The dynamic grammar is always refreshed from the encapsulated dynamic grammar object.
 */
var SpeechContext = /** @class */ (function () {
    function SpeechContext(dynamicGrammar) {
        this.privContext = {};
        this.privDynamicGrammar = dynamicGrammar;
    }
    /**
     * Adds a section to the speech.context object.
     * @param sectionName Name of the section to add.
     * @param value JSON serializable object that represents the value.
     */
    SpeechContext.prototype.setSection = function (sectionName, value) {
        this.privContext[sectionName] = value;
    };
    /**
     * @Internal
     * This is only used by pronunciation assessment config.
     * Do not use externally, object returned will change without warning or notice.
     */
    SpeechContext.prototype.setPronunciationAssessmentParams = function (params) {
        if (this.privContext.phraseDetection === undefined) {
            this.privContext.phraseDetection = {
                enrichment: {
                    pronunciationAssessment: {}
                }
            };
        }
        this.privContext.phraseDetection.enrichment.pronunciationAssessment = JSON.parse(params);
        if (this.privContext.phraseOutput === undefined) {
            this.privContext.phraseOutput = {
                detailed: {
                    options: []
                },
                format: {}
            };
        }
        this.privContext.phraseOutput.format = "Detailed";
        this.privContext.phraseOutput.detailed.options.push("PronunciationAssessment");
        if (this.privContext.phraseOutput.detailed.options.indexOf("WordTimings") === -1) {
            this.privContext.phraseOutput.detailed.options.push("WordTimings");
        }
    };
    SpeechContext.prototype.toJSON = function () {
        var dgi = this.privDynamicGrammar.generateGrammarObject();
        this.setSection("dgi", dgi);
        var ret = JSON.stringify(this.privContext);
        return ret;
    };
    return SpeechContext;
}());
exports.SpeechContext = SpeechContext;

//# sourceMappingURL=SpeechContext.js.map