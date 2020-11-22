// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { MessageType } from "../common/Exports";
import { CancellationErrorCode, ConversationTranscriptionCanceledEventArgs, OutputFormat, PropertyCollection, PropertyId, ResultReason, SpeechRecognitionEventArgs, SpeechRecognitionResult, } from "../sdk/Exports";
import { CancellationErrorCodePropertyName, DetailedSpeechPhrase, EnumTranslation, OutputFormatPropertyName, RecognitionStatus, ServiceRecognizerBase, SimpleSpeechPhrase, SpeechHypothesis } from "./Exports";
import { SpeechConnectionMessage } from "./SpeechConnectionMessage.Internal";
// tslint:disable-next-line:max-classes-per-file
export class TranscriptionServiceRecognizer extends ServiceRecognizerBase {
    constructor(authentication, connectionFactory, audioSource, recognizerConfig, transcriber) {
        super(authentication, connectionFactory, audioSource, recognizerConfig, transcriber);
        this.sendSpeechEvent = (connection, payload) => {
            const speechEventJson = JSON.stringify(payload);
            if (speechEventJson) {
                return connection.send(new SpeechConnectionMessage(MessageType.Text, "speech.event", this.privRequestSession.requestId, "application/json", speechEventJson));
            }
            return;
        };
        this.privTranscriberRecognizer = transcriber;
        this.sendPrePayloadJSONOverride = this.sendTranscriptionStartJSON;
    }
    async sendSpeechEventAsync(info, command) {
        if (!!this.privRequestSession.isRecognizing) {
            const connection = await this.fetchConnection();
            await this.sendSpeechEvent(connection, this.createSpeechEventPayload(info, command));
        }
    }
    async processTypeSpecificMessages(connectionMessage) {
        let result;
        const resultProps = new PropertyCollection();
        resultProps.setProperty(PropertyId.SpeechServiceResponse_JsonResult, connectionMessage.textBody);
        let processed = false;
        switch (connectionMessage.path.toLowerCase()) {
            case "speech.hypothesis":
            case "speech.fragment":
                const hypothesis = SpeechHypothesis.fromJSON(connectionMessage.textBody);
                const offset = hypothesis.Offset + this.privRequestSession.currentTurnAudioOffset;
                result = new SpeechRecognitionResult(this.privRequestSession.requestId, ResultReason.RecognizingSpeech, hypothesis.Text, hypothesis.Duration, offset, hypothesis.Language, hypothesis.LanguageDetectionConfidence, hypothesis.SpeakerId, undefined, connectionMessage.textBody, resultProps);
                this.privRequestSession.onHypothesis(offset);
                const ev = new SpeechRecognitionEventArgs(result, hypothesis.Duration, this.privRequestSession.sessionId);
                if (!!this.privTranscriberRecognizer.recognizing) {
                    try {
                        this.privTranscriberRecognizer.recognizing(this.privTranscriberRecognizer, ev);
                        /* tslint:disable:no-empty */
                    }
                    catch (error) {
                        // Not going to let errors in the event handler
                        // trip things up.
                    }
                }
                processed = true;
                break;
            case "speech.phrase":
                const simple = SimpleSpeechPhrase.fromJSON(connectionMessage.textBody);
                const resultReason = EnumTranslation.implTranslateRecognitionResult(simple.RecognitionStatus);
                this.privRequestSession.onPhraseRecognized(this.privRequestSession.currentTurnAudioOffset + simple.Offset + simple.Duration);
                if (ResultReason.Canceled === resultReason) {
                    const cancelReason = EnumTranslation.implTranslateCancelResult(simple.RecognitionStatus);
                    await this.cancelRecognitionLocal(cancelReason, EnumTranslation.implTranslateCancelErrorCode(simple.RecognitionStatus), undefined);
                }
                else {
                    if (!(this.privRequestSession.isSpeechEnded && resultReason === ResultReason.NoMatch && simple.RecognitionStatus !== RecognitionStatus.InitialSilenceTimeout)) {
                        if (this.privRecognizerConfig.parameters.getProperty(OutputFormatPropertyName) === OutputFormat[OutputFormat.Simple]) {
                            result = new SpeechRecognitionResult(this.privRequestSession.requestId, resultReason, simple.DisplayText, simple.Duration, simple.Offset + this.privRequestSession.currentTurnAudioOffset, simple.Language, simple.LanguageDetectionConfidence, simple.SpeakerId, undefined, connectionMessage.textBody, resultProps);
                        }
                        else {
                            const detailed = DetailedSpeechPhrase.fromJSON(connectionMessage.textBody);
                            result = new SpeechRecognitionResult(this.privRequestSession.requestId, resultReason, detailed.RecognitionStatus === RecognitionStatus.Success ? detailed.NBest[0].Display : undefined, detailed.Duration, detailed.Offset + this.privRequestSession.currentTurnAudioOffset, detailed.Language, detailed.LanguageDetectionConfidence, undefined, undefined, connectionMessage.textBody, resultProps);
                        }
                        const event = new SpeechRecognitionEventArgs(result, result.offset, this.privRequestSession.sessionId);
                        if (!!this.privTranscriberRecognizer.recognized) {
                            try {
                                this.privTranscriberRecognizer.recognized(this.privTranscriberRecognizer, event);
                                /* tslint:disable:no-empty */
                            }
                            catch (error) {
                                // Not going to let errors in the event handler
                                // trip things up.
                            }
                        }
                    }
                    if (!!this.privSuccessCallback) {
                        try {
                            this.privSuccessCallback(result);
                        }
                        catch (e) {
                            if (!!this.privErrorCallback) {
                                this.privErrorCallback(e);
                            }
                        }
                        // Only invoke the call back once.
                        // and if it's successful don't invoke the
                        // error after that.
                        this.privSuccessCallback = undefined;
                        this.privErrorCallback = undefined;
                    }
                }
                processed = true;
                break;
            default:
                break;
        }
        return processed;
    }
    // Cancels recognition.
    cancelRecognition(sessionId, requestId, cancellationReason, errorCode, error) {
        const properties = new PropertyCollection();
        properties.setProperty(CancellationErrorCodePropertyName, CancellationErrorCode[errorCode]);
        if (!!this.privTranscriberRecognizer.canceled) {
            const cancelEvent = new ConversationTranscriptionCanceledEventArgs(cancellationReason, error, errorCode, undefined, sessionId);
            try {
                this.privTranscriberRecognizer.canceled(this.privTranscriberRecognizer, cancelEvent);
                /* tslint:disable:no-empty */
            }
            catch (_a) { }
        }
        if (!!this.privSuccessCallback) {
            const result = new SpeechRecognitionResult(requestId, ResultReason.Canceled, undefined, // Text
            undefined, // Duration
            undefined, // Offset
            undefined, // Language
            undefined, // Language Detection Confidence
            undefined, // Speaker Id
            error, undefined, // Json
            properties);
            try {
                this.privSuccessCallback(result);
                this.privSuccessCallback = undefined;
                /* tslint:disable:no-empty */
            }
            catch (_b) { }
        }
    }
    // Encapsulated for derived service recognizers that need to send additional JSON
    async sendTranscriptionStartJSON(connection) {
        await this.sendSpeechContext(connection);
        const info = this.privTranscriberRecognizer.getConversationInfo();
        const payload = this.createSpeechEventPayload(info, "start");
        await this.sendSpeechEvent(connection, payload);
        await this.sendWaveHeader(connection);
        return;
    }
    createSpeechEventPayload(info, command) {
        const meeting = "meeting";
        const eventDict = { id: meeting, name: command, meeting: info.conversationProperties };
        const idString = "id";
        const attendees = "attendees";
        const record = "record";
        eventDict[meeting][idString] = info.id;
        eventDict[meeting][attendees] = info.participants;
        eventDict[meeting][record] = info.conversationProperties.audiorecording === "on" ? "true" : "false";
        return eventDict;
    }
}

//# sourceMappingURL=TranscriptionServiceRecognizer.js.map
