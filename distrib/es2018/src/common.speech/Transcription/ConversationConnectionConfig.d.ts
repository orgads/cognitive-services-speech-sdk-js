import { RestConfigBase } from "../../common.browser/RestConfigBase";
export declare class ConversationConnectionConfig extends RestConfigBase {
    private static readonly privHost;
    private static readonly privRestPath;
    private static readonly privApiVersion;
    private static readonly privDefaultLanguageCode;
    private static readonly privClientAppId;
    private static readonly privWebSocketPath;
    private static readonly privSpeechHost;
    private static readonly privSpeechPath;
    private static readonly privTranscriptionEventKeys;
    static get host(): string;
    static get apiVersion(): string;
    static get clientAppId(): string;
    static get defaultLanguageCode(): string;
    static get restPath(): string;
    static get webSocketPath(): string;
    static get speechHost(): string;
    static get speechPath(): string;
    static get transcriptionEventKeys(): string[];
}