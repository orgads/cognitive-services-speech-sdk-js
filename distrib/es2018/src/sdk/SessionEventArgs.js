// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/**
 * Defines content for session events like SessionStarted/Stopped, SoundStarted/Stopped.
 * @class SessionEventArgs
 */
export class SessionEventArgs {
    /**
     * Creates and initializes an instance of this class.
     * @constructor
     * @param {string} sessionId - The session id.
     */
    constructor(sessionId) {
        this.privSessionId = sessionId;
    }
    /**
     * Represents the session identifier.
     * @member SessionEventArgs.prototype.sessionId
     * @function
     * @public
     * @returns {string} Represents the session identifier.
     */
    get sessionId() {
        return this.privSessionId;
    }
}

//# sourceMappingURL=SessionEventArgs.js.map