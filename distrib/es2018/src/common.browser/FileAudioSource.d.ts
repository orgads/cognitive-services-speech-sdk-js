/// <reference types="node" />
import { ISpeechConfigAudioDevice } from "../common.speech/Exports";
import { AudioSourceEvent, EventSource, IAudioSource, IAudioStreamNode } from "../common/Exports";
import { AudioStreamFormatImpl } from "../sdk/Audio/AudioStreamFormat";
export declare class FileAudioSource implements IAudioSource {
    private privAudioFormatPromise;
    private privStreams;
    private privId;
    private privEvents;
    private privFile;
    private privHeaderEnd;
    constructor(file: File, audioSourceId?: string);
    get format(): Promise<AudioStreamFormatImpl>;
    get blob(): Promise<Blob | Buffer>;
    turnOn: () => Promise<void>;
    id: () => string;
    attach: (audioNodeId: string) => Promise<IAudioStreamNode>;
    detach: (audioNodeId: string) => void;
    turnOff: () => Promise<void>;
    get events(): EventSource<AudioSourceEvent>;
    get deviceInfo(): Promise<ISpeechConfigAudioDevice>;
    private readHeader;
    private upload;
    private onEvent;
}