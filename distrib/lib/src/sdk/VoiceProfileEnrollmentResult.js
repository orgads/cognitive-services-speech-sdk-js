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
/**
 * Output format
 * @class VoiceProfileEnrollmentResult
 */
var VoiceProfileEnrollmentResult = /** @class */ (function () {
    function VoiceProfileEnrollmentResult(reason, json, statusText) {
        this.privReason = reason;
        this.privProperties = new Exports_2.PropertyCollection();
        if (this.privReason !== Exports_2.ResultReason.Canceled) {
            this.privDetails = JSON.parse(json);
            Contracts_1.Contracts.throwIfNullOrUndefined(json, "JSON");
            if (this.privDetails.enrollmentStatus.toLowerCase() === "enrolling") {
                this.privReason = Exports_2.ResultReason.EnrollingVoiceProfile;
            }
        }
        else {
            this.privErrorDetails = statusText;
            this.privProperties.setProperty(Exports_1.CancellationErrorCodePropertyName, Exports_2.CancellationErrorCode[Exports_2.CancellationErrorCode.ServiceError]);
        }
    }
    Object.defineProperty(VoiceProfileEnrollmentResult.prototype, "reason", {
        get: function () {
            return this.privReason;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VoiceProfileEnrollmentResult.prototype, "enrollmentsCount", {
        get: function () {
            return this.privDetails.enrollmentsCount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VoiceProfileEnrollmentResult.prototype, "enrollmentsLength", {
        get: function () {
            return this.privDetails.enrollmentsLength;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VoiceProfileEnrollmentResult.prototype, "properties", {
        get: function () {
            return this.privProperties;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VoiceProfileEnrollmentResult.prototype, "enrollmentResultDetails", {
        get: function () {
            return this.privDetails;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VoiceProfileEnrollmentResult.prototype, "errorDetails", {
        get: function () {
            return this.privErrorDetails;
        },
        enumerable: true,
        configurable: true
    });
    return VoiceProfileEnrollmentResult;
}());
exports.VoiceProfileEnrollmentResult = VoiceProfileEnrollmentResult;
/**
 * @class VoiceProfileEnrollmentCancellationDetails
 */
// tslint:disable-next-line:max-classes-per-file
var VoiceProfileEnrollmentCancellationDetails = /** @class */ (function (_super) {
    __extends(VoiceProfileEnrollmentCancellationDetails, _super);
    function VoiceProfileEnrollmentCancellationDetails(reason, errorDetails, errorCode) {
        return _super.call(this, reason, errorDetails, errorCode) || this;
    }
    /**
     * Creates an instance of VoiceProfileEnrollmentCancellationDetails object for the canceled VoiceProfileEnrollmentResult.
     * @member VoiceProfileEnrollmentCancellationDetails.fromResult
     * @function
     * @public
     * @param {VoiceProfileEnrollmentResult} result - The result that was canceled.
     * @returns {VoiceProfileEnrollmentCancellationDetails} The cancellation details object being created.
     */
    VoiceProfileEnrollmentCancellationDetails.fromResult = function (result) {
        var reason = Exports_2.CancellationReason.Error;
        var errorCode = Exports_2.CancellationErrorCode.NoError;
        if (!!result.properties) {
            errorCode = Exports_2.CancellationErrorCode[result.properties.getProperty(Exports_1.CancellationErrorCodePropertyName, Exports_2.CancellationErrorCode[Exports_2.CancellationErrorCode.NoError])];
        }
        return new VoiceProfileEnrollmentCancellationDetails(reason, result.errorDetails, errorCode);
    };
    return VoiceProfileEnrollmentCancellationDetails;
}(Exports_2.CancellationDetailsBase));
exports.VoiceProfileEnrollmentCancellationDetails = VoiceProfileEnrollmentCancellationDetails;

//# sourceMappingURL=VoiceProfileEnrollmentResult.js.map