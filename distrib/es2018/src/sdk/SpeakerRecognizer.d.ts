import { AudioConfig } from "./Audio/AudioConfig";
import { PropertyCollection, SpeakerIdentificationModel, SpeakerRecognitionResult, SpeakerVerificationModel } from "./Exports";
import { SpeechConfig } from "./SpeechConfig";
/**
 * Defines SpeakerRecognizer class for Speaker Recognition
 * Handles operations from user for Voice Profile operations (e.g. createProfile, deleteProfile)
 * @class SpeakerRecognizer
 */
export declare class SpeakerRecognizer {
    protected privProperties: PropertyCollection;
    private privAdapter;
    private privAudioConfigImpl;
    /**
     * Gets the authorization token used to communicate with the service.
     * @member SpeakerRecognizer.prototype.authorizationToken
     * @function
     * @public
     * @returns {string} Authorization token.
     */
    get authorizationToken(): string;
    /**
     * Gets/Sets the authorization token used to communicate with the service.
     * @member SpeakerRecognizer.prototype.authorizationToken
     * @function
     * @public
     * @param {string} token - Authorization token.
     */
    set authorizationToken(token: string);
    /**
     * The collection of properties and their values defined for this SpeakerRecognizer.
     * @member SpeakerRecognizer.prototype.properties
     * @function
     * @public
     * @returns {PropertyCollection} The collection of properties and their values defined for this SpeakerRecognizer.
     */
    get properties(): PropertyCollection;
    /**
     * SpeakerRecognizer constructor.
     * @constructor
     * @param {SpeechConfig} speechConfig - An set of initial properties for this recognizer (authentication key, region, &c)
     */
    constructor(speechConfig: SpeechConfig, audioConfig: AudioConfig);
    /**
     * Get recognition result for model using given audio
     * @member SpeakerRecognizer.prototype.recognizeOnceAsync
     * @function
     * @public
     * @param {SpeakerIdentificationModel} model Model containing Voice Profiles to be identified
     * @param cb - Callback invoked once result is returned.
     * @param err - Callback invoked in case of an error.
     */
    recognizeOnceAsync(model: SpeakerIdentificationModel | SpeakerVerificationModel, cb?: (e: SpeakerRecognitionResult) => void, err?: (e: string) => void): void;
    /**
     * Included for compatibility
     * @member SpeakerRecognizer.prototype.close
     * @function
     * @public
     */
    close(): void;
    private implSRSetup;
    private getResult;
}