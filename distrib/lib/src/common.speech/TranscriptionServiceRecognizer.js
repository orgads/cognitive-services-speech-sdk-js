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
var SpeechConnectionMessage_Internal_1 = require("./SpeechConnectionMessage.Internal");
// tslint:disable-next-line:max-classes-per-file
var TranscriptionServiceRecognizer = /** @class */ (function (_super) {
    __extends(TranscriptionServiceRecognizer, _super);
    function TranscriptionServiceRecognizer(authentication, connectionFactory, audioSource, recognizerConfig, transcriber) {
        var _this = _super.call(this, authentication, connectionFactory, audioSource, recognizerConfig, transcriber) || this;
        _this.sendSpeechEvent = function (connection, payload) {
            var speechEventJson = JSON.stringify(payload);
            if (speechEventJson) {
                return connection.send(new SpeechConnectionMessage_Internal_1.SpeechConnectionMessage(Exports_1.MessageType.Text, "speech.event", _this.privRequestSession.requestId, "application/json", speechEventJson));
            }
            return;
        };
        _this.privTranscriberRecognizer = transcriber;
        _this.sendPrePayloadJSONOverride = _this.sendTranscriptionStartJSON;
        return _this;
    }
    TranscriptionServiceRecognizer.prototype.sendSpeechEventAsync = function (info, command) {
        return __awaiter(this, void 0, void 0, function () {
            var connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!!this.privRequestSession.isRecognizing) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.fetchConnection()];
                    case 1:
                        connection = _a.sent();
                        return [4 /*yield*/, this.sendSpeechEvent(connection, this.createSpeechEventPayload(info, command))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TranscriptionServiceRecognizer.prototype.processTypeSpecificMessages = function (connectionMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var result, resultProps, processed, _a, hypothesis, offset, ev, simple, resultReason, cancelReason, detailed, event_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        resultProps = new Exports_2.PropertyCollection();
                        resultProps.setProperty(Exports_2.PropertyId.SpeechServiceResponse_JsonResult, connectionMessage.textBody);
                        processed = false;
                        _a = connectionMessage.path.toLowerCase();
                        switch (_a) {
                            case "speech.hypothesis": return [3 /*break*/, 1];
                            case "speech.fragment": return [3 /*break*/, 1];
                            case "speech.phrase": return [3 /*break*/, 2];
                        }
                        return [3 /*break*/, 6];
                    case 1:
                        hypothesis = Exports_3.SpeechHypothesis.fromJSON(connectionMessage.textBody);
                        offset = hypothesis.Offset + this.privRequestSession.currentTurnAudioOffset;
                        result = new Exports_2.SpeechRecognitionResult(this.privRequestSession.requestId, Exports_2.ResultReason.RecognizingSpeech, hypothesis.Text, hypothesis.Duration, offset, hypothesis.Language, hypothesis.LanguageDetectionConfidence, hypothesis.SpeakerId, undefined, connectionMessage.textBody, resultProps);
                        this.privRequestSession.onHypothesis(offset);
                        ev = new Exports_2.SpeechRecognitionEventArgs(result, hypothesis.Duration, this.privRequestSession.sessionId);
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
                        return [3 /*break*/, 7];
                    case 2:
                        simple = Exports_3.SimpleSpeechPhrase.fromJSON(connectionMessage.textBody);
                        resultReason = Exports_3.EnumTranslation.implTranslateRecognitionResult(simple.RecognitionStatus);
                        this.privRequestSession.onPhraseRecognized(this.privRequestSession.currentTurnAudioOffset + simple.Offset + simple.Duration);
                        if (!(Exports_2.ResultReason.Canceled === resultReason)) return [3 /*break*/, 4];
                        cancelReason = Exports_3.EnumTranslation.implTranslateCancelResult(simple.RecognitionStatus);
                        return [4 /*yield*/, this.cancelRecognitionLocal(cancelReason, Exports_3.EnumTranslation.implTranslateCancelErrorCode(simple.RecognitionStatus), undefined)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        if (!(this.privRequestSession.isSpeechEnded && resultReason === Exports_2.ResultReason.NoMatch && simple.RecognitionStatus !== Exports_3.RecognitionStatus.InitialSilenceTimeout)) {
                            if (this.privRecognizerConfig.parameters.getProperty(Exports_3.OutputFormatPropertyName) === Exports_2.OutputFormat[Exports_2.OutputFormat.Simple]) {
                                result = new Exports_2.SpeechRecognitionResult(this.privRequestSession.requestId, resultReason, simple.DisplayText, simple.Duration, simple.Offset + this.privRequestSession.currentTurnAudioOffset, simple.Language, simple.LanguageDetectionConfidence, simple.SpeakerId, undefined, connectionMessage.textBody, resultProps);
                            }
                            else {
                                detailed = Exports_3.DetailedSpeechPhrase.fromJSON(connectionMessage.textBody);
                                result = new Exports_2.SpeechRecognitionResult(this.privRequestSession.requestId, resultReason, detailed.RecognitionStatus === Exports_3.RecognitionStatus.Success ? detailed.NBest[0].Display : undefined, detailed.Duration, detailed.Offset + this.privRequestSession.currentTurnAudioOffset, detailed.Language, detailed.LanguageDetectionConfidence, undefined, undefined, connectionMessage.textBody, resultProps);
                            }
                            event_1 = new Exports_2.SpeechRecognitionEventArgs(result, result.offset, this.privRequestSession.sessionId);
                            if (!!this.privTranscriberRecognizer.recognized) {
                                try {
                                    this.privTranscriberRecognizer.recognized(this.privTranscriberRecognizer, event_1);
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
                        _b.label = 5;
                    case 5:
                        processed = true;
                        return [3 /*break*/, 7];
                    case 6: return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, processed];
                }
            });
        });
    };
    // Cancels recognition.
    TranscriptionServiceRecognizer.prototype.cancelRecognition = function (sessionId, requestId, cancellationReason, errorCode, error) {
        var properties = new Exports_2.PropertyCollection();
        properties.setProperty(Exports_3.CancellationErrorCodePropertyName, Exports_2.CancellationErrorCode[errorCode]);
        if (!!this.privTranscriberRecognizer.canceled) {
            var cancelEvent = new Exports_2.ConversationTranscriptionCanceledEventArgs(cancellationReason, error, errorCode, undefined, sessionId);
            try {
                this.privTranscriberRecognizer.canceled(this.privTranscriberRecognizer, cancelEvent);
                /* tslint:disable:no-empty */
            }
            catch (_a) { }
        }
        if (!!this.privSuccessCallback) {
            var result = new Exports_2.SpeechRecognitionResult(requestId, Exports_2.ResultReason.Canceled, undefined, // Text
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
    };
    // Encapsulated for derived service recognizers that need to send additional JSON
    TranscriptionServiceRecognizer.prototype.sendTranscriptionStartJSON = function (connection) {
        return __awaiter(this, void 0, void 0, function () {
            var info, payload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendSpeechContext(connection)];
                    case 1:
                        _a.sent();
                        info = this.privTranscriberRecognizer.getConversationInfo();
                        payload = this.createSpeechEventPayload(info, "start");
                        return [4 /*yield*/, this.sendSpeechEvent(connection, payload)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.sendWaveHeader(connection)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TranscriptionServiceRecognizer.prototype.createSpeechEventPayload = function (info, command) {
        var meeting = "meeting";
        var eventDict = { id: meeting, name: command, meeting: info.conversationProperties };
        var idString = "id";
        var attendees = "attendees";
        var record = "record";
        eventDict[meeting][idString] = info.id;
        eventDict[meeting][attendees] = info.participants;
        eventDict[meeting][record] = info.conversationProperties.audiorecording === "on" ? "true" : "false";
        return eventDict;
    };
    return TranscriptionServiceRecognizer;
}(Exports_3.ServiceRecognizerBase));
exports.TranscriptionServiceRecognizer = TranscriptionServiceRecognizer;

//# sourceMappingURL=TranscriptionServiceRecognizer.js.map