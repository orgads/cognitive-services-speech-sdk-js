"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = require("../common/Exports");
var Exports_2 = require("../sdk/Exports");
var Exports_3 = require("./Exports");
// tslint:disable-next-line:max-classes-per-file
var TranslationServiceRecognizer = /** @class */ (function (_super) {
    __extends(TranslationServiceRecognizer, _super);
    function TranslationServiceRecognizer(authentication, connectionFactory, audioSource, recognizerConfig, translationRecognizer) {
        var _this = _super.call(this, authentication, connectionFactory, audioSource, recognizerConfig, translationRecognizer) || this;
        _this.privTranslationRecognizer = translationRecognizer;
        return _this;
    }
    TranslationServiceRecognizer.prototype.processTypeSpecificMessages = function (connectionMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var resultProps, processed, _a, result, translatedPhrase, result_1, reason, result_2, cancelReason, ev, synthEnd, result_3, retEvent, canceledResult;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        resultProps = new Exports_2.PropertyCollection();
                        processed = false;
                        if (connectionMessage.messageType === Exports_1.MessageType.Text) {
                            resultProps.setProperty(Exports_2.PropertyId.SpeechServiceResponse_JsonResult, connectionMessage.textBody);
                        }
                        _a = connectionMessage.path.toLowerCase();
                        switch (_a) {
                            case "translation.hypothesis": return [3 /*break*/, 1];
                            case "translation.phrase": return [3 /*break*/, 2];
                            case "translation.synthesis": return [3 /*break*/, 7];
                            case "translation.synthesis.end": return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 9];
                    case 1:
                        result = this.fireEventForResult(Exports_3.TranslationHypothesis.fromJSON(connectionMessage.textBody), resultProps);
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
                        return [3 /*break*/, 10];
                    case 2:
                        translatedPhrase = Exports_3.TranslationPhrase.fromJSON(connectionMessage.textBody);
                        this.privRequestSession.onPhraseRecognized(this.privRequestSession.currentTurnAudioOffset + translatedPhrase.Offset + translatedPhrase.Duration);
                        if (!(translatedPhrase.RecognitionStatus === Exports_3.RecognitionStatus.Success)) return [3 /*break*/, 3];
                        result_1 = this.fireEventForResult(translatedPhrase, resultProps);
                        if (!!this.privTranslationRecognizer.recognized) {
                            try {
                                this.privTranslationRecognizer.recognized(this.privTranslationRecognizer, result_1);
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
                                this.privSuccessCallback(result_1.result);
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
                        return [3 /*break*/, 10];
                    case 3:
                        reason = Exports_3.EnumTranslation.implTranslateRecognitionResult(translatedPhrase.RecognitionStatus);
                        result_2 = new Exports_2.TranslationRecognitionResult(undefined, this.privRequestSession.requestId, reason, translatedPhrase.Text, translatedPhrase.Duration, this.privRequestSession.currentTurnAudioOffset + translatedPhrase.Offset, undefined, connectionMessage.textBody, resultProps);
                        if (!(reason === Exports_2.ResultReason.Canceled)) return [3 /*break*/, 5];
                        cancelReason = Exports_3.EnumTranslation.implTranslateCancelResult(translatedPhrase.RecognitionStatus);
                        return [4 /*yield*/, this.cancelRecognitionLocal(cancelReason, Exports_3.EnumTranslation.implTranslateCancelErrorCode(translatedPhrase.RecognitionStatus), undefined)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        if (!(this.privRequestSession.isSpeechEnded && reason === Exports_2.ResultReason.NoMatch && translatedPhrase.RecognitionStatus !== Exports_3.RecognitionStatus.InitialSilenceTimeout)) {
                            ev = new Exports_2.TranslationRecognitionEventArgs(result_2, result_2.offset, this.privRequestSession.sessionId);
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
                                this.privSuccessCallback(result_2);
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
                        _b.label = 6;
                    case 6:
                        processed = true;
                        return [3 /*break*/, 10];
                    case 7:
                        this.sendSynthesisAudio(connectionMessage.binaryBody, this.privRequestSession.sessionId);
                        processed = true;
                        return [3 /*break*/, 10];
                    case 8:
                        synthEnd = Exports_3.TranslationSynthesisEnd.fromJSON(connectionMessage.textBody);
                        switch (synthEnd.SynthesisStatus) {
                            case Exports_3.SynthesisStatus.Error:
                                if (!!this.privTranslationRecognizer.synthesizing) {
                                    result_3 = new Exports_2.TranslationSynthesisResult(Exports_2.ResultReason.Canceled, undefined);
                                    retEvent = new Exports_2.TranslationSynthesisEventArgs(result_3, this.privRequestSession.sessionId);
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
                                    canceledResult = new Exports_2.TranslationRecognitionCanceledEventArgs(this.privRequestSession.sessionId, Exports_2.CancellationReason.Error, synthEnd.FailureReason, Exports_2.CancellationErrorCode.ServiceError, null);
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
                            case Exports_3.SynthesisStatus.Success:
                                this.sendSynthesisAudio(undefined, this.privRequestSession.sessionId);
                                break;
                            default:
                                break;
                        }
                        processed = true;
                        return [3 /*break*/, 10];
                    case 9: return [3 /*break*/, 10];
                    case 10: return [2 /*return*/, processed];
                }
            });
        });
    };
    // Cancels recognition.
    TranslationServiceRecognizer.prototype.cancelRecognition = function (sessionId, requestId, cancellationReason, errorCode, error) {
        var properties = new Exports_2.PropertyCollection();
        properties.setProperty(Exports_3.CancellationErrorCodePropertyName, Exports_2.CancellationErrorCode[errorCode]);
        if (!!this.privTranslationRecognizer.canceled) {
            var cancelEvent = new Exports_2.TranslationRecognitionCanceledEventArgs(sessionId, cancellationReason, error, errorCode, undefined);
            try {
                this.privTranslationRecognizer.canceled(this.privTranslationRecognizer, cancelEvent);
                /* tslint:disable:no-empty */
            }
            catch (_a) { }
        }
        if (!!this.privSuccessCallback) {
            var result = new Exports_2.TranslationRecognitionResult(undefined, // Translations
            requestId, Exports_2.ResultReason.Canceled, undefined, // Text
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
    };
    TranslationServiceRecognizer.prototype.fireEventForResult = function (serviceResult, properties) {
        var translations;
        if (undefined !== serviceResult.Translation.Translations) {
            translations = new Exports_2.Translations();
            for (var _i = 0, _a = serviceResult.Translation.Translations; _i < _a.length; _i++) {
                var translation = _a[_i];
                translations.set(translation.Language, translation.Text);
            }
        }
        var resultReason;
        if (serviceResult instanceof Exports_3.TranslationPhrase) {
            if (serviceResult.Translation.TranslationStatus === Exports_1.TranslationStatus.Success) {
                resultReason = Exports_2.ResultReason.TranslatedSpeech;
            }
            else {
                resultReason = Exports_2.ResultReason.RecognizedSpeech;
            }
        }
        else {
            resultReason = Exports_2.ResultReason.TranslatingSpeech;
        }
        var offset = serviceResult.Offset + this.privRequestSession.currentTurnAudioOffset;
        var result = new Exports_2.TranslationRecognitionResult(translations, this.privRequestSession.requestId, resultReason, serviceResult.Text, serviceResult.Duration, offset, serviceResult.Translation.FailureReason, JSON.stringify(serviceResult), properties);
        var ev = new Exports_2.TranslationRecognitionEventArgs(result, offset, this.privRequestSession.sessionId);
        return ev;
    };
    TranslationServiceRecognizer.prototype.sendSynthesisAudio = function (audio, sessionId) {
        var reason = (undefined === audio) ? Exports_2.ResultReason.SynthesizingAudioCompleted : Exports_2.ResultReason.SynthesizingAudio;
        var result = new Exports_2.TranslationSynthesisResult(reason, audio);
        var retEvent = new Exports_2.TranslationSynthesisEventArgs(result, sessionId);
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
    };
    return TranslationServiceRecognizer;
}(Exports_3.ServiceRecognizerBase));
exports.TranslationServiceRecognizer = TranslationServiceRecognizer;

//# sourceMappingURL=TranslationServiceRecognizer.js.map