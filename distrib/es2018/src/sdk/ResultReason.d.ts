/**
 * Defines the possible reasons a recognition result might be generated.
 * @class ResultReason
 */
export declare enum ResultReason {
    /**
     * Indicates speech could not be recognized. More details
     * can be found in the NoMatchDetails object.
     * @member ResultReason.NoMatch
     */
    NoMatch = 0,
    /**
     * Indicates that the recognition was canceled. More details
     * can be found using the CancellationDetails object.
     * @member ResultReason.Canceled
     */
    Canceled = 1,
    /**
     * Indicates the speech result contains hypothesis text.
     * @member ResultReason.RecognizedSpeech
     */
    RecognizingSpeech = 2,
    /**
     * Indicates the speech result contains final text that has been recognized.
     * Speech Recognition is now complete for this phrase.
     * @member ResultReason.RecognizedSpeech
     */
    RecognizedSpeech = 3,
    /**
     * Indicates the intent result contains hypothesis text and intent.
     * @member ResultReason.RecognizingIntent
     */
    RecognizingIntent = 4,
    /**
     * Indicates the intent result contains final text and intent.
     * Speech Recognition and Intent determination are now complete for this phrase.
     * @member ResultReason.RecognizedIntent
     */
    RecognizedIntent = 5,
    /**
     * Indicates the translation result contains hypothesis text and its translation(s).
     * @member ResultReason.TranslatingSpeech
     */
    TranslatingSpeech = 6,
    /**
     * Indicates the translation result contains final text and corresponding translation(s).
     * Speech Recognition and Translation are now complete for this phrase.
     * @member ResultReason.TranslatedSpeech
     */
    TranslatedSpeech = 7,
    /**
     * Indicates the synthesized audio result contains a non-zero amount of audio data
     * @member ResultReason.SynthesizingAudio
     */
    SynthesizingAudio = 8,
    /**
     * Indicates the synthesized audio is now complete for this phrase.
     * @member ResultReason.SynthesizingAudioCompleted
     */
    SynthesizingAudioCompleted = 9,
    /**
     * Indicates the speech synthesis is now started
     * @member ResultReason.SynthesizingAudioStarted
     */
    SynthesizingAudioStarted = 10,
    /**
     * Indicates the voice profile is being enrolled and customers need to send more audio to create a voice profile.
     * @member ResultReason.EnrollingVoiceProfile
     */
    EnrollingVoiceProfile = 11,
    /**
     * Indicates the voice profile has been enrolled.
     * @member ResultReason.EnrolledVoiceProfile
     */
    EnrolledVoiceProfile = 12,
    /**
     * Indicates successful identification of some speakers.
     * @member ResultReason.RecognizedSpeakers
     */
    RecognizedSpeakers = 13,
    /**
     * Indicates successfully verified one speaker.
     * @member ResultReason.RecognizedSpeaker
     */
    RecognizedSpeaker = 14,
    /**
     * Indicates a voice profile has been reset successfully.
     * @member ResultReason.ResetVoiceProfile
     */
    ResetVoiceProfile = 15,
    /**
     * Indicates a voice profile has been deleted successfully.
     * @member ResultReason.DeletedVoiceProfile
     */
    DeletedVoiceProfile = 16
}