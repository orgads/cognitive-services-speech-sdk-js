// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { MessageType, TranslationStatus, } from "../common/Exports";
import { CancellationErrorCode, CancellationReason, PropertyCollection, PropertyId, ResultReason, TranslationRecognitionCanceledEventArgs, TranslationRecognitionEventArgs, TranslationRecognitionResult, Translations, TranslationSynthesisEventArgs, TranslationSynthesisResult, } from "../sdk/Exports";
import { CancellationErrorCodePropertyName, EnumTranslation, RecognitionStatus, ServiceRecognizerBase, SynthesisStatus, TranslationHypothesis, TranslationPhrase, TranslationSynthesisEnd, } from "./Exports";
// tslint:disable-next-line:max-classes-per-file
export class TranslationServiceRecognizer extends ServiceRecognizerBase {
    constructor(authentication, connectionFactory, audioSource, recognizerConfig, translationRecognizer) {
        super(authentication, connectionFactory, audioSource, recognizerConfig, translationRecognizer);
        this.privTranslationRecognizer = translationRecognizer;
    }
    async processTypeSpecificMessages(connectionMessage) {
        const resultProps = new PropertyCollection();
        let processed = false;
        if (connectionMessage.messageType === MessageType.Text) {
            resultProps.setProperty(PropertyId.SpeechServiceResponse_JsonResult, connectionMessage.textBody);
        }
        switch (connectionMessage.path.toLowerCase()) {
            case "translation.hypothesis":
                const result = this.fireEventForResult(TranslationHypothesis.fromJSON(connectionMessage.textBody), resultProps);
                this.privRequestSession.onHypothesis(this.privRequestSession.currentTurnAudioOffset + result.offset);
                if (!!this.privTranslationRecognizer.recognizing) {
                    try {
                        this.privTranslationRecognizer.recognizing(this.privTranslationRecognizer, result);
                        /* tslint:disable:no-empty */
                    }
                    catch (error) {
                        // Not going to let errors in the event handler
                        // trip things up.
                    }
                }
                processed = true;
                break;
            case "translation.phrase":
                const translatedPhrase = TranslationPhrase.fromJSON(connectionMessage.textBody);
                this.privRequestSession.onPhraseRecognized(this.privRequestSession.currentTurnAudioOffset + translatedPhrase.Offset + translatedPhrase.Duration);
                if (translatedPhrase.RecognitionStatus === RecognitionStatus.Success) {
                    // OK, the recognition was successful. How'd the translation do?
                    const result = this.fireEventForResult(translatedPhrase, resultProps);
                    if (!!this.privTranslationRecognizer.recognized) {
                        try {
                            this.privTranslationRecognizer.recognized(this.privTranslationRecognizer, result);
                            /* tslint:disable:no-empty */
                        }
                        catch (error) {
                            // Not going to let errors in the event handler
                            // trip things up.
                        }
                    }
                    // report result to promise.
                    if (!!this.privSuccessCallback) {
                        try {
                            this.privSuccessCallback(result.result);
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
                    break;
                }
                else {
                    const reason = EnumTranslation.implTranslateRecognitionResult(translatedPhrase.RecognitionStatus);
                    const result = new TranslationRecognitionResult(undefined, this.privRequestSession.requestId, reason, translatedPhrase.Text, translatedPhrase.Duration, this.privRequestSession.currentTurnAudioOffset + translatedPhrase.Offset, undefined, connectionMessage.textBody, resultProps);
                    if (reason === ResultReason.Canceled) {
                        const cancelReason = EnumTranslation.implTranslateCancelResult(translatedPhrase.RecognitionStatus);
                        await this.cancelRecognitionLocal(cancelReason, EnumTranslation.implTranslateCancelErrorCode(translatedPhrase.RecognitionStatus), undefined);
                    }
                    else {
                        if (!(this.privRequestSession.isSpeechEnded && reason === ResultReason.NoMatch && translatedPhrase.RecognitionStatus !== RecognitionStatus.InitialSilenceTimeout)) {
                            const ev = new TranslationRecognitionEventArgs(result, result.offset, this.privRequestSession.sessionId);
                            if (!!this.privTranslationRecognizer.recognized) {
                                try {
                                    this.privTranslationRecognizer.recognized(this.privTranslationRecognizer, ev);
                                    /* tslint:disable:no-empty */
                                }
                                catch (error) {
                                    // Not going to let errors in the event handler
                                    // trip things up.
                                }
                            }
                        }
                        // report result to promise.
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
                }
                processed = true;
                break;
            case "translation.synthesis":
                this.sendSynthesisAudio(connectionMessage.binaryBody, this.privRequestSession.sessionId);
                processed = true;
                break;
            case "translation.synthesis.end":
                const synthEnd = TranslationSynthesisEnd.fromJSON(connectionMessage.textBody);
                switch (synthEnd.SynthesisStatus) {
                    case SynthesisStatus.Error:
                        if (!!this.privTranslationRecognizer.synthesizing) {
                            const result = new TranslationSynthesisResult(ResultReason.Canceled, undefined);
                            const retEvent = new TranslationSynthesisEventArgs(result, this.privRequestSession.sessionId);
                            try {
                                this.privTranslationRecognizer.synthesizing(this.privTranslationRecognizer, retEvent);
                                /* tslint:disable:no-empty */
                            }
                            catch (error) {
                                // Not going to let errors in the event handler
                                // trip things up.
                            }
                        }
                        if (!!this.privTranslationRecognizer.canceled) {
                            // And raise a canceled event to send the rich(er) error message back.
                            const canceledResult = new TranslationRecognitionCanceledEventArgs(this.privRequestSession.sessionId, CancellationReason.Error, synthEnd.FailureReason, CancellationErrorCode.ServiceError, null);
                            try {
                                this.privTranslationRecognizer.canceled(this.privTranslationRecognizer, canceledResult);
                                /* tslint:disable:no-empty */
                            }
                            catch (error) {
                                // Not going to let errors in the event handler
                                // trip things up.
                            }
                        }
                        break;
                    case SynthesisStatus.Success:
                        this.sendSynthesisAudio(undefined, this.privRequestSession.sessionId);
                        break;
                    default:
                        break;
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
        if (!!this.privTranslationRecognizer.canceled) {
            const cancelEvent = new TranslationRecognitionCanceledEventArgs(sessionId, cancellationReason, error, errorCode, undefined);
            try {
                this.privTranslationRecognizer.canceled(this.privTranslationRecognizer, cancelEvent);
                /* tslint:disable:no-empty */
            }
            catch (_a) { }
        }
        if (!!this.privSuccessCallback) {
            const result = new TranslationRecognitionResult(undefined, // Translations
            requestId, ResultReason.Canceled, undefined, // Text
            undefined, // Druation
            undefined, // Offset
            error, undefined, // Json
            properties);
            try {
                this.privSuccessCallback(result);
                /* tslint:disable:no-empty */
                this.privSuccessCallback = undefined;
            }
            catch (_b) { }
        }
    }
    fireEventForResult(serviceResult, properties) {
        let translations;
        if (undefined !== serviceResult.Translation.Translations) {
            translations = new Translations();
            for (const translation of serviceResult.Translation.Translations) {
                translations.set(translation.Language, translation.Text);
            }
        }
        let resultReason;
        if (serviceResult instanceof TranslationPhrase) {
            if (serviceResult.Translation.TranslationStatus === TranslationStatus.Success) {
                resultReason = ResultReason.TranslatedSpeech;
            }
            else {
                resultReason = ResultReason.RecognizedSpeech;
            }
        }
        else {
            resultReason = ResultReason.TranslatingSpeech;
        }
        const offset = serviceResult.Offset + this.privRequestSession.currentTurnAudioOffset;
        const result = new TranslationRecognitionResult(translations, this.privRequestSession.requestId, resultReason, serviceResult.Text, serviceResult.Duration, offset, serviceResult.Translation.FailureReason, JSON.stringify(serviceResult), properties);
        const ev = new TranslationRecognitionEventArgs(result, offset, this.privRequestSession.sessionId);
        return ev;
    }
    sendSynthesisAudio(audio, sessionId) {
        const reason = (undefined === audio) ? ResultReason.SynthesizingAudioCompleted : ResultReason.SynthesizingAudio;
        const result = new TranslationSynthesisResult(reason, audio);
        const retEvent = new TranslationSynthesisEventArgs(result, sessionId);
        if (!!this.privTranslationRecognizer.synthesizing) {
            try {
                this.privTranslationRecognizer.synthesizing(this.privTranslationRecognizer, retEvent);
                /* tslint:disable:no-empty */
            }
            catch (error) {
                // Not going to let errors in the event handler
                // trip things up.
            }
        }
    }
}

//# sourceMappingURL=TranslationServiceRecognizer.js.map