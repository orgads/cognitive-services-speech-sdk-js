import { ConnectionMessage, IAudioSource, IConnection } from "../../common/Exports";
import { CancellationErrorCode, CancellationReason } from "../../sdk/Exports";
import { IAuthentication, IConnectionFactory, RecognizerConfig, ServiceRecognizerBase } from "../Exports";
import { ConversationTranslatorRecognizer } from "./ConversationTranslatorRecognizer";
/***
 * The service adapter handles sending and receiving messages to the Conversation Translator websocket.
 */
export declare class ConversationServiceAdapter extends ServiceRecognizerBase {
    private privConversationServiceConnector;
    private privConversationConnectionFactory;
    private privConversationAuthFetchEventId;
    private privConversationAuthentication;
    private privConversationRequestSession;
    private privConnectionConfigPromise;
    private privConnectionLoop;
    private terminateMessageLoop;
    private privLastPartialUtteranceId;
    private privConversationIsDisposed;
    constructor(authentication: IAuthentication, connectionFactory: IConnectionFactory, audioSource: IAudioSource, recognizerConfig: RecognizerConfig, conversationServiceConnector: ConversationTranslatorRecognizer);
    isDisposed(): boolean;
    dispose(reason?: string): Promise<void>;
    sendMessage(message: string): Promise<void>;
    sendMessageAsync(message: string): Promise<void>;
    protected privDisconnect(): Promise<void>;
    protected processTypeSpecificMessages(connectionMessage: ConnectionMessage, successCallback?: (e: any) => void, errorCallBack?: (e: string) => void): Promise<boolean>;
    protected cancelRecognition(sessionId: string, requestId: string, cancellationReason: CancellationReason, errorCode: CancellationErrorCode, error: string): void;
    protected noOp: () => any;
    /**
     * Establishes a websocket connection to the end point.
     * @param isUnAuthorized
     */
    protected conversationConnectImpl(connection: Promise<IConnection>): Promise<IConnection>;
    /**
     * Process incoming websocket messages
     */
    private receiveConversationMessageOverride;
    private startMessageLoop;
    private configConnection;
    private getTranslations;
}