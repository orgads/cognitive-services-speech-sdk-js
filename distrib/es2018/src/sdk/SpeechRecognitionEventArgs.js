// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { RecognitionEventArgs } from "./Exports";
/**
 * Defines contents of speech recognizing/recognized event.
 * @class SpeechRecognitionEventArgs
 */
export class SpeechRecognitionEventArgs extends RecognitionEventArgs {
    /**
     * Creates and initializes an instance of this class.
     * @constructor
     * @param {SpeechRecognitionResult} result - The speech recognition result.
     * @param {number} offset - The offset.
     * @param {string} sessionId - The session id.
     */
    constructor(result, offset, sessionId) {
        super(offset, sessionId);
        this.privResult = result;
    }
    /**
     * Specifies the recognition result.
     * @member SpeechRecognitionEventArgs.prototype.result
     * @function
     * @public
     * @returns {SpeechRecognitionResult} the recognition result.
     */
    get result() {
        return this.privResult;
    }
}
/**
 * Defines contents of conversation transcribed/transcribing event.
 * @class ConversationTranscriptionEventArgs
 */
// tslint:disable-next-line:max-classes-per-file
export class ConversationTranscriptionEventArgs extends SpeechRecognitionEventArgs {
}

//# sourceMappingURL=SpeechRecognitionEventArgs.js.map