// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// tslint:disable:max-classes-per-file
import { connectivity, type, } from "../../common.speech/Exports";
import { AudioSourceInitializingEvent, AudioSourceReadyEvent, AudioStreamNodeAttachedEvent, AudioStreamNodeAttachingEvent, AudioStreamNodeDetachedEvent, ChunkedArrayBufferStream, Events, EventSource, } from "../../common/Exports";
import { createNoDashGuid } from "../../common/Guid";
import { AudioStreamFormat } from "../Exports";
import { AudioStreamFormatImpl } from "./AudioStreamFormat";
/**
 * Represents audio input stream used for custom audio input configurations.
 * @class AudioInputStream
 */
export class AudioInputStream {
    /**
     * Creates and initializes an instance.
     * @constructor
     */
    constructor() { }
    /**
     * Creates a memory backed PushAudioInputStream with the specified audio format.
     * @member AudioInputStream.createPushStream
     * @function
     * @public
     * @param {AudioStreamFormat} format - The audio data format in which audio will be
     *        written to the push audio stream's write() method (Required if format is not 16 kHz 16bit mono PCM).
     * @returns {PushAudioInputStream} The audio input stream being created.
     */
    static createPushStream(format) {
        return PushAudioInputStream.create(format);
    }
    /**
     * Creates a PullAudioInputStream that delegates to the specified callback interface for read()
     * and close() methods.
     * @member AudioInputStream.createPullStream
     * @function
     * @public
     * @param {PullAudioInputStreamCallback} callback - The custom audio input object, derived from
     *        PullAudioInputStreamCallback
     * @param {AudioStreamFormat} format - The audio data format in which audio will be returned from
     *        the callback's read() method (Required if format is not 16 kHz 16bit mono PCM).
     * @returns {PullAudioInputStream} The audio input stream being created.
     */
    static createPullStream(callback, format) {
        return PullAudioInputStream.create(callback, format);
        // throw new Error("Oops");
    }
}
/**
 * Represents memory backed push audio input stream used for custom audio input configurations.
 * @class PushAudioInputStream
 */
export class PushAudioInputStream extends AudioInputStream {
    /**
     * Creates a memory backed PushAudioInputStream with the specified audio format.
     * @member PushAudioInputStream.create
     * @function
     * @public
     * @param {AudioStreamFormat} format - The audio data format in which audio will be written to the
     *        push audio stream's write() method (Required if format is not 16 kHz 16bit mono PCM).
     * @returns {PushAudioInputStream} The push audio input stream being created.
     */
    static create(format) {
        return new PushAudioInputStreamImpl(format);
    }
}
/**
 * Represents memory backed push audio input stream used for custom audio input configurations.
 * @private
 * @class PushAudioInputStreamImpl
 */
export class PushAudioInputStreamImpl extends PushAudioInputStream {
    /**
     * Creates and initalizes an instance with the given values.
     * @constructor
     * @param {AudioStreamFormat} format - The audio stream format.
     */
    constructor(format) {
        super();
        this.onEvent = (event) => {
            this.privEvents.onEvent(event);
            Events.instance.onEvent(event);
        };
        if (format === undefined) {
            this.privFormat = AudioStreamFormatImpl.getDefaultInputFormat();
        }
        else {
            this.privFormat = format;
        }
        this.privEvents = new EventSource();
        this.privId = createNoDashGuid();
        this.privStream = new ChunkedArrayBufferStream(this.privFormat.avgBytesPerSec / 10);
    }
    /**
     * Format information for the audio
     */
    get format() {
        return Promise.resolve(this.privFormat);
    }
    /**
     * Writes the audio data specified by making an internal copy of the data.
     * @member PushAudioInputStreamImpl.prototype.write
     * @function
     * @public
     * @param {ArrayBuffer} dataBuffer - The audio buffer of which this function will make a copy.
     */
    write(dataBuffer) {
        this.privStream.writeStreamChunk({
            buffer: dataBuffer,
            isEnd: false,
            timeReceived: Date.now()
        });
    }
    /**
     * Closes the stream.
     * @member PushAudioInputStreamImpl.prototype.close
     * @function
     * @public
     */
    close() {
        this.privStream.close();
    }
    id() {
        return this.privId;
    }
    get blob() {
        return this.attach("id").then((audioNode) => {
            const data = [];
            let bufferData = Buffer.from("");
            const readCycle = () => {
                return audioNode.read().then((audioStreamChunk) => {
                    if (!audioStreamChunk || audioStreamChunk.isEnd) {
                        if (typeof (XMLHttpRequest) !== "undefined" && typeof (Blob) !== "undefined") {
                            return Promise.resolve(new Blob(data));
                        }
                        else {
                            return Promise.resolve(Buffer.from(bufferData));
                        }
                    }
                    else {
                        if (typeof (Blob) !== "undefined") {
                            data.push(audioStreamChunk.buffer);
                        }
                        else {
                            bufferData = Buffer.concat([bufferData, this.toBuffer(audioStreamChunk.buffer)]);
                        }
                        return readCycle();
                    }
                });
            };
            return readCycle();
        });
    }
    turnOn() {
        this.onEvent(new AudioSourceInitializingEvent(this.privId)); // no stream id
        this.onEvent(new AudioSourceReadyEvent(this.privId));
        return;
    }
    async attach(audioNodeId) {
        this.onEvent(new AudioStreamNodeAttachingEvent(this.privId, audioNodeId));
        await this.turnOn();
        const stream = this.privStream;
        this.onEvent(new AudioStreamNodeAttachedEvent(this.privId, audioNodeId));
        return {
            detach: async () => {
                stream.readEnded();
                this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId));
                return this.turnOff();
            },
            id: () => {
                return audioNodeId;
            },
            read: () => {
                return stream.read();
            },
        };
    }
    detach(audioNodeId) {
        this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId));
    }
    turnOff() {
        return;
    }
    get events() {
        return this.privEvents;
    }
    get deviceInfo() {
        return Promise.resolve({
            bitspersample: this.privFormat.bitsPerSample,
            channelcount: this.privFormat.channels,
            connectivity: connectivity.Unknown,
            manufacturer: "Speech SDK",
            model: "PushStream",
            samplerate: this.privFormat.samplesPerSec,
            type: type.Stream,
        });
    }
    toBuffer(arrayBuffer) {
        const buf = Buffer.alloc(arrayBuffer.byteLength);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < buf.length; ++i) {
            buf[i] = view[i];
        }
        return buf;
    }
}
/*
 * Represents audio input stream used for custom audio input configurations.
 * @class PullAudioInputStream
 */
export class PullAudioInputStream extends AudioInputStream {
    /**
     * Creates and initializes and instance.
     * @constructor
     */
    constructor() { super(); }
    /**
     * Creates a PullAudioInputStream that delegates to the specified callback interface for
     * read() and close() methods, using the default format (16 kHz 16bit mono PCM).
     * @member PullAudioInputStream.create
     * @function
     * @public
     * @param {PullAudioInputStreamCallback} callback - The custom audio input object,
     *        derived from PullAudioInputStreamCustomCallback
     * @param {AudioStreamFormat} format - The audio data format in which audio will be
     *        returned from the callback's read() method (Required if format is not 16 kHz 16bit mono PCM).
     * @returns {PullAudioInputStream} The push audio input stream being created.
     */
    static create(callback, format) {
        return new PullAudioInputStreamImpl(callback, format);
    }
}
/**
 * Represents audio input stream used for custom audio input configurations.
 * @private
 * @class PullAudioInputStreamImpl
 */
export class PullAudioInputStreamImpl extends PullAudioInputStream {
    /**
     * Creates a PullAudioInputStream that delegates to the specified callback interface for
     * read() and close() methods, using the default format (16 kHz 16bit mono PCM).
     * @constructor
     * @param {PullAudioInputStreamCallback} callback - The custom audio input object,
     *        derived from PullAudioInputStreamCustomCallback
     * @param {AudioStreamFormat} format - The audio data format in which audio will be
     *        returned from the callback's read() method (Required if format is not 16 kHz 16bit mono PCM).
     */
    constructor(callback, format) {
        super();
        this.onEvent = (event) => {
            this.privEvents.onEvent(event);
            Events.instance.onEvent(event);
        };
        if (undefined === format) {
            this.privFormat = AudioStreamFormat.getDefaultInputFormat();
        }
        else {
            this.privFormat = format;
        }
        this.privEvents = new EventSource();
        this.privId = createNoDashGuid();
        this.privCallback = callback;
        this.privIsClosed = false;
        this.privBufferSize = this.privFormat.avgBytesPerSec / 10;
    }
    /**
     * Format information for the audio
     */
    get format() {
        return Promise.resolve(this.privFormat);
    }
    /**
     * Closes the stream.
     * @member PullAudioInputStreamImpl.prototype.close
     * @function
     * @public
     */
    close() {
        this.privIsClosed = true;
        this.privCallback.close();
    }
    id() {
        return this.privId;
    }
    get blob() {
        return Promise.reject("Not implemented");
    }
    turnOn() {
        this.onEvent(new AudioSourceInitializingEvent(this.privId)); // no stream id
        this.onEvent(new AudioSourceReadyEvent(this.privId));
        return;
    }
    async attach(audioNodeId) {
        this.onEvent(new AudioStreamNodeAttachingEvent(this.privId, audioNodeId));
        await this.turnOn();
        this.onEvent(new AudioStreamNodeAttachedEvent(this.privId, audioNodeId));
        return {
            detach: () => {
                this.privCallback.close();
                this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId));
                return this.turnOff();
            },
            id: () => {
                return audioNodeId;
            },
            read: () => {
                let totalBytes = 0;
                let transmitBuff;
                // Until we have the minimum number of bytes to send in a transmission, keep asking for more.
                while (totalBytes < this.privBufferSize) {
                    // Sizing the read buffer to the delta between the perfect size and what's left means we won't ever get too much
                    // data back.
                    const readBuff = new ArrayBuffer(this.privBufferSize - totalBytes);
                    const pulledBytes = this.privCallback.read(readBuff);
                    // If there is no return buffer yet defined, set the return buffer to the that was just populated.
                    // This was, if we have enough data there's no copy penalty, but if we don't we have a buffer that's the
                    // preferred size allocated.
                    if (undefined === transmitBuff) {
                        transmitBuff = readBuff;
                    }
                    else {
                        // Not the first bite at the apple, so fill the return buffer with the data we got back.
                        const intView = new Int8Array(transmitBuff);
                        intView.set(new Int8Array(readBuff), totalBytes);
                    }
                    // If there are no bytes to read, just break out and be done.
                    if (0 === pulledBytes) {
                        break;
                    }
                    totalBytes += pulledBytes;
                }
                return Promise.resolve({
                    buffer: transmitBuff.slice(0, totalBytes),
                    isEnd: this.privIsClosed || totalBytes === 0,
                    timeReceived: Date.now(),
                });
            },
        };
    }
    detach(audioNodeId) {
        this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId));
    }
    turnOff() {
        return;
    }
    get events() {
        return this.privEvents;
    }
    get deviceInfo() {
        return Promise.resolve({
            bitspersample: this.privFormat.bitsPerSample,
            channelcount: this.privFormat.channels,
            connectivity: connectivity.Unknown,
            manufacturer: "Speech SDK",
            model: "PullStream",
            samplerate: this.privFormat.samplesPerSec,
            type: type.Stream,
        });
    }
}

//# sourceMappingURL=AudioInputStream.js.map