// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { createNoDashGuid, Deferred, Events } from "../common/Exports";
import { ConnectingToServiceEvent, ListeningStartedEvent, RecognitionStartedEvent, RecognitionTriggeredEvent, } from "./RecognitionEvents";
import { ServiceTelemetryListener } from "./ServiceTelemetryListener.Internal";
export class RequestSession {
    constructor(audioSourceId) {
        this.privIsDisposed = false;
        this.privDetachables = new Array();
        this.privIsAudioNodeDetached = false;
        this.privIsRecognizing = false;
        this.privIsSpeechEnded = false;
        this.privTurnStartAudioOffset = 0;
        this.privLastRecoOffset = 0;
        this.privHypothesisReceived = false;
        this.privBytesSent = 0;
        this.privRecogNumber = 0;
        this.privInTurn = false;
        this.onPreConnectionStart = (authFetchEventId, connectionId) => {
            this.privAuthFetchEventId = authFetchEventId;
            this.privSessionId = connectionId;
            this.onEvent(new ConnectingToServiceEvent(this.privRequestId, this.privAuthFetchEventId, this.privSessionId));
        };
        this.onServiceTurnStartResponse = () => {
            if (!!this.privTurnDeferral && !!this.privInTurn) {
                // What? How are we starting a turn with another not done?
                this.privTurnDeferral.reject("Another turn started before current completed.");
            }
            this.privInTurn = true;
            this.privTurnDeferral = new Deferred();
        };
        this.getTelemetry = () => {
            if (this.privServiceTelemetryListener.hasTelemetry) {
                return this.privServiceTelemetryListener.getTelemetry();
            }
            else {
                return null;
            }
        };
        this.onEvent = (event) => {
            if (!!this.privServiceTelemetryListener) {
                this.privServiceTelemetryListener.onEvent(event);
            }
            Events.instance.onEvent(event);
        };
        this.privAudioSourceId = audioSourceId;
        this.privRequestId = createNoDashGuid();
        this.privAudioNodeId = createNoDashGuid();
        this.privTurnDeferral = new Deferred();
        // We're not in a turn, so resolve.
        this.privTurnDeferral.resolve();
    }
    get sessionId() {
        return this.privSessionId;
    }
    get requestId() {
        return this.privRequestId;
    }
    get audioNodeId() {
        return this.privAudioNodeId;
    }
    get turnCompletionPromise() {
        return this.privTurnDeferral.promise;
    }
    get isSpeechEnded() {
        return this.privIsSpeechEnded;
    }
    get isRecognizing() {
        return this.privIsRecognizing;
    }
    get currentTurnAudioOffset() {
        return this.privTurnStartAudioOffset;
    }
    get recogNumber() {
        return this.privRecogNumber;
    }
    // The number of bytes sent for the current connection.
    // Counter is reset to 0 each time a connection is established.
    get bytesSent() {
        return this.privBytesSent;
    }
    listenForServiceTelemetry(eventSource) {
        if (!!this.privServiceTelemetryListener) {
            this.privDetachables.push(eventSource.attachListener(this.privServiceTelemetryListener));
        }
    }
    startNewRecognition() {
        this.privIsSpeechEnded = false;
        this.privIsRecognizing = true;
        this.privTurnStartAudioOffset = 0;
        this.privLastRecoOffset = 0;
        this.privRequestId = createNoDashGuid();
        this.privRecogNumber++;
        this.privServiceTelemetryListener = new ServiceTelemetryListener(this.privRequestId, this.privAudioSourceId, this.privAudioNodeId);
        this.onEvent(new RecognitionTriggeredEvent(this.requestId, this.privSessionId, this.privAudioSourceId, this.privAudioNodeId));
    }
    async onAudioSourceAttachCompleted(audioNode, isError, error) {
        this.privAudioNode = audioNode;
        this.privIsAudioNodeDetached = false;
        if (isError) {
            await this.onComplete();
        }
        else {
            this.onEvent(new ListeningStartedEvent(this.privRequestId, this.privSessionId, this.privAudioSourceId, this.privAudioNodeId));
        }
    }
    async onAuthCompleted(isError, error) {
        if (isError) {
            await this.onComplete();
        }
    }
    async onConnectionEstablishCompleted(statusCode, reason) {
        if (statusCode === 200) {
            this.onEvent(new RecognitionStartedEvent(this.requestId, this.privAudioSourceId, this.privAudioNodeId, this.privAuthFetchEventId, this.privSessionId));
            if (!!this.privAudioNode) {
                this.privAudioNode.replay();
            }
            this.privTurnStartAudioOffset = this.privLastRecoOffset;
            this.privBytesSent = 0;
            return;
        }
        else if (statusCode === 403) {
            await this.onComplete();
        }
    }
    async onServiceTurnEndResponse(continuousRecognition) {
        this.privTurnDeferral.resolve();
        if (!continuousRecognition || this.isSpeechEnded) {
            await this.onComplete();
            this.privInTurn = false;
        }
        else {
            // Start a new request set.
            this.privTurnStartAudioOffset = this.privLastRecoOffset;
            this.privRequestId = createNoDashGuid();
            this.privAudioNode.replay();
        }
    }
    onHypothesis(offset) {
        if (!this.privHypothesisReceived) {
            this.privHypothesisReceived = true;
            this.privServiceTelemetryListener.hypothesisReceived(this.privAudioNode.findTimeAtOffset(offset));
        }
    }
    onPhraseRecognized(offset) {
        this.privServiceTelemetryListener.phraseReceived(this.privAudioNode.findTimeAtOffset(offset));
        this.onServiceRecognized(offset);
    }
    onServiceRecognized(offset) {
        this.privLastRecoOffset = offset;
        this.privHypothesisReceived = false;
        this.privAudioNode.shrinkBuffers(offset);
    }
    onAudioSent(bytesSent) {
        this.privBytesSent += bytesSent;
    }
    async dispose(error) {
        if (!this.privIsDisposed) {
            // we should have completed by now. If we did not its an unknown error.
            this.privIsDisposed = true;
            for (const detachable of this.privDetachables) {
                await detachable.detach();
            }
            this.privServiceTelemetryListener.dispose();
            this.privIsRecognizing = false;
        }
    }
    async onStopRecognizing() {
        await this.onComplete();
    }
    // Should be called with the audioNode for this session has indicated that it is out of speech.
    onSpeechEnded() {
        this.privIsSpeechEnded = true;
    }
    async onComplete() {
        if (!!this.privIsRecognizing) {
            this.privIsRecognizing = false;
            await this.detachAudioNode();
        }
    }
    async detachAudioNode() {
        if (!this.privIsAudioNodeDetached) {
            this.privIsAudioNodeDetached = true;
            if (this.privAudioNode) {
                await this.privAudioNode.detach();
            }
        }
    }
}

//# sourceMappingURL=RequestSession.js.map