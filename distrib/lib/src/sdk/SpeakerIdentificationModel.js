"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
var Contracts_1 = require("./Contracts");
var Exports_1 = require("./Exports");
/**
 * Defines SpeakerIdentificationModel class for Speaker Recognition
 * Model contains a set of profiles against which to identify speaker(s)
 * @class SpeakerIdentificationModel
 */
var SpeakerIdentificationModel = /** @class */ (function () {
    function SpeakerIdentificationModel(profiles) {
        var _this = this;
        this.privVoiceProfiles = [];
        Contracts_1.Contracts.throwIfNullOrUndefined(profiles, "VoiceProfiles");
        if (profiles.length === 0) {
            throw new Error("Empty Voice Profiles array");
        }
        profiles.forEach(function (profile) {
            if (profile.profileType !== Exports_1.VoiceProfileType.TextIndependentIdentification) {
                throw new Error("Identification model can only be created from Identification profile: " + profile.profileId);
            }
            _this.privVoiceProfiles.push(profile);
        });
    }
    SpeakerIdentificationModel.fromProfiles = function (profiles) {
        return new SpeakerIdentificationModel(profiles);
    };
    Object.defineProperty(SpeakerIdentificationModel.prototype, "voiceProfileIds", {
        get: function () {
            return this.privVoiceProfiles.map(function (profile) { return profile.profileId; }).join(",");
        },
        enumerable: true,
        configurable: true
    });
    return SpeakerIdentificationModel;
}());
exports.SpeakerIdentificationModel = SpeakerIdentificationModel;

//# sourceMappingURL=SpeakerIdentificationModel.js.map