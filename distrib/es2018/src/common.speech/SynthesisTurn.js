// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { createNoDashGuid, Deferred, Events } from "../common/Exports";
import { PullAudioOutputStreamImpl } from "../sdk/Audio/AudioOutputStream";
import { SynthesisAdapterBase } from "./SynthesisAdapterBase";
import { ConnectingToSynthesisServiceEvent, SynthesisStartedEvent, SynthesisTriggeredEvent, } from "./SynthesisEvents";
export class SynthesisTurn {
    constructor() {
        this.privIsDisposed = false;
        this.privIsSynthesizing = false;
        this.privIsSynthesisEnded = false;
        this.privBytesReceived = 0;
        this.privInTurn = false;
        this.privTextOffset = 0;
        this.privNextSearchTextIndex = 0;
        this.onPreConnectionStart = (authFetchEventId, connectionId) => {
            this.privAuthFetchEventId = authFetchEventId;
            this.onEvent(new ConnectingToSynthesisServiceEvent(this.privRequestId, this.privAuthFetchEventId));
        };
        this.onAuthCompleted = (isError, error) => {
            if (isError) {
                this.onComplete();
            }
        };
        this.onConnectionEstablishCompleted = (statusCode, reason) => {
            if (statusCode === 200) {
                this.onEvent(new SynthesisStartedEvent(this.requestId, this.privAuthFetchEventId));
                this.privBytesReceived = 0;
                return;
            }
            else if (statusCode === 403) {
                this.onComplete();
            }
        };
        this.onServiceResponseMessage = (responseJson) => {
            const response = JSON.parse(responseJson);
            this.streamId = response.audio.streamId;
        };
        this.onServiceTurnEndResponse = () => {
            this.privInTurn = false;
            this.privTurnDeferral.resolve();
            this.onComplete();
        };
        this.onServiceTurnStartResponse = () => {
            if (!!this.privTurnDeferral && !!this.privInTurn) {
                // What? How are we starting a turn with another not done?
                this.privTurnDeferral.reject("Another turn started before current completed.");
            }
            this.privInTurn = true;
            this.privTurnDeferral = new Deferred();
        };
        this.dispose = (error) => {
            if (!this.privIsDisposed) {
                // we should have completed by now. If we did not its an unknown error.
                this.privIsDisposed = true;
            }
        };
        this.onEvent = (event) => {
            Events.instance.onEvent(event);
        };
        this.onComplete = () => {
            if (this.privIsSynthesizing) {
                this.privIsSynthesizing = false;
                this.privIsSynthesisEnded = true;
                this.privAudioOutputStream.close();
                this.privInTurn = false;
                if (this.privTurnAudioDestination !== undefined) {
                    this.privTurnAudioDestination.close();
                    this.privTurnAudioDestination = undefined;
                }
            }
        };
        this.privRequestId = createNoDashGuid();
        this.privTurnDeferral = new Deferred();
        // We're not in a turn, so resolve.
        this.privTurnDeferral.resolve();
    }
    get requestId() {
        return this.privRequestId;
    }
    get streamId() {
        return this.privStreamId;
    }
    set streamId(value) {
        this.privStreamId = value;
    }
    get audioOutputFormat() {
        return this.privAudioOutputFormat;
    }
    set audioOutputFormat(format) {
        this.privAudioOutputFormat = format;
    }
    get turnCompletionPromise() {
        return this.privTurnDeferral.promise;
    }
    get isSynthesisEnded() {
        return this.privIsSynthesisEnded;
    }
    get isSynthesizing() {
        return this.privIsSynthesizing;
    }
    get currentTextOffset() {
        return this.privTextOffset;
    }
    // The number of bytes received for current turn
    get bytesReceived() {
        return this.privBytesReceived;
    }
    async getAllReceivedAudio() {
        if (!!this.privReceivedAudio) {
            return Promise.resolve(this.privReceivedAudio);
        }
        if (!this.privIsSynthesisEnded) {
            return null;
        }
        await this.readAllAudioFromStream();
        return Promise.resolve(this.privReceivedAudio);
    }
    async getAllReceivedAudioWithHeader() {
        if (!!this.privReceivedAudioWithHeader) {
            return this.privReceivedAudioWithHeader;
        }
        if (!this.privIsSynthesisEnded) {
            return null;
        }
        if (this.audioOutputFormat.hasHeader) {
            const audio = await this.getAllReceivedAudio();
            this.privReceivedAudioWithHeader = SynthesisAdapterBase.addHeader(audio, this.audioOutputFormat);
            return this.privReceivedAudioWithHeader;
        }
        else {
            return this.getAllReceivedAudio();
        }
    }
    startNewSynthesis(requestId, rawText, isSSML, audioDestination) {
        this.privIsSynthesisEnded = false;
        this.privIsSynthesizing = true;
        this.privRequestId = requestId;
        this.privRawText = rawText;
        this.privIsSSML = isSSML;
        this.privAudioOutputStream = new PullAudioOutputStreamImpl();
        this.privAudioOutputStream.format = this.privAudioOutputFormat;
        this.privReceivedAudio = null;
        this.privReceivedAudioWithHeader = null;
        this.privBytesReceived = 0;
        this.privTextOffset = 0;
        this.privNextSearchTextIndex = 0;
        if (audioDestination !== undefined) {
            this.privTurnAudioDestination = audioDestination;
            this.privTurnAudioDestination.format = this.privAudioOutputFormat;
        }
        this.onEvent(new SynthesisTriggeredEvent(this.requestId, undefined, audioDestination === undefined ? undefined : audioDestination.id()));
    }
    onAudioChunkReceived(data) {
        if (this.isSynthesizing) {
            this.privAudioOutputStream.write(data);
            this.privBytesReceived += data.byteLength;
            if (this.privTurnAudioDestination !== undefined) {
                this.privTurnAudioDestination.write(data);
            }
        }
    }
    onWordBoundaryEvent(text) {
        this.updateTextOffset(text);
    }
    onStopSynthesizing() {
        this.onComplete();
    }
    updateTextOffset(text) {
        if (this.privTextOffset >= 0) {
            this.privTextOffset = this.privRawText.indexOf(text, this.privNextSearchTextIndex);
            if (this.privTextOffset >= 0) {
                this.privNextSearchTextIndex = this.privTextOffset + text.length;
            }
            if (this.privIsSSML) {
                if (this.privRawText.indexOf("<", this.privTextOffset + 1) > this.privRawText.indexOf(">", this.privTextOffset + 1)) {
                    this.updateTextOffset(text);
                }
            }
        }
    }
    async readAllAudioFromStream() {
        if (this.privIsSynthesisEnded) {
            this.privReceivedAudio = new ArrayBuffer(this.bytesReceived);
            try {
                await this.privAudioOutputStream.read(this.privReceivedAudio);
            }
            catch (e) {
                this.privReceivedAudio = new ArrayBuffer(0);
            }
        }
    }
}

//# sourceMappingURL=SynthesisTurn.js.map