// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { InvalidOperationError } from "./Error";
import { createNoDashGuid } from "./Guid";
import { Queue } from "./Queue";
export class Stream {
    constructor(streamId) {
        this.privIsWriteEnded = false;
        this.privIsReadEnded = false;
        this.read = () => {
            if (this.privIsReadEnded) {
                throw new InvalidOperationError("Stream read has already finished");
            }
            return this.privReaderQueue
                .dequeue()
                .then(async (streamChunk) => {
                if (streamChunk === undefined || streamChunk.isEnd) {
                    await this.privReaderQueue.dispose("End of stream reached");
                }
                return streamChunk;
            });
        };
        this.readEnded = () => {
            if (!this.privIsReadEnded) {
                this.privIsReadEnded = true;
                this.privReaderQueue = new Queue();
            }
        };
        this.throwIfClosed = () => {
            if (this.privIsWriteEnded) {
                throw new InvalidOperationError("Stream closed");
            }
        };
        this.privId = streamId ? streamId : createNoDashGuid();
        this.privReaderQueue = new Queue();
    }
    get isClosed() {
        return this.privIsWriteEnded;
    }
    get isReadEnded() {
        return this.privIsReadEnded;
    }
    get id() {
        return this.privId;
    }
    close() {
        if (!this.privIsWriteEnded) {
            this.writeStreamChunk({
                buffer: null,
                isEnd: true,
                timeReceived: Date.now(),
            });
            this.privIsWriteEnded = true;
        }
    }
    writeStreamChunk(streamChunk) {
        this.throwIfClosed();
        if (!this.privReaderQueue.isDisposed()) {
            try {
                this.privReaderQueue.enqueue(streamChunk);
            }
            catch (e) {
                // Do nothing
            }
        }
    }
}

//# sourceMappingURL=Stream.js.map