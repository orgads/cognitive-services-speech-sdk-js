import { IDisposable } from "../../common/Exports";
import { AudioConfig, PropertyCollection, SessionEventArgs } from "../Exports";
import { ConversationCommon, ConversationExpirationEventArgs, ConversationHandler, ConversationParticipantsChangedEventArgs, ConversationTranslationCanceledEventArgs, ConversationTranslationEventArgs, IConversationTranslator, Participant } from "./Exports";
import { Callback, IConversation } from "./IConversation";
export declare enum SpeechState {
    Inactive = 0,
    Connecting = 1,
    Connected = 2
}
/***
 * Join, leave or connect to a conversation.
 */
export declare class ConversationTranslator extends ConversationCommon implements IConversationTranslator, IDisposable {
    private privSpeechRecognitionLanguage;
    private privProperties;
    private privTranslationRecognizerConnection;
    private privIsDisposed;
    private privTranslationRecognizer;
    private privIsSpeaking;
    private privConversation;
    private privSpeechState;
    private privErrors;
    private privPlaceholderKey;
    private privPlaceholderRegion;
    constructor(audioConfig?: AudioConfig);
    get properties(): PropertyCollection;
    get speechRecognitionLanguage(): string;
    get participants(): Participant[];
    canceled: (sender: ConversationHandler, event: ConversationTranslationCanceledEventArgs) => void;
    conversationExpiration: (sender: IConversationTranslator, event: ConversationExpirationEventArgs) => void;
    participantsChanged: (sender: IConversationTranslator, event: ConversationParticipantsChangedEventArgs) => void;
    sessionStarted: (sender: ConversationHandler, event: SessionEventArgs) => void;
    sessionStopped: (sender: ConversationHandler, event: SessionEventArgs) => void;
    textMessageReceived: (sender: IConversationTranslator, event: ConversationTranslationEventArgs) => void;
    transcribed: (sender: IConversationTranslator, event: ConversationTranslationEventArgs) => void;
    transcribing: (sender: IConversationTranslator, event: ConversationTranslationEventArgs) => void;
    /**
     * Join a conversation. If this is the host, pass in the previously created Conversation object.
     * @param conversation
     * @param nickname
     * @param lang
     * @param cb
     * @param err
     */
    joinConversationAsync(conversation: IConversation, nickname: string, cb?: Callback, err?: Callback): void;
    joinConversationAsync(conversationId: string, nickname: string, lang: string, cb?: Callback, err?: Callback): void;
    /**
     * Leave the conversation
     * @param cb
     * @param err
     */
    leaveConversationAsync(cb?: Callback, err?: Callback): void;
    /**
     * Send a text message
     * @param message
     * @param cb
     * @param err
     */
    sendTextMessageAsync(message: string, cb?: Callback, err?: Callback): void;
    /**
     * Start speaking
     * @param cb
     * @param err
     */
    startTranscribingAsync(cb?: Callback, err?: Callback): void;
    /**
     * Stop speaking
     * @param cb
     * @param err
     */
    stopTranscribingAsync(cb?: Callback, err?: Callback): void;
    isDisposed(): boolean;
    dispose(reason?: string, success?: () => void, err?: (error: string) => void): void;
    /**
     * Cancel the speech websocket
     */
    private cancelSpeech;
    /**
     * Connect to the speech translation recognizer.
     * Currently there is no language validation performed before sending the SpeechLanguage code to the service.
     * If it's an invalid language the raw error will be: 'Error during WebSocket handshake: Unexpected response code: 400'
     * e.g. pass in 'fr' instead of 'fr-FR', or a text-only language 'cy'
     * @param cb
     * @param err
     */
    private connectTranslatorRecognizer;
    /**
     * Handle the start speaking request
     * @param cb
     * @param err
     */
    private startContinuousRecognition;
    /** Recognizer callbacks */
    private onSpeechConnected;
    private onSpeechDisconnected;
    private onSpeechRecognized;
    private onSpeechRecognizing;
    private onSpeechCanceled;
    private onSpeechSessionStarted;
    private onSpeechSessionStopped;
    /**
     * Fire a cancel event
     * @param error
     */
    private fireCancelEvent;
    private get canSpeak();
}