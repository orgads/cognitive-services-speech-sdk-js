import { DynamicGrammarBuilder } from "./Exports";
/**
 * Represents the JSON used in the speech.context message sent to the speech service.
 * The dynamic grammar is always refreshed from the encapsulated dynamic grammar object.
 */
export declare class SpeechContext {
    private privContext;
    private privDynamicGrammar;
    constructor(dynamicGrammar: DynamicGrammarBuilder);
    /**
     * Adds a section to the speech.context object.
     * @param sectionName Name of the section to add.
     * @param value JSON serializable object that represents the value.
     */
    setSection(sectionName: string, value: any): void;
    /**
     * @Internal
     * This is only used by pronunciation assessment config.
     * Do not use externally, object returned will change without warning or notice.
     */
    setPronunciationAssessmentParams(params: string): void;
    toJSON(): string;
}