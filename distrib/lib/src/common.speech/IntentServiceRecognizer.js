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
var IntentServiceRecognizer = /** @class */ (function (_super) {
    __extends(IntentServiceRecognizer, _super);
    function IntentServiceRecognizer(authentication, connectionFactory, audioSource, recognizerConfig, recognizer) {
        var _this = _super.call(this, authentication, connectionFactory, audioSource, recognizerConfig, recognizer) || this;
        _this.privIntentRecognizer = recognizer;
        _this.privIntentDataSent = false;
        return _this;
    }
    IntentServiceRecognizer.prototype.setIntents = function (addedIntents, umbrellaIntent) {
        this.privAddedLmIntents = addedIntents;
        this.privUmbrellaIntent = umbrellaIntent;
        this.privIntentDataSent = true;
    };
    IntentServiceRecognizer.prototype.processTypeSpecificMessages = function (connectionMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var result, ev, processed, resultProps, speechHypothesis, simple, sendEvent, intentResponse, addedIntent, intentId, reason, properties;
            var _this = this;
            return __generator(this, function (_a) {
                processed = false;
                resultProps = new Exports_2.PropertyCollection();
                if (connectionMessage.messageType === Exports_1.MessageType.Text) {
                    resultProps.setProperty(Exports_2.PropertyId.SpeechServiceResponse_JsonResult, connectionMessage.textBody);
                }
                switch (connectionMessage.path.toLowerCase()) {
                    case "speech.hypothesis":
                        speechHypothesis = Exports_3.SpeechHypothesis.fromJSON(connectionMessage.textBody);
                        result = new Exports_2.IntentRecognitionResult(undefined, this.privRequestSession.requestId, Exports_2.ResultReason.RecognizingIntent, speechHypothesis.Text, speechHypothesis.Duration, speechHypothesis.Offset + this.privRequestSession.currentTurnAudioOffset, speechHypothesis.Language, speechHypothesis.LanguageDetectionConfidence, undefined, connectionMessage.textBody, resultProps);
                        this.privRequestSession.onHypothesis(result.offset);
                        ev = new Exports_2.IntentRecognitionEventArgs(result, speechHypothesis.Offset + this.privRequestSession.currentTurnAudioOffset, this.privRequestSession.sessionId);
                        if (!!this.privIntentRecognizer.recognizing) {
                            try {
                                this.privIntentRecognizer.recognizing(this.privIntentRecognizer, ev);
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
                        simple = Exports_3.SimpleSpeechPhrase.fromJSON(connectionMessage.textBody);
                        result = new Exports_2.IntentRecognitionResult(undefined, this.privRequestSession.requestId, Exports_3.EnumTranslation.implTranslateRecognitionResult(simple.RecognitionStatus), simple.DisplayText, simple.Duration, simple.Offset + this.privRequestSession.currentTurnAudioOffset, simple.Language, simple.LanguageDetectionConfidence, undefined, connectionMessage.textBody, resultProps);
                        ev = new Exports_2.IntentRecognitionEventArgs(result, result.offset, this.privRequestSession.sessionId);
                        sendEvent = function () {
                            if (!!_this.privIntentRecognizer.recognized) {
                                try {
                                    _this.privIntentRecognizer.recognized(_this.privIntentRecognizer, ev);
                                    /* tslint:disable:no-empty */
                                }
                                catch (error) {
                                    // Not going to let errors in the event handler
                                    // trip things up.
                                }
                            }
                            // report result to promise.
                            if (!!_this.privSuccessCallback) {
                                try {
                                    _this.privSuccessCallback(result);
                                }
                                catch (e) {
                                    if (!!_this.privErrorCallback) {
                                        _this.privErrorCallback(e);
                                    }
                                }
                                // Only invoke the call back once.
                                // and if it's successful don't invoke the
                                // error after that.
                                _this.privSuccessCallback = undefined;
                                _this.privErrorCallback = undefined;
                            }
                        };
                        // If intent data was sent, the terminal result for this recognizer is an intent being found.
                        // If no intent data was sent, the terminal event is speech recognition being successful.
                        if (false === this.privIntentDataSent || Exports_2.ResultReason.NoMatch === ev.result.reason) {
                            // Advance the buffers.
                            this.privRequestSession.onPhraseRecognized(ev.offset + ev.result.duration);
                            sendEvent();
                        }
                        else {
                            // Squirrel away the args, when the response event arrives it will build upon them
                            // and then return
                            this.privPendingIntentArgs = ev;
                        }
                        processed = true;
                        break;
                    case "response":
                        // Response from LUIS
                        ev = this.privPendingIntentArgs;
                        this.privPendingIntentArgs = undefined;
                        if (undefined === ev) {
                            if ("" === connectionMessage.textBody) {
                                // This condition happens if there is nothing but silence in the
                                // audio sent to the service.
                                return [2 /*return*/];
                            }
                            // Odd... Not sure this can happen
                            ev = new Exports_2.IntentRecognitionEventArgs(new Exports_2.IntentRecognitionResult(), 0 /*TODO*/, this.privRequestSession.sessionId);
                        }
                        intentResponse = Exports_3.IntentResponse.fromJSON(connectionMessage.textBody);
                        addedIntent = this.privAddedLmIntents[intentResponse.topScoringIntent.intent];
                        if (this.privUmbrellaIntent !== undefined) {
                            addedIntent = this.privUmbrellaIntent;
                        }
                        if (null !== intentResponse && addedIntent !== undefined) {
                            intentId = addedIntent.intentName === undefined ? intentResponse.topScoringIntent.intent : addedIntent.intentName;
                            reason = ev.result.reason;
                            if (undefined !== intentId) {
                                reason = Exports_2.ResultReason.RecognizedIntent;
                            }
                            properties = (undefined !== ev.result.properties) ?
                                ev.result.properties : new Exports_2.PropertyCollection();
                            properties.setProperty(Exports_2.PropertyId.LanguageUnderstandingServiceResponse_JsonResult, connectionMessage.textBody);
                            ev = new Exports_2.IntentRecognitionEventArgs(new Exports_2.IntentRecognitionResult(intentId, ev.result.resultId, reason, ev.result.text, ev.result.duration, ev.result.offset, undefined, undefined, ev.result.errorDetails, ev.result.json, properties), ev.offset, ev.sessionId);
                        }
                        this.privRequestSession.onPhraseRecognized(ev.offset + ev.result.duration);
                        if (!!this.privIntentRecognizer.recognized) {
                            try {
                                this.privIntentRecognizer.recognized(this.privIntentRecognizer, ev);
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
                                this.privSuccessCallback(ev.result);
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
                        processed = true;
                        break;
                    default:
                        break;
                }
                return [2 /*return*/, processed];
            });
        });
    };
    // Cancels recognition.
    IntentServiceRecognizer.prototype.cancelRecognition = function (sessionId, requestId, cancellationReason, errorCode, error) {
        var properties = new Exports_2.PropertyCollection();
        properties.setProperty(Exports_3.CancellationErrorCodePropertyName, Exports_2.CancellationErrorCode[errorCode]);
        if (!!this.privIntentRecognizer.canceled) {
            var cancelEvent = new Exports_2.IntentRecognitionCanceledEventArgs(cancellationReason, error, errorCode, undefined, undefined, sessionId);
            try {
                this.privIntentRecognizer.canceled(this.privIntentRecognizer, cancelEvent);
                /* tslint:disable:no-empty */
            }
            catch (_a) { }
        }
        if (!!this.privSuccessCallback) {
            var result = new Exports_2.IntentRecognitionResult(undefined, // Intent Id
            requestId, Exports_2.ResultReason.Canceled, undefined, // Text
            undefined, // Duration
            undefined, // Offset
            undefined, // Language
            undefined, // LanguageDetectionConfidence
            error, undefined, // Json
            properties);
            try {
                this.privSuccessCallback(result);
                this.privSuccessCallback = undefined;
                /* tslint:disable:no-empty */
            }
            catch (_b) { }
        }
    };
    return IntentServiceRecognizer;
}(Exports_3.ServiceRecognizerBase));
exports.IntentServiceRecognizer = IntentServiceRecognizer;

//# sourceMappingURL=IntentServiceRecognizer.js.map