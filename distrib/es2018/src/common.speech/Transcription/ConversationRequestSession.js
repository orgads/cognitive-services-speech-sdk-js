// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { createNoDashGuid, Deferred, } from "../../common/Exports";
/**
 * Placeholder class for the Conversation Request Session. Based off RequestSession.
 * TODO: define what telemetry is required.
 */
export class ConversationRequestSession {
    constructor(sessionId) {
        this.privIsDisposed = false;
        this.privDetachables = new Array();
        this.onPreConnectionStart = (authFetchEventId, connectionId) => {
            this.privSessionId = connectionId;
        };
        this.onAuthCompleted = (isError, error) => {
            if (isError) {
                this.onComplete();
            }
        };
        this.onConnectionEstablishCompleted = (statusCode, reason) => {
            if (statusCode === 200) {
                return;
            }
            else if (statusCode === 403) {
                this.onComplete();
            }
        };
        this.onServiceTurnEndResponse = (continuousRecognition) => {
            if (!continuousRecognition) {
                this.onComplete();
            }
            else {
                this.privRequestId = createNoDashGuid();
            }
        };
        this.onComplete = () => {
            //
        };
        this.privSessionId = sessionId;
        this.privRequestId = createNoDashGuid();
        this.privRequestCompletionDeferral = new Deferred();
    }
    get sessionId() {
        return this.privSessionId;
    }
    get requestId() {
        return this.privRequestId;
    }
    get completionPromise() {
        return this.privRequestCompletionDeferral.promise;
    }
    async dispose(error) {
        if (!this.privIsDisposed) {
            // we should have completed by now. If we did not its an unknown error.
            this.privIsDisposed = true;
            for (const detachable of this.privDetachables) {
                await detachable.detach();
            }
        }
    }
}

//# sourceMappingURL=ConversationRequestSession.js.map