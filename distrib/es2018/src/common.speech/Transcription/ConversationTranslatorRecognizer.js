// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { RecognizerConfig } from "../../common.speech/Exports";
import { BackgroundEvent, Events } from "../../common/Exports";
import { Contracts } from "../../sdk/Contracts";
import { Connection, Recognizer } from "../../sdk/Exports";
import { ConversationConnectionFactory } from "./ConversationConnectionFactory";
import { ConversationServiceAdapter } from "./ConversationServiceAdapter";
import { PromiseToEmptyCallback } from "./ConversationUtils";
export class ConversationRecognizerFactory {
    static fromConfig(speechConfig, audioConfig) {
        return new ConversationTranslatorRecognizer(speechConfig, audioConfig);
    }
}
/**
 * Sends messages to the Conversation Translator websocket and listens for incoming events containing websocket messages.
 * Based off the recognizers in the SDK folder.
 */
// tslint:disable-next-line:max-classes-per-file
export class ConversationTranslatorRecognizer extends Recognizer {
    constructor(speechConfig, audioConfig) {
        const serviceConfigImpl = speechConfig;
        Contracts.throwIfNull(serviceConfigImpl, "speechConfig");
        super(audioConfig, serviceConfigImpl.properties, new ConversationConnectionFactory());
        this.privIsDisposed = false;
        this.privProperties = serviceConfigImpl.properties.clone();
        this.privConnection = Connection.fromRecognizer(this);
    }
    set connected(cb) {
        this.privConnection.connected = cb;
    }
    set disconnected(cb) {
        this.privConnection.disconnected = cb;
    }
    /**
     * Return the speech language used by the recognizer
     */
    get speechRecognitionLanguage() {
        return this.privSpeechRecognitionLanguage;
    }
    /**
     * Return the properties for the recognizer
     */
    get properties() {
        return this.privProperties;
    }
    isDisposed() {
        return this.privIsDisposed;
    }
    /**
     * Connect to the recognizer
     * @param token
     */
    connect(token, cb, err) {
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            Contracts.throwIfNullOrWhitespace(token, "token");
            this.privReco.conversationTranslatorToken = token;
            this.privReco.connectAsync(cb, err);
        }
        catch (error) {
            if (!!err) {
                if (error instanceof Error) {
                    const typedError = error;
                    err(typedError.name + ": " + typedError.message);
                }
                else {
                    err(error);
                }
            }
        }
    }
    /**
     * Disconnect from the recognizer
     */
    disconnect(cb, err) {
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            this.privReco.disconnect().then(() => {
                if (!!cb) {
                    cb();
                }
            }, (error) => {
                if (!!err) {
                    err(error);
                }
            });
        }
        catch (error) {
            if (!!err) {
                if (error instanceof Error) {
                    const typedError = error;
                    err(typedError.name + ": " + typedError.message);
                }
                else {
                    err(error);
                }
            }
            // Destroy the recognizer.
            this.dispose(true).catch((reason) => {
                Events.instance.onEvent(new BackgroundEvent(reason));
            });
        }
    }
    /**
     * Send the mute all participants command to the websocket
     * @param conversationId
     * @param participantId
     * @param isMuted
     */
    sendRequest(command, cb, err) {
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            this.sendMessage(command, cb, err);
        }
        catch (error) {
            if (!!err) {
                if (error instanceof Error) {
                    const typedError = error;
                    err(typedError.name + ": " + typedError.message);
                }
                else {
                    err(error);
                }
            }
            // Destroy the recognizer.
            this.dispose(true).catch((reason) => {
                Events.instance.onEvent(new BackgroundEvent(reason));
            });
        }
    }
    /**
     * Close and dispose the recognizer
     */
    async close() {
        var _a, _b;
        Contracts.throwIfDisposed(this.privIsDisposed);
        (_a = this.privConnection) === null || _a === void 0 ? void 0 : _a.closeConnection();
        (_b = this.privConnection) === null || _b === void 0 ? void 0 : _b.close();
        this.privConnection = undefined;
        await this.dispose(true);
    }
    /**
     * Dispose the recognizer
     * @param disposing
     */
    async dispose(disposing) {
        if (this.privIsDisposed) {
            return;
        }
        if (disposing) {
            this.privIsDisposed = true;
            if (!!this.privConnection) {
                this.privConnection.closeConnection();
                this.privConnection.close();
                this.privConnection = undefined;
            }
            await super.dispose(disposing);
        }
    }
    /**
     * Create the config for the recognizer
     * @param speechConfig
     */
    createRecognizerConfig(speechConfig) {
        return new RecognizerConfig(speechConfig, this.privProperties);
    }
    /**
     * Create the service recognizer.
     * The audio source is redundnant here but is required by the implementation.
     * @param authentication
     * @param connectionFactory
     * @param audioConfig
     * @param recognizerConfig
     */
    createServiceRecognizer(authentication, connectionFactory, audioConfig, recognizerConfig) {
        const audioSource = audioConfig;
        return new ConversationServiceAdapter(authentication, connectionFactory, audioSource, recognizerConfig, this);
    }
    sendMessage(msg, cb, err) {
        const withAsync = this.privReco;
        PromiseToEmptyCallback(withAsync.sendMessageAsync(msg), cb, err);
    }
}

//# sourceMappingURL=ConversationTranslatorRecognizer.js.map