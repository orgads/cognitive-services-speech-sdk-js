import { IAudioDestination } from "../common/Exports";
import { AudioOutputFormatImpl } from "../sdk/Audio/AudioOutputFormat";
import { SpeechSynthesisEvent } from "./SynthesisEvents";
export interface ISynthesisResponseContext {
    serviceTag: string;
}
export interface ISynthesisResponseAudio {
    type: string;
    streamId: string;
}
export interface ISynthesisResponse {
    context: ISynthesisResponseContext;
    audio: ISynthesisResponseAudio;
}
export declare class SynthesisTurn {
    get requestId(): string;
    get streamId(): string;
    set streamId(value: string);
    get audioOutputFormat(): AudioOutputFormatImpl;
    set audioOutputFormat(format: AudioOutputFormatImpl);
    get turnCompletionPromise(): Promise<void>;
    get isSynthesisEnded(): boolean;
    get isSynthesizing(): boolean;
    get currentTextOffset(): number;
    get bytesReceived(): number;
    private privIsDisposed;
    private privAuthFetchEventId;
    private privIsSynthesizing;
    private privIsSynthesisEnded;
    private privBytesReceived;
    private privRequestId;
    private privStreamId;
    private privTurnDeferral;
    private privInTurn;
    private privAudioOutputFormat;
    private privAudioOutputStream;
    private privReceivedAudio;
    private privReceivedAudioWithHeader;
    private privTextOffset;
    private privNextSearchTextIndex;
    private privRawText;
    private privIsSSML;
    private privTurnAudioDestination;
    constructor();
    getAllReceivedAudio(): Promise<ArrayBuffer>;
    getAllReceivedAudioWithHeader(): Promise<ArrayBuffer>;
    startNewSynthesis(requestId: string, rawText: string, isSSML: boolean, audioDestination?: IAudioDestination): void;
    onPreConnectionStart: (authFetchEventId: string, connectionId: string) => void;
    onAuthCompleted: (isError: boolean, error?: string) => void;
    onConnectionEstablishCompleted: (statusCode: number, reason?: string) => void;
    onServiceResponseMessage: (responseJson: string) => void;
    onServiceTurnEndResponse: () => void;
    onServiceTurnStartResponse: () => void;
    onAudioChunkReceived(data: ArrayBuffer): void;
    onWordBoundaryEvent(text: string): void;
    dispose: (error?: string) => void;
    onStopSynthesizing(): void;
    protected onEvent: (event: SpeechSynthesisEvent) => void;
    private updateTextOffset;
    private onComplete;
    private readAllAudioFromStream;
}