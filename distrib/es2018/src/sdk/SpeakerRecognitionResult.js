// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { CancellationErrorCodePropertyName } from "../common.speech/Exports";
import { Contracts } from "./Contracts";
import { CancellationDetailsBase, CancellationErrorCode, CancellationReason, PropertyCollection, PropertyId, ResultReason, } from "./Exports";
export var SpeakerRecognitionResultType;
(function (SpeakerRecognitionResultType) {
    SpeakerRecognitionResultType[SpeakerRecognitionResultType["Verify"] = 0] = "Verify";
    SpeakerRecognitionResultType[SpeakerRecognitionResultType["Identify"] = 1] = "Identify";
})(SpeakerRecognitionResultType || (SpeakerRecognitionResultType = {}));
/**
 * Output format
 * @class SpeakerRecognitionResult
 */
export class SpeakerRecognitionResult {
    constructor(resultType, data, profileId, resultReason = ResultReason.RecognizedSpeaker) {
        this.privProperties = new PropertyCollection();
        this.privReason = resultReason;
        if (this.privReason !== ResultReason.Canceled) {
            if (resultType === SpeakerRecognitionResultType.Identify) {
                const json = JSON.parse(data);
                Contracts.throwIfNullOrUndefined(json, "JSON");
                this.privProfileId = json.identifiedProfile.profileId;
                this.privScore = json.identifiedProfile.score;
            }
            else {
                const json = JSON.parse(data);
                Contracts.throwIfNullOrUndefined(json, "JSON");
                this.privScore = json.score;
                if (json.recognitionResult.toLowerCase() !== "accept") {
                    this.privReason = ResultReason.NoMatch;
                }
                if (profileId !== undefined && profileId !== "") {
                    this.privProfileId = profileId;
                }
            }
        }
        else {
            const json = JSON.parse(data);
            Contracts.throwIfNullOrUndefined(json, "JSON");
            this.privErrorDetails = json.statusText;
            this.privProperties.setProperty(CancellationErrorCodePropertyName, CancellationErrorCode[CancellationErrorCode.ServiceError]);
        }
        this.privProperties.setProperty(PropertyId.SpeechServiceResponse_JsonResult, data);
    }
    get properties() {
        return this.privProperties;
    }
    get reason() {
        return this.privReason;
    }
    get profileId() {
        return this.privProfileId;
    }
    get errorDetails() {
        return this.privErrorDetails;
    }
    get score() {
        return this.privScore;
    }
}
/**
 * @class SpeakerRecognitionCancellationDetails
 */
// tslint:disable-next-line:max-classes-per-file
export class SpeakerRecognitionCancellationDetails extends CancellationDetailsBase {
    constructor(reason, errorDetails, errorCode) {
        super(reason, errorDetails, errorCode);
    }
    /**
     * Creates an instance of SpeakerRecognitionCancellationDetails object for the canceled SpeakerRecognitionResult
     * @member SpeakerRecognitionCancellationDetails.fromResult
     * @function
     * @public
     * @param {SpeakerRecognitionResult} result - The result that was canceled.
     * @returns {SpeakerRecognitionCancellationDetails} The cancellation details object being created.
     */
    static fromResult(result) {
        const reason = CancellationReason.Error;
        let errorCode = CancellationErrorCode.NoError;
        if (!!result.properties) {
            errorCode = CancellationErrorCode[result.properties.getProperty(CancellationErrorCodePropertyName, CancellationErrorCode[CancellationErrorCode.NoError])];
        }
        return new SpeakerRecognitionCancellationDetails(reason, result.errorDetails, errorCode);
    }
}

//# sourceMappingURL=SpeakerRecognitionResult.js.map