import { IAudioSource, IConnection } from "../common/Exports";
import { CancellationErrorCode, CancellationReason } from "../sdk/Exports";
import { ConversationInfo } from "../sdk/Transcription/Exports";
import { ServiceRecognizerBase, TranscriberRecognizer } from "./Exports";
import { IAuthentication } from "./IAuthentication";
import { IConnectionFactory } from "./IConnectionFactory";
import { RecognizerConfig } from "./RecognizerConfig";
import { SpeechConnectionMessage } from "./SpeechConnectionMessage.Internal";
export declare class TranscriptionServiceRecognizer extends ServiceRecognizerBase {
    private privTranscriberRecognizer;
    constructor(authentication: IAuthentication, connectionFactory: IConnectionFactory, audioSource: IAudioSource, recognizerConfig: RecognizerConfig, transcriber: TranscriberRecognizer);
    sendSpeechEventAsync(info: ConversationInfo, command: string): Promise<void>;
    protected processTypeSpecificMessages(connectionMessage: SpeechConnectionMessage): Promise<boolean>;
    protected cancelRecognition(sessionId: string, requestId: string, cancellationReason: CancellationReason, errorCode: CancellationErrorCode, error: string): void;
    protected sendTranscriptionStartJSON(connection: IConnection): Promise<void>;
    protected sendSpeechEvent: (connection: IConnection, payload: {
        [id: string]: any;
    }) => Promise<void>;
    private createSpeechEventPayload;
}