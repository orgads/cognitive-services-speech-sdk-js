// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { connectivity, type, } from "../common.speech/Exports";
import { AudioSourceErrorEvent, AudioSourceInitializingEvent, AudioSourceOffEvent, AudioSourceReadyEvent, AudioStreamNodeAttachedEvent, AudioStreamNodeAttachingEvent, AudioStreamNodeDetachedEvent, AudioStreamNodeErrorEvent, ChunkedArrayBufferStream, createNoDashGuid, Deferred, Events, EventSource, } from "../common/Exports";
import { AudioStreamFormat } from "../sdk/Audio/AudioStreamFormat";
export class FileAudioSource {
    constructor(file, audioSourceId) {
        this.privStreams = {};
        this.privHeaderEnd = 44;
        this.turnOn = () => {
            if (typeof FileReader === "undefined") {
                const errorMsg = "Browser does not support FileReader.";
                this.onEvent(new AudioSourceErrorEvent(errorMsg, "")); // initialization error - no streamid at this point
                return Promise.reject(errorMsg);
            }
            else if (this.privFile.name.lastIndexOf(".wav") !== this.privFile.name.length - 4) {
                const errorMsg = this.privFile.name + " is not supported. Only WAVE files are allowed at the moment.";
                this.onEvent(new AudioSourceErrorEvent(errorMsg, ""));
                return Promise.reject(errorMsg);
            }
            this.onEvent(new AudioSourceInitializingEvent(this.privId)); // no stream id
            this.onEvent(new AudioSourceReadyEvent(this.privId));
            return;
        };
        this.id = () => {
            return this.privId;
        };
        this.attach = async (audioNodeId) => {
            this.onEvent(new AudioStreamNodeAttachingEvent(this.privId, audioNodeId));
            const stream = await this.upload(audioNodeId);
            this.onEvent(new AudioStreamNodeAttachedEvent(this.privId, audioNodeId));
            return Promise.resolve({
                detach: async () => {
                    stream.readEnded();
                    delete this.privStreams[audioNodeId];
                    this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId));
                    await this.turnOff();
                },
                id: () => {
                    return audioNodeId;
                },
                read: () => {
                    return stream.read();
                },
            });
        };
        this.detach = (audioNodeId) => {
            if (audioNodeId && this.privStreams[audioNodeId]) {
                this.privStreams[audioNodeId].close();
                delete this.privStreams[audioNodeId];
                this.onEvent(new AudioStreamNodeDetachedEvent(this.privId, audioNodeId));
            }
        };
        this.turnOff = () => {
            for (const streamId in this.privStreams) {
                if (streamId) {
                    const stream = this.privStreams[streamId];
                    if (stream && !stream.isClosed) {
                        stream.close();
                    }
                }
            }
            this.onEvent(new AudioSourceOffEvent(this.privId)); // no stream now
            return Promise.resolve();
        };
        this.onEvent = (event) => {
            this.privEvents.onEvent(event);
            Events.instance.onEvent(event);
        };
        this.privId = audioSourceId ? audioSourceId : createNoDashGuid();
        this.privEvents = new EventSource();
        this.privFile = file;
        // Read the header.
        this.privAudioFormatPromise = this.readHeader();
    }
    get format() {
        return this.privAudioFormatPromise;
    }
    get blob() {
        return Promise.resolve(this.privFile);
    }
    get events() {
        return this.privEvents;
    }
    get deviceInfo() {
        return this.privAudioFormatPromise.then((result) => {
            return Promise.resolve({
                bitspersample: result.bitsPerSample,
                channelcount: result.channels,
                connectivity: connectivity.Unknown,
                manufacturer: "Speech SDK",
                model: "File",
                samplerate: result.samplesPerSec,
                type: type.File,
            });
        });
    }
    readHeader() {
        // Read the wave header.
        const maxHeaderSize = 128;
        const header = this.privFile.slice(0, maxHeaderSize);
        const headerReader = new FileReader();
        const headerResult = new Deferred();
        const processHeader = (event) => {
            const header = event.target.result;
            const view = new DataView(header);
            const getWord = (index) => {
                return String.fromCharCode(view.getUint8(index), view.getUint8(index + 1), view.getUint8(index + 2), view.getUint8(index + 3));
            };
            // RIFF 4 bytes.
            if ("RIFF" !== getWord(0)) {
                headerResult.reject("Invalid WAV header in file, RIFF was not found");
            }
            // length, 4 bytes
            // RIFF Type & fmt 8 bytes
            if ("WAVE" !== getWord(8) || "fmt " !== getWord(12)) {
                headerResult.reject("Invalid WAV header in file, WAVEfmt was not found");
            }
            const formatSize = view.getInt32(16, true);
            const channelCount = view.getUint16(22, true);
            const sampleRate = view.getUint32(24, true);
            const bitsPerSample = view.getUint16(34, true);
            // Confirm if header is 44 bytes long.
            let pos = 36 + Math.max(formatSize - 16, 0);
            for (; getWord(pos) !== "data"; pos += 2) {
                if (pos > maxHeaderSize - 8) {
                    headerResult.reject("Invalid WAV header in file, data block was not found");
                }
            }
            this.privHeaderEnd = pos + 8;
            headerResult.resolve(AudioStreamFormat.getWaveFormatPCM(sampleRate, bitsPerSample, channelCount));
        };
        headerReader.onload = processHeader;
        headerReader.readAsArrayBuffer(header);
        return headerResult.promise;
    }
    async upload(audioNodeId) {
        await this.turnOn();
        const format = await this.privAudioFormatPromise;
        const reader = new FileReader();
        const stream = new ChunkedArrayBufferStream(format.avgBytesPerSec / 10, audioNodeId);
        this.privStreams[audioNodeId] = stream;
        const processFile = (event) => {
            if (stream.isClosed) {
                return; // output stream was closed (somebody called TurnOff). We're done here.
            }
            stream.writeStreamChunk({
                buffer: reader.result,
                isEnd: false,
                timeReceived: Date.now(),
            });
            stream.close();
        };
        reader.onload = processFile;
        reader.onerror = (event) => {
            const errorMsg = `Error occurred while processing '${this.privFile.name}'. ${event}`;
            this.onEvent(new AudioStreamNodeErrorEvent(this.privId, audioNodeId, errorMsg));
            throw new Error(errorMsg);
        };
        const chunk = this.privFile.slice(this.privHeaderEnd);
        reader.readAsArrayBuffer(chunk);
        return stream;
    }
}

//# sourceMappingURL=FileAudioSource.js.map