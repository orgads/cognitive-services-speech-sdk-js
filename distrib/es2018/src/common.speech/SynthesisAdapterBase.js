// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { ArgumentNullError, ConnectionState, createNoDashGuid, EventSource, MessageType, ServiceEvent, } from "../common/Exports";
import { CancellationErrorCode, CancellationReason, PropertyCollection, PropertyId, ResultReason, SpeechSynthesisEventArgs, SpeechSynthesisResult, SpeechSynthesisWordBoundaryEventArgs, } from "../sdk/Exports";
import { AgentConfig, CancellationErrorCodePropertyName, SynthesisAudioMetadata, SynthesisContext, SynthesisTurn } from "./Exports";
import { SpeechConnectionMessage } from "./SpeechConnectionMessage.Internal";
export class SynthesisAdapterBase {
    constructor(authentication, connectionFactory, synthesizerConfig, speechSynthesizer, audioDestination) {
        this.speakOverride = undefined;
        this.receiveMessageOverride = undefined;
        this.connectImplOverride = undefined;
        this.configConnectionOverride = undefined;
        this.sendSynthesisContext = (connection) => {
            const synthesisContextJson = this.synthesisContext.toJSON();
            if (synthesisContextJson) {
                return connection.send(new SpeechConnectionMessage(MessageType.Text, "synthesis.context", this.privSynthesisTurn.requestId, "application/json", synthesisContextJson));
            }
            return;
        };
        this.sendSpeechServiceConfig = (connection, SpeechServiceConfigJson) => {
            if (SpeechServiceConfigJson) {
                return connection.send(new SpeechConnectionMessage(MessageType.Text, "speech.config", this.privSynthesisTurn.requestId, "application/json", SpeechServiceConfigJson));
            }
        };
        this.sendSsmlMessage = (connection, ssml, requestId) => {
            return connection.send(new SpeechConnectionMessage(MessageType.Text, "ssml", requestId, "application/ssml+xml", ssml));
        };
        if (!authentication) {
            throw new ArgumentNullError("authentication");
        }
        if (!connectionFactory) {
            throw new ArgumentNullError("connectionFactory");
        }
        if (!synthesizerConfig) {
            throw new ArgumentNullError("synthesizerConfig");
        }
        this.privAuthentication = authentication;
        this.privConnectionFactory = connectionFactory;
        this.privSynthesizerConfig = synthesizerConfig;
        this.privIsDisposed = false;
        this.privSpeechSynthesizer = speechSynthesizer;
        this.privSessionAudioDestination = audioDestination;
        this.privSynthesisTurn = new SynthesisTurn();
        this.privConnectionEvents = new EventSource();
        this.privServiceEvents = new EventSource();
        this.privSynthesisContext = new SynthesisContext(this.privSpeechSynthesizer);
        this.privAgentConfig = new AgentConfig();
        this.connectionEvents.attach((connectionEvent) => {
            if (connectionEvent.name === "ConnectionClosedEvent") {
                const connectionClosedEvent = connectionEvent;
                if (connectionClosedEvent.statusCode !== 1000) {
                    this.cancelSynthesisLocal(CancellationReason.Error, connectionClosedEvent.statusCode === 1007 ? CancellationErrorCode.BadRequestParameters : CancellationErrorCode.ConnectionFailure, connectionClosedEvent.reason + " websocket error code: " + connectionClosedEvent.statusCode);
                }
            }
        });
    }
    get synthesisContext() {
        return this.privSynthesisContext;
    }
    get agentConfig() {
        return this.privAgentConfig;
    }
    get connectionEvents() {
        return this.privConnectionEvents;
    }
    get serviceEvents() {
        return this.privServiceEvents;
    }
    set activityTemplate(messagePayload) { this.privActivityTemplate = messagePayload; }
    get activityTemplate() { return this.privActivityTemplate; }
    set audioOutputFormat(format) {
        this.privAudioOutputFormat = format;
        this.privSynthesisTurn.audioOutputFormat = format;
        if (this.privSessionAudioDestination !== undefined) {
            this.privSessionAudioDestination.format = format;
        }
        if (this.synthesisContext !== undefined) {
            this.synthesisContext.audioOutputFormat = format;
        }
    }
    static addHeader(audio, format) {
        if (!format.hasHeader) {
            return audio;
        }
        format.updateHeader(audio.byteLength);
        const tmp = new Uint8Array(audio.byteLength + format.header.byteLength);
        tmp.set(new Uint8Array(format.header), 0);
        tmp.set(new Uint8Array(audio), format.header.byteLength);
        return tmp.buffer;
    }
    isDisposed() {
        return this.privIsDisposed;
    }
    async dispose(reason) {
        this.privIsDisposed = true;
        if (this.privSessionAudioDestination !== undefined) {
            this.privSessionAudioDestination.close();
        }
        if (this.privConnectionConfigurationPromise) {
            const connection = await this.privConnectionConfigurationPromise;
            await connection.dispose(reason);
        }
    }
    async connect() {
        await this.connectImpl();
    }
    async sendNetworkMessage(path, payload) {
        const type = typeof payload === "string" ? MessageType.Text : MessageType.Binary;
        const contentType = typeof payload === "string" ? "application/json" : "";
        const connection = await this.fetchConnection();
        return connection.send(new SpeechConnectionMessage(type, path, this.privSynthesisTurn.requestId, contentType, payload));
    }
    async Speak(text, isSSML, requestId, successCallback, errorCallBack, audioDestination) {
        let ssml;
        if (isSSML) {
            ssml = text;
        }
        else {
            ssml = this.privSpeechSynthesizer.buildSsml(text);
        }
        if (this.speakOverride !== undefined) {
            return this.speakOverride(ssml, requestId, successCallback, errorCallBack);
        }
        this.privSuccessCallback = successCallback;
        this.privErrorCallback = errorCallBack;
        this.privSynthesisTurn.startNewSynthesis(requestId, text, isSSML, audioDestination);
        try {
            await this.connectImpl();
            const connection = await this.fetchConnection();
            await this.sendSynthesisContext(connection);
            await this.sendSsmlMessage(connection, ssml, requestId);
            const synthesisStartEventArgs = new SpeechSynthesisEventArgs(new SpeechSynthesisResult(requestId, ResultReason.SynthesizingAudioStarted));
            if (!!this.privSpeechSynthesizer.synthesisStarted) {
                this.privSpeechSynthesizer.synthesisStarted(this.privSpeechSynthesizer, synthesisStartEventArgs);
            }
            const messageRetrievalPromise = this.receiveMessage();
        }
        catch (e) {
            this.cancelSynthesisLocal(CancellationReason.Error, CancellationErrorCode.ConnectionFailure, e);
            return Promise.reject(e);
        }
    }
    // Cancels synthesis.
    cancelSynthesis(requestId, cancellationReason, errorCode, error) {
        const properties = new PropertyCollection();
        properties.setProperty(CancellationErrorCodePropertyName, CancellationErrorCode[errorCode]);
        const result = new SpeechSynthesisResult(requestId, ResultReason.Canceled, undefined, error, properties);
        if (!!this.privSpeechSynthesizer.SynthesisCanceled) {
            const cancelEvent = new SpeechSynthesisEventArgs(result);
            try {
                this.privSpeechSynthesizer.SynthesisCanceled(this.privSpeechSynthesizer, cancelEvent);
                /* tslint:disable:no-empty */
            }
            catch (_a) { }
        }
        if (!!this.privSuccessCallback) {
            try {
                this.privSuccessCallback(result);
                /* tslint:disable:no-empty */
            }
            catch (_b) { }
        }
    }
    // Cancels synthesis.
    cancelSynthesisLocal(cancellationReason, errorCode, error) {
        if (!!this.privSynthesisTurn.isSynthesizing) {
            this.privSynthesisTurn.onStopSynthesizing();
            this.cancelSynthesis(this.privSynthesisTurn.requestId, cancellationReason, errorCode, error);
        }
    }
    processTypeSpecificMessages(connectionMessage, successCallback, errorCallBack) {
        return true;
    }
    async receiveMessage() {
        try {
            const connection = await this.fetchConnection();
            const message = await connection.read();
            if (this.receiveMessageOverride !== undefined) {
                return this.receiveMessageOverride();
            }
            if (this.privIsDisposed) {
                // We're done.
                return;
            }
            // indicates we are draining the queue and it came with no message;
            if (!message) {
                if (!this.privSynthesisTurn.isSynthesizing) {
                    return;
                }
                else {
                    return this.receiveMessage();
                }
            }
            this.privServiceHasSentMessage = true;
            const connectionMessage = SpeechConnectionMessage.fromConnectionMessage(message);
            if (connectionMessage.requestId.toLowerCase() === this.privSynthesisTurn.requestId.toLowerCase()) {
                switch (connectionMessage.path.toLowerCase()) {
                    case "turn.start":
                        this.privSynthesisTurn.onServiceTurnStartResponse();
                        break;
                    case "response":
                        this.privSynthesisTurn.onServiceResponseMessage(connectionMessage.textBody);
                        break;
                    case "audio":
                        if (this.privSynthesisTurn.streamId.toLowerCase() === connectionMessage.streamId.toLowerCase()
                            && !!connectionMessage.binaryBody) {
                            this.privSynthesisTurn.onAudioChunkReceived(connectionMessage.binaryBody);
                            if (!!this.privSpeechSynthesizer.synthesizing) {
                                try {
                                    const audioWithHeader = SynthesisAdapterBase.addHeader(connectionMessage.binaryBody, this.privSynthesisTurn.audioOutputFormat);
                                    const ev = new SpeechSynthesisEventArgs(new SpeechSynthesisResult(this.privSynthesisTurn.requestId, ResultReason.SynthesizingAudio, audioWithHeader));
                                    this.privSpeechSynthesizer.synthesizing(this.privSpeechSynthesizer, ev);
                                }
                                catch (error) {
                                    // Not going to let errors in the event handler
                                    // trip things up.
                                }
                            }
                            if (this.privSessionAudioDestination !== undefined) {
                                this.privSessionAudioDestination.write(connectionMessage.binaryBody);
                            }
                        }
                        break;
                    case "audio.metadata":
                        const metadataList = SynthesisAudioMetadata.fromJSON(connectionMessage.textBody).Metadata;
                        for (const metadata of metadataList) {
                            if (metadata.Type.toLowerCase() === "WordBoundary".toLowerCase()) {
                                this.privSynthesisTurn.onWordBoundaryEvent(metadata.Data.text.Text);
                                const ev = new SpeechSynthesisWordBoundaryEventArgs(metadata.Data.Offset, metadata.Data.text.Text, metadata.Data.text.Length, this.privSynthesisTurn.currentTextOffset);
                                if (!!this.privSpeechSynthesizer.wordBoundary) {
                                    try {
                                        this.privSpeechSynthesizer.wordBoundary(this.privSpeechSynthesizer, ev);
                                    }
                                    catch (error) {
                                        // Not going to let errors in the event handler
                                        // trip things up.
                                    }
                                }
                            }
                        }
                        break;
                    case "turn.end":
                        this.privSynthesisTurn.onServiceTurnEndResponse();
                        let result;
                        try {
                            const audioBuffer = await this.privSynthesisTurn.getAllReceivedAudioWithHeader();
                            result = new SpeechSynthesisResult(this.privSynthesisTurn.requestId, ResultReason.SynthesizingAudioCompleted, audioBuffer);
                            if (!!this.privSuccessCallback) {
                                this.privSuccessCallback(result);
                            }
                        }
                        catch (error) {
                            if (!!this.privErrorCallback) {
                                this.privErrorCallback(error);
                            }
                        }
                        if (this.privSpeechSynthesizer.synthesisCompleted) {
                            try {
                                this.privSpeechSynthesizer.synthesisCompleted(this.privSpeechSynthesizer, new SpeechSynthesisEventArgs(result));
                            }
                            catch (e) {
                                // Not going to let errors in the event handler
                                // trip things up.
                            }
                        }
                        break;
                    default:
                        if (!this.processTypeSpecificMessages(connectionMessage)) {
                            // here are some messages that the derived class has not processed, dispatch them to connect class
                            if (!!this.privServiceEvents) {
                                this.serviceEvents.onEvent(new ServiceEvent(connectionMessage.path.toLowerCase(), connectionMessage.textBody));
                            }
                        }
                }
            }
            return this.receiveMessage();
        }
        catch (e) {
            // TODO: What goes here?
        }
    }
    connectImpl(isUnAuthorized = false) {
        if (this.privConnectionPromise) {
            return this.privConnectionPromise.then((connection) => {
                if (connection.state() === ConnectionState.Disconnected) {
                    this.privConnectionId = null;
                    this.privConnectionPromise = null;
                    this.privServiceHasSentMessage = false;
                    return this.connectImpl();
                }
                return this.privConnectionPromise;
            }, (error) => {
                this.privConnectionId = null;
                this.privConnectionPromise = null;
                this.privServiceHasSentMessage = false;
                return this.connectImpl();
            });
        }
        this.privAuthFetchEventId = createNoDashGuid();
        this.privConnectionId = createNoDashGuid();
        this.privSynthesisTurn.onPreConnectionStart(this.privAuthFetchEventId, this.privConnectionId);
        const authPromise = isUnAuthorized ? this.privAuthentication.fetchOnExpiry(this.privAuthFetchEventId) : this.privAuthentication.fetch(this.privAuthFetchEventId);
        this.privConnectionPromise = authPromise.then(async (result) => {
            await this.privSynthesisTurn.onAuthCompleted(false);
            const connection = this.privConnectionFactory.create(this.privSynthesizerConfig, result, this.privConnectionId);
            // Attach to the underlying event. No need to hold onto the detach pointers as in the event the connection goes away,
            // it'll stop sending events.
            connection.events.attach((event) => {
                this.connectionEvents.onEvent(event);
            });
            const response = await connection.open();
            if (response.statusCode === 200) {
                await this.privSynthesisTurn.onConnectionEstablishCompleted(response.statusCode);
                return Promise.resolve(connection);
            }
            else if (response.statusCode === 403 && !isUnAuthorized) {
                return this.connectImpl(true);
            }
            else {
                await this.privSynthesisTurn.onConnectionEstablishCompleted(response.statusCode, response.reason);
                return Promise.reject(`Unable to contact server. StatusCode: ${response.statusCode}, ${this.privSynthesizerConfig.parameters.getProperty(PropertyId.SpeechServiceConnection_Endpoint)} Reason: ${response.reason}`);
            }
        }, async (error) => {
            await this.privSynthesisTurn.onAuthCompleted(true, error);
            throw new Error(error);
        });
        // Attach an empty handler to allow the promise to run in the background while
        // other startup events happen. It'll eventually be awaited on.
        this.privConnectionPromise.catch(() => { });
        return this.privConnectionPromise;
    }
    async fetchConnection() {
        if (this.privConnectionConfigurationPromise) {
            return this.privConnectionConfigurationPromise.then((connection) => {
                if (connection.state() === ConnectionState.Disconnected) {
                    this.privConnectionId = null;
                    this.privConnectionConfigurationPromise = null;
                    this.privServiceHasSentMessage = false;
                    return this.fetchConnection();
                }
                return this.privConnectionConfigurationPromise;
            }, (error) => {
                this.privConnectionId = null;
                this.privConnectionConfigurationPromise = null;
                this.privServiceHasSentMessage = false;
                return this.fetchConnection();
            });
        }
        this.privConnectionConfigurationPromise = this.configureConnection();
        return await this.privConnectionConfigurationPromise;
    }
    // Takes an established websocket connection to the endpoint and sends speech configuration information.
    async configureConnection() {
        const connection = await this.connectImpl();
        if (this.configConnectionOverride !== undefined) {
            return this.configConnectionOverride(connection);
        }
        await this.sendSpeechServiceConfig(connection, this.privSynthesizerConfig.SpeechServiceConfig.serialize());
        return connection;
    }
}
SynthesisAdapterBase.telemetryDataEnabled = true;

//# sourceMappingURL=SynthesisAdapterBase.js.map