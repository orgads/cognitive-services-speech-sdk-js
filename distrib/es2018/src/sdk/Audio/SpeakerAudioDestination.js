// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { SynthesisAdapterBase } from "../../common.speech/Exports";
import { BackgroundEvent, createNoDashGuid, Events } from "../../common/Exports";
import { AudioFormatTag } from "./AudioOutputFormat";
import { PullAudioOutputStreamImpl } from "./AudioOutputStream";
const MediaDurationPlaceholderSeconds = 60 * 30;
const AudioFormatToMimeType = {
    [AudioFormatTag.PCM]: "audio/wav",
    [AudioFormatTag.MP3]: "audio/mpeg",
    [AudioFormatTag.Opus]: "audio/ogg",
};
/**
 * Represents the speaker playback audio destination, which only works in browser.
 * Note: the SDK will try to use <a href="https://www.w3.org/TR/media-source/">Media Source Extensions</a> to play audio.
 * Mp3 format has better supports on Microsoft Edge, Chrome and Safari (desktop), so, it's better to specify mp3 format for playback.
 * @class SpeakerAudioDestination
 * Updated in version 1.12.1
 */
export class SpeakerAudioDestination {
    constructor(audioDestinationId) {
        this.privPlaybackStarted = false;
        this.privAppendingToBuffer = false;
        this.privMediaSourceOpened = false;
        this.privBytesReceived = 0;
        this.privId = audioDestinationId ? audioDestinationId : createNoDashGuid();
        this.privIsPaused = false;
        this.privIsClosed = false;
    }
    id() {
        return this.privId;
    }
    write(buffer, cb, err) {
        if (this.privAudioBuffer !== undefined) {
            this.privAudioBuffer.push(buffer);
            this.updateSourceBuffer().then(() => {
                if (!!cb) {
                    cb();
                }
            }, (error) => {
                if (!!err) {
                    err(error);
                }
            });
        }
        else if (this.privAudioOutputStream !== undefined) {
            this.privAudioOutputStream.write(buffer);
            this.privBytesReceived += buffer.byteLength;
        }
    }
    close(cb, err) {
        this.privIsClosed = true;
        if (this.privSourceBuffer !== undefined) {
            this.handleSourceBufferUpdateEnd().then(() => {
                if (!!cb) {
                    cb();
                }
            }, (error) => {
                if (!!err) {
                    err(error);
                }
            });
        }
        else if (this.privAudioOutputStream !== undefined) {
            let receivedAudio = new ArrayBuffer(this.privBytesReceived);
            this.privAudioOutputStream.read(receivedAudio).then((_) => {
                if (this.privFormat.hasHeader) {
                    receivedAudio = SynthesisAdapterBase.addHeader(receivedAudio, this.privFormat);
                }
                const audioBlob = new Blob([receivedAudio], { type: AudioFormatToMimeType[this.privFormat.formatTag] });
                this.privAudio.src = window.URL.createObjectURL(audioBlob);
                this.notifyPlayback().then(() => {
                    if (!!cb) {
                        cb();
                    }
                }, (error) => {
                    if (!!err) {
                        err(error);
                    }
                });
            }, (error) => {
                if (!!err) {
                    err(error);
                }
            });
        }
    }
    set format(format) {
        if (typeof (AudioContext) !== "undefined" || typeof (window.webkitAudioContext) !== "undefined") {
            this.privFormat = format;
            const mimeType = AudioFormatToMimeType[this.privFormat.formatTag];
            if (mimeType === undefined) {
                // tslint:disable-next-line:no-console
                console.warn(`Unknown mimeType for format ${AudioFormatTag[this.privFormat.formatTag]}.`);
            }
            else if (typeof (MediaSource) !== "undefined" && MediaSource.isTypeSupported(mimeType)) {
                this.privAudio = new Audio();
                this.privAudioBuffer = [];
                this.privMediaSource = new MediaSource();
                this.privAudio.src = URL.createObjectURL(this.privMediaSource);
                this.privAudio.load();
                this.privMediaSource.onsourceopen = (event) => {
                    this.privMediaSourceOpened = true;
                    this.privMediaSource.duration = MediaDurationPlaceholderSeconds;
                    this.privSourceBuffer = this.privMediaSource.addSourceBuffer(mimeType);
                    this.privSourceBuffer.onupdate = (_) => {
                        this.updateSourceBuffer().catch((reason) => {
                            Events.instance.onEvent(new BackgroundEvent(reason));
                        });
                    };
                    this.privSourceBuffer.onupdateend = (_) => {
                        this.handleSourceBufferUpdateEnd().catch((reason) => {
                            Events.instance.onEvent(new BackgroundEvent(reason));
                        });
                    };
                    this.privSourceBuffer.onupdatestart = (_) => {
                        this.privAppendingToBuffer = false;
                    };
                };
                this.updateSourceBuffer().catch((reason) => {
                    Events.instance.onEvent(new BackgroundEvent(reason));
                });
            }
            else {
                // tslint:disable-next-line:no-console
                console.warn(`Format ${AudioFormatTag[this.privFormat.formatTag]} could not be played by MSE, streaming playback is not enabled.`);
                this.privAudioOutputStream = new PullAudioOutputStreamImpl();
                this.privAudioOutputStream.format = this.privFormat;
                this.privAudio = new Audio();
            }
        }
    }
    get isClosed() {
        return this.privIsClosed;
    }
    get currentTime() {
        if (this.privAudio !== undefined) {
            return this.privAudio.currentTime;
        }
        return -1;
    }
    pause() {
        if (!this.privIsPaused && this.privAudio !== undefined) {
            this.privAudio.pause();
            this.privIsPaused = true;
        }
    }
    resume(cb, err) {
        if (this.privIsPaused && this.privAudio !== undefined) {
            this.privAudio.play().then(() => {
                if (!!cb) {
                    cb();
                }
            }, (error) => {
                if (!!err) {
                    err(error);
                }
            });
            this.privIsPaused = false;
        }
    }
    get internalAudio() {
        return this.privAudio;
    }
    async updateSourceBuffer() {
        if (this.privAudioBuffer !== undefined && (this.privAudioBuffer.length > 0) && this.sourceBufferAvailable()) {
            this.privAppendingToBuffer = true;
            const binary = this.privAudioBuffer.shift();
            try {
                this.privSourceBuffer.appendBuffer(binary);
            }
            catch (error) {
                this.privAudioBuffer.unshift(binary);
                // tslint:disable-next-line:no-console
                console.log("buffer filled, pausing addition of binaries until space is made");
                return;
            }
            await this.notifyPlayback();
        }
        else if (this.canEndStream()) {
            await this.handleSourceBufferUpdateEnd();
        }
    }
    async handleSourceBufferUpdateEnd() {
        if (this.canEndStream() && this.sourceBufferAvailable()) {
            this.privMediaSource.endOfStream();
            await this.notifyPlayback();
        }
    }
    async notifyPlayback() {
        if (!this.privPlaybackStarted && this.privAudio !== undefined) {
            this.privAudio.onended = () => {
                if (!!this.onAudioEnd) {
                    this.onAudioEnd(this);
                }
            };
            if (!this.privIsPaused) {
                await this.privAudio.play();
            }
            this.privPlaybackStarted = true;
        }
    }
    canEndStream() {
        return (this.isClosed && this.privSourceBuffer !== undefined && (this.privAudioBuffer.length === 0)
            && this.privMediaSourceOpened && !this.privAppendingToBuffer && this.privMediaSource.readyState === "open");
    }
    sourceBufferAvailable() {
        return (this.privSourceBuffer !== undefined && !this.privSourceBuffer.updating);
    }
}

//# sourceMappingURL=SpeakerAudioDestination.js.map