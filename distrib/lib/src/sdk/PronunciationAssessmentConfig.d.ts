import { PronunciationAssessmentGradingSystem, PronunciationAssessmentGranularity, PropertyCollection, Recognizer } from "./Exports";
/**
 * Pronunciation assessment configuration.
 * @class PronunciationAssessmentConfig
 * Added in version 1.15.0.
 */
export declare class PronunciationAssessmentConfig {
    private privProperties;
    /**
     * PronunciationAssessmentConfig constructor.
     * @constructor
     * @param {string} referenceText
     * @param gradingSystem
     * @param granularity
     * @param enableMiscue
     */
    constructor(referenceText: string, gradingSystem?: PronunciationAssessmentGradingSystem, granularity?: PronunciationAssessmentGranularity, enableMiscue?: boolean);
    /**
     * @member PronunciationAssessmentConfig.fromJSON
     * @function
     * @public
     * @param {string} json The json string containing the pronunciation assessment parameters.
     * @return {PronunciationAssessmentConfig} Instance of PronunciationAssessmentConfig
     * @summary Creates an instance of the PronunciationAssessmentConfig from json.
     */
    static fromJSON(json: string): PronunciationAssessmentConfig;
    toJSON(): string;
    applyTo(recognizer: Recognizer): void;
    /**
     * Gets the reference text.
     * @member PronunciationAssessmentConfig.prototype.referenceText
     * @function
     * @public
     * @returns {string} Reference text.
     */
    get referenceText(): string;
    /**
     * Gets/Sets the reference text.
     * @member PronunciationAssessmentConfig.prototype.referenceText
     * @function
     * @public
     * @param {string} referenceText - Reference text.
     */
    set referenceText(referenceText: string);
    /**
     * @member PronunciationAssessmentConfig.prototype.properties
     * @function
     * @public
     * @return {PropertyCollection} Properties of the config.
     * @summary Gets a pronunciation assessment config properties
     */
    get properties(): PropertyCollection;
    private updateJson;
}