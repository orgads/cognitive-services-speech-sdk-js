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
Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = require("../common.speech/Exports");
var Contracts_1 = require("./Contracts");
var Exports_2 = require("./Exports");
var SpeakerRecognitionResultType;
(function (SpeakerRecognitionResultType) {
    SpeakerRecognitionResultType[SpeakerRecognitionResultType["Verify"] = 0] = "Verify";
    SpeakerRecognitionResultType[SpeakerRecognitionResultType["Identify"] = 1] = "Identify";
})(SpeakerRecognitionResultType = exports.SpeakerRecognitionResultType || (exports.SpeakerRecognitionResultType = {}));
/**
 * Output format
 * @class SpeakerRecognitionResult
 */
var SpeakerRecognitionResult = /** @class */ (function () {
    function SpeakerRecognitionResult(resultType, data, profileId, resultReason) {
        if (resultReason === void 0) { resultReason = Exports_2.ResultReason.RecognizedSpeaker; }
        this.privProperties = new Exports_2.PropertyCollection();
        this.privReason = resultReason;
        if (this.privReason !== Exports_2.ResultReason.Canceled) {
            if (resultType === SpeakerRecognitionResultType.Identify) {
                var json = JSON.parse(data);
                Contracts_1.Contracts.throwIfNullOrUndefined(json, "JSON");
                this.privProfileId = json.identifiedProfile.profileId;
                this.privScore = json.identifiedProfile.score;
            }
            else {
                var json = JSON.parse(data);
                Contracts_1.Contracts.throwIfNullOrUndefined(json, "JSON");
                this.privScore = json.score;
                if (json.recognitionResult.toLowerCase() !== "accept") {
                    this.privReason = Exports_2.ResultReason.NoMatch;
                }
                if (profileId !== undefined && profileId !== "") {
                    this.privProfileId = profileId;
                }
            }
        }
        else {
            var json = JSON.parse(data);
            Contracts_1.Contracts.throwIfNullOrUndefined(json, "JSON");
            this.privErrorDetails = json.statusText;
            this.privProperties.setProperty(Exports_1.CancellationErrorCodePropertyName, Exports_2.CancellationErrorCode[Exports_2.CancellationErrorCode.ServiceError]);
        }
        this.privProperties.setProperty(Exports_2.PropertyId.SpeechServiceResponse_JsonResult, data);
    }
    Object.defineProperty(SpeakerRecognitionResult.prototype, "properties", {
        get: function () {
            return this.privProperties;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeakerRecognitionResult.prototype, "reason", {
        get: function () {
            return this.privReason;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeakerRecognitionResult.prototype, "profileId", {
        get: function () {
            return this.privProfileId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeakerRecognitionResult.prototype, "errorDetails", {
        get: function () {
            return this.privErrorDetails;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeakerRecognitionResult.prototype, "score", {
        get: function () {
            return this.privScore;
        },
        enumerable: true,
        configurable: true
    });
    return SpeakerRecognitionResult;
}());
exports.SpeakerRecognitionResult = SpeakerRecognitionResult;
/**
 * @class SpeakerRecognitionCancellationDetails
 */
// tslint:disable-next-line:max-classes-per-file
var SpeakerRecognitionCancellationDetails = /** @class */ (function (_super) {
    __extends(SpeakerRecognitionCancellationDetails, _super);
    function SpeakerRecognitionCancellationDetails(reason, errorDetails, errorCode) {
        return _super.call(this, reason, errorDetails, errorCode) || this;
    }
    /**
     * Creates an instance of SpeakerRecognitionCancellationDetails object for the canceled SpeakerRecognitionResult
     * @member SpeakerRecognitionCancellationDetails.fromResult
     * @function
     * @public
     * @param {SpeakerRecognitionResult} result - The result that was canceled.
     * @returns {SpeakerRecognitionCancellationDetails} The cancellation details object being created.
     */
    SpeakerRecognitionCancellationDetails.fromResult = function (result) {
        var reason = Exports_2.CancellationReason.Error;
        var errorCode = Exports_2.CancellationErrorCode.NoError;
        if (!!result.properties) {
            errorCode = Exports_2.CancellationErrorCode[result.properties.getProperty(Exports_1.CancellationErrorCodePropertyName, Exports_2.CancellationErrorCode[Exports_2.CancellationErrorCode.NoError])];
        }
        return new SpeakerRecognitionCancellationDetails(reason, result.errorDetails, errorCode);
    };
    return SpeakerRecognitionCancellationDetails;
}(Exports_2.CancellationDetailsBase));
exports.SpeakerRecognitionCancellationDetails = SpeakerRecognitionCancellationDetails;

//# sourceMappingURL=SpeakerRecognitionResult.js.map