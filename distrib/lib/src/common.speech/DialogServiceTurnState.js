"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
var AudioOutputFormat_1 = require("../sdk/Audio/AudioOutputFormat");
var AudioOutputStream_1 = require("../sdk/Audio/AudioOutputStream");
var ActivityResponsePayload_1 = require("./ServiceMessages/ActivityResponsePayload");
var DialogServiceTurnState = /** @class */ (function () {
    function DialogServiceTurnState(manager, requestId) {
        this.privRequestId = requestId;
        this.privIsCompleted = false;
        this.privAudioStream = null;
        this.privTurnManager = manager;
        this.resetTurnEndTimeout();
        // tslint:disable-next-line:no-console
        // console.info("DialogServiceTurnState debugturn start:" + this.privRequestId);
    }
    Object.defineProperty(DialogServiceTurnState.prototype, "audioStream", {
        get: function () {
            // Called when is needed to stream.
            this.resetTurnEndTimeout();
            return this.privAudioStream;
        },
        enumerable: true,
        configurable: true
    });
    DialogServiceTurnState.prototype.processActivityPayload = function (payload, audioFormat) {
        if (payload.messageDataStreamType === ActivityResponsePayload_1.MessageDataStreamType.TextToSpeechAudio) {
            this.privAudioStream = AudioOutputStream_1.AudioOutputStream.createPullStream();
            this.privAudioStream.format = (audioFormat !== undefined) ? audioFormat : AudioOutputFormat_1.AudioOutputFormatImpl.getDefaultOutputFormat();
            // tslint:disable-next-line:no-console
            // console.info("Audio start debugturn:" + this.privRequestId);
        }
        return this.privAudioStream;
    };
    DialogServiceTurnState.prototype.endAudioStream = function () {
        if (this.privAudioStream !== null && !this.privAudioStream.isClosed) {
            this.privAudioStream.close();
        }
    };
    DialogServiceTurnState.prototype.complete = function () {
        if (this.privTimeoutToken !== undefined) {
            clearTimeout(this.privTimeoutToken);
        }
        this.endAudioStream();
    };
    DialogServiceTurnState.prototype.resetTurnEndTimeout = function () {
        var _this = this;
        if (this.privTimeoutToken !== undefined) {
            clearTimeout(this.privTimeoutToken);
        }
        // tslint:disable-next-line:no-console
        // console.info("Timeout reset debugturn:" + this.privRequestId);
        this.privTimeoutToken = setTimeout(function () {
            // tslint:disable-next-line:no-console
            // console.info("Timeout complete debugturn:" + this.privRequestId);
            _this.privTurnManager.CompleteTurn(_this.privRequestId);
            return;
        }, 2000);
    };
    return DialogServiceTurnState;
}());
exports.DialogServiceTurnState = DialogServiceTurnState;

//# sourceMappingURL=DialogServiceTurnState.js.map