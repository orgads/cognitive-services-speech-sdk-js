// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { ReplayableAudioNode } from "../common.browser/Exports";
import { ArgumentNullError, ConnectionState, createNoDashGuid, EventSource, MessageType, ServiceEvent, Timeout } from "../common/Exports";
import { CancellationErrorCode, CancellationReason, PropertyId, RecognitionEventArgs, SessionEventArgs, } from "../sdk/Exports";
import { AgentConfig, DynamicGrammarBuilder, RequestSession, SpeechContext, SpeechDetected, } from "./Exports";
import { SpeechConnectionMessage } from "./SpeechConnectionMessage.Internal";
export class ServiceRecognizerBase {
    constructor(authentication, connectionFactory, audioSource, recognizerConfig, recognizer) {
        this.privSetTimeout = setTimeout;
        this.recognizeOverride = undefined;
        this.disconnectOverride = undefined;
        this.receiveMessageOverride = undefined;
        this.sendSpeechContext = (connection) => {
            const speechContextJson = this.speechContext.toJSON();
            if (speechContextJson) {
                return connection.send(new SpeechConnectionMessage(MessageType.Text, "speech.context", this.privRequestSession.requestId, "application/json", speechContextJson));
            }
            return;
        };
        this.sendPrePayloadJSONOverride = undefined;
        this.postConnectImplOverride = undefined;
        this.configConnectionOverride = undefined;
        this.sendSpeechServiceConfig = (connection, requestSession, SpeechServiceConfigJson) => {
            // filter out anything that is not required for the service to work.
            if (ServiceRecognizerBase.telemetryDataEnabled !== true) {
                const withTelemetry = JSON.parse(SpeechServiceConfigJson);
                const replacement = {
                    context: {
                        system: withTelemetry.context.system,
                    },
                };
                SpeechServiceConfigJson = JSON.stringify(replacement);
            }
            if (SpeechServiceConfigJson) {
                return connection.send(new SpeechConnectionMessage(MessageType.Text, "speech.config", requestSession.requestId, "application/json", SpeechServiceConfigJson));
            }
            return;
        };
        if (!authentication) {
            throw new ArgumentNullError("authentication");
        }
        if (!connectionFactory) {
            throw new ArgumentNullError("connectionFactory");
        }
        if (!audioSource) {
            throw new ArgumentNullError("audioSource");
        }
        if (!recognizerConfig) {
            throw new ArgumentNullError("recognizerConfig");
        }
        this.privMustReportEndOfStream = false;
        this.privAuthentication = authentication;
        this.privConnectionFactory = connectionFactory;
        this.privAudioSource = audioSource;
        this.privRecognizerConfig = recognizerConfig;
        this.privIsDisposed = false;
        this.privRecognizer = recognizer;
        this.privRequestSession = new RequestSession(this.privAudioSource.id());
        this.privConnectionEvents = new EventSource();
        this.privServiceEvents = new EventSource();
        this.privDynamicGrammar = new DynamicGrammarBuilder();
        this.privSpeechContext = new SpeechContext(this.privDynamicGrammar);
        this.privAgentConfig = new AgentConfig();
        if (typeof (Blob) !== "undefined" && typeof (Worker) !== "undefined") {
            this.privSetTimeout = Timeout.setTimeout;
        }
        this.connectionEvents.attach(async (connectionEvent) => {
            if (connectionEvent.name === "ConnectionClosedEvent") {
                const connectionClosedEvent = connectionEvent;
                if (connectionClosedEvent.statusCode !== 1000) {
                    await this.cancelRecognitionLocal(CancellationReason.Error, connectionClosedEvent.statusCode === 1007 ? CancellationErrorCode.BadRequestParameters : CancellationErrorCode.ConnectionFailure, connectionClosedEvent.reason + " websocket error code: " + connectionClosedEvent.statusCode);
                }
            }
        });
    }
    get audioSource() {
        return this.privAudioSource;
    }
    get speechContext() {
        return this.privSpeechContext;
    }
    get dynamicGrammar() {
        return this.privDynamicGrammar;
    }
    get agentConfig() {
        return this.privAgentConfig;
    }
    set conversationTranslatorToken(token) {
        this.privRecognizerConfig.parameters.setProperty(PropertyId.ConversationTranslator_Token, token);
    }
    set authentication(auth) {
        this.privAuthentication = this.authentication;
    }
    isDisposed() {
        return this.privIsDisposed;
    }
    async dispose(reason) {
        this.privIsDisposed = true;
        if (this.privConnectionConfigurationPromise) {
            try {
                const connection = await this.privConnectionConfigurationPromise;
                await connection.dispose(reason);
            }
            catch (error) {
                // The connection is in a bad state. But we're trying to kill it, so...
                return;
            }
        }
    }
    get connectionEvents() {
        return this.privConnectionEvents;
    }
    get serviceEvents() {
        return this.privServiceEvents;
    }
    get recognitionMode() {
        return this.privRecognizerConfig.recognitionMode;
    }
    async recognize(recoMode, successCallback, errorCallBack) {
        if (this.recognizeOverride !== undefined) {
            return this.recognizeOverride(recoMode, successCallback, errorCallBack);
        }
        // Clear the existing configuration promise to force a re-transmission of config and context.
        this.privConnectionConfigurationPromise = null;
        this.privRecognizerConfig.recognitionMode = recoMode;
        this.privSuccessCallback = successCallback;
        this.privErrorCallback = errorCallBack;
        this.privRequestSession.startNewRecognition();
        this.privRequestSession.listenForServiceTelemetry(this.privAudioSource.events);
        // Start the connection to the service. The promise this will create is stored and will be used by configureConnection().
        const conPromise = this.connectImpl();
        const audioStreamNode = await this.audioSource.attach(this.privRequestSession.audioNodeId);
        const format = await this.audioSource.format;
        const deviceInfo = await this.audioSource.deviceInfo;
        const audioNode = new ReplayableAudioNode(audioStreamNode, format.avgBytesPerSec);
        await this.privRequestSession.onAudioSourceAttachCompleted(audioNode, false);
        this.privRecognizerConfig.SpeechServiceConfig.Context.audio = { source: deviceInfo };
        try {
            await conPromise;
        }
        catch (error) {
            await this.cancelRecognitionLocal(CancellationReason.Error, CancellationErrorCode.ConnectionFailure, error);
            return;
        }
        const sessionStartEventArgs = new SessionEventArgs(this.privRequestSession.sessionId);
        if (!!this.privRecognizer.sessionStarted) {
            this.privRecognizer.sessionStarted(this.privRecognizer, sessionStartEventArgs);
        }
        const messageRetrievalPromise = this.receiveMessage();
        const audioSendPromise = this.sendAudio(audioNode);
        audioSendPromise.catch(async (error) => {
            await this.cancelRecognitionLocal(CancellationReason.Error, CancellationErrorCode.RuntimeError, error);
        });
        return;
    }
    async stopRecognizing() {
        if (this.privRequestSession.isRecognizing) {
            await this.audioSource.turnOff();
            await this.sendFinalAudio();
            await this.privRequestSession.onStopRecognizing();
            await this.privRequestSession.turnCompletionPromise;
            await this.privRequestSession.dispose();
        }
        return;
    }
    async connect() {
        await this.connectImpl();
        return Promise.resolve();
    }
    connectAsync(cb, err) {
        this.connectImpl().then((connection) => {
            try {
                if (!!cb) {
                    cb();
                }
            }
            catch (e) {
                if (!!err) {
                    err(e);
                }
            }
        }, (reason) => {
            try {
                if (!!err) {
                    err(reason);
                }
                /* tslint:disable:no-empty */
            }
            catch (error) {
            }
        });
    }
    async disconnect() {
        await this.cancelRecognitionLocal(CancellationReason.Error, CancellationErrorCode.NoError, "Disconnecting");
        if (this.disconnectOverride !== undefined) {
            await this.disconnectOverride();
        }
        try {
            await (await this.privConnectionPromise).dispose();
        }
        catch (error) {
        }
        this.privConnectionPromise = null;
    }
    sendMessage(message) { }
    async sendNetworkMessage(path, payload) {
        const type = typeof payload === "string" ? MessageType.Text : MessageType.Binary;
        const contentType = typeof payload === "string" ? "application/json" : "";
        const connection = await this.fetchConnection();
        return connection.send(new SpeechConnectionMessage(type, path, this.privRequestSession.requestId, contentType, payload));
    }
    set activityTemplate(messagePayload) { this.privActivityTemplate = messagePayload; }
    get activityTemplate() { return this.privActivityTemplate; }
    async sendTelemetryData() {
        const telemetryData = this.privRequestSession.getTelemetry();
        if (ServiceRecognizerBase.telemetryDataEnabled !== true ||
            this.privIsDisposed ||
            null === telemetryData) {
            return;
        }
        if (!!ServiceRecognizerBase.telemetryData) {
            try {
                ServiceRecognizerBase.telemetryData(telemetryData);
                /* tslint:disable:no-empty */
            }
            catch (_a) { }
        }
        const connection = await this.fetchConnection();
        await connection.send(new SpeechConnectionMessage(MessageType.Text, "telemetry", this.privRequestSession.requestId, "application/json", telemetryData));
    }
    // Cancels recognition.
    async cancelRecognitionLocal(cancellationReason, errorCode, error) {
        if (!!this.privRequestSession.isRecognizing) {
            await this.privRequestSession.onStopRecognizing();
            this.cancelRecognition(this.privRequestSession.sessionId, this.privRequestSession.requestId, cancellationReason, errorCode, error);
        }
    }
    async receiveMessage() {
        try {
            if (this.privIsDisposed) {
                // We're done.
                return;
            }
            let connection = await this.fetchConnection();
            const message = await connection.read();
            if (this.receiveMessageOverride !== undefined) {
                return this.receiveMessageOverride();
            }
            // indicates we are draining the queue and it came with no message;
            if (!message) {
                if (!this.privRequestSession.isRecognizing) {
                    return;
                }
                else {
                    return this.receiveMessage();
                }
            }
            this.privServiceHasSentMessage = true;
            const connectionMessage = SpeechConnectionMessage.fromConnectionMessage(message);
            if (connectionMessage.requestId.toLowerCase() === this.privRequestSession.requestId.toLowerCase()) {
                switch (connectionMessage.path.toLowerCase()) {
                    case "turn.start":
                        this.privMustReportEndOfStream = true;
                        this.privRequestSession.onServiceTurnStartResponse();
                        break;
                    case "speech.startdetected":
                        const speechStartDetected = SpeechDetected.fromJSON(connectionMessage.textBody);
                        const speechStartEventArgs = new RecognitionEventArgs(speechStartDetected.Offset, this.privRequestSession.sessionId);
                        if (!!this.privRecognizer.speechStartDetected) {
                            this.privRecognizer.speechStartDetected(this.privRecognizer, speechStartEventArgs);
                        }
                        break;
                    case "speech.enddetected":
                        let json;
                        if (connectionMessage.textBody.length > 0) {
                            json = connectionMessage.textBody;
                        }
                        else {
                            // If the request was empty, the JSON returned is empty.
                            json = "{ Offset: 0 }";
                        }
                        const speechStopDetected = SpeechDetected.fromJSON(json);
                        // Only shrink the buffers for continuous recognition.
                        // For single shot, the speech.phrase message will come after the speech.end and it should own buffer shrink.
                        if (this.privRecognizerConfig.isContinuousRecognition) {
                            this.privRequestSession.onServiceRecognized(speechStopDetected.Offset + this.privRequestSession.currentTurnAudioOffset);
                        }
                        const speechStopEventArgs = new RecognitionEventArgs(speechStopDetected.Offset + this.privRequestSession.currentTurnAudioOffset, this.privRequestSession.sessionId);
                        if (!!this.privRecognizer.speechEndDetected) {
                            this.privRecognizer.speechEndDetected(this.privRecognizer, speechStopEventArgs);
                        }
                        break;
                    case "turn.end":
                        await this.sendTelemetryData();
                        if (this.privRequestSession.isSpeechEnded && this.privMustReportEndOfStream) {
                            this.privMustReportEndOfStream = false;
                            await this.cancelRecognitionLocal(CancellationReason.EndOfStream, CancellationErrorCode.NoError, undefined);
                        }
                        const sessionStopEventArgs = new SessionEventArgs(this.privRequestSession.sessionId);
                        await this.privRequestSession.onServiceTurnEndResponse(this.privRecognizerConfig.isContinuousRecognition);
                        if (!this.privRecognizerConfig.isContinuousRecognition || this.privRequestSession.isSpeechEnded || !this.privRequestSession.isRecognizing) {
                            if (!!this.privRecognizer.sessionStopped) {
                                this.privRecognizer.sessionStopped(this.privRecognizer, sessionStopEventArgs);
                            }
                            return;
                        }
                        else {
                            connection = await this.fetchConnection();
                            await this.sendPrePayloadJSON(connection);
                        }
                        break;
                    default:
                        if (!await this.processTypeSpecificMessages(connectionMessage)) {
                            // here are some messages that the derived class has not processed, dispatch them to connect class
                            if (!!this.privServiceEvents) {
                                this.serviceEvents.onEvent(new ServiceEvent(connectionMessage.path.toLowerCase(), connectionMessage.textBody));
                            }
                        }
                }
            }
            return this.receiveMessage();
        }
        catch (error) {
            return null;
        }
    }
    // Encapsulated for derived service recognizers that need to send additional JSON
    async sendPrePayloadJSON(connection) {
        if (this.sendPrePayloadJSONOverride !== undefined) {
            return this.sendPrePayloadJSONOverride(connection);
        }
        await this.sendSpeechContext(connection);
        await this.sendWaveHeader(connection);
        return;
    }
    async sendWaveHeader(connection) {
        const format = await this.audioSource.format;
        // this.writeBufferToConsole(format.header);
        return connection.send(new SpeechConnectionMessage(MessageType.Binary, "audio", this.privRequestSession.requestId, "audio/x-wav", format.header));
    }
    // Establishes a websocket connection to the end point.
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
        const sessionId = this.privRecognizerConfig.parameters.getProperty(PropertyId.Speech_SessionId, undefined);
        this.privConnectionId = (sessionId !== undefined) ? sessionId : createNoDashGuid();
        this.privRequestSession.onPreConnectionStart(this.privAuthFetchEventId, this.privConnectionId);
        const authPromise = isUnAuthorized ? this.privAuthentication.fetchOnExpiry(this.privAuthFetchEventId) : this.privAuthentication.fetch(this.privAuthFetchEventId);
        this.privConnectionPromise = authPromise.then(async (result) => {
            await this.privRequestSession.onAuthCompleted(false);
            const connection = this.privConnectionFactory.create(this.privRecognizerConfig, result, this.privConnectionId);
            this.privRequestSession.listenForServiceTelemetry(connection.events);
            // Attach to the underlying event. No need to hold onto the detach pointers as in the event the connection goes away,
            // it'll stop sending events.
            connection.events.attach((event) => {
                this.connectionEvents.onEvent(event);
            });
            const response = await connection.open();
            if (response.statusCode === 200) {
                await this.privRequestSession.onConnectionEstablishCompleted(response.statusCode);
                return Promise.resolve(connection);
            }
            else if (response.statusCode === 403 && !isUnAuthorized) {
                return this.connectImpl(true);
            }
            else {
                await this.privRequestSession.onConnectionEstablishCompleted(response.statusCode, response.reason);
                return Promise.reject(`Unable to contact server. StatusCode: ${response.statusCode}, ${this.privRecognizerConfig.parameters.getProperty(PropertyId.SpeechServiceConnection_Endpoint)} Reason: ${response.reason}`);
            }
        }, async (error) => {
            await this.privRequestSession.onAuthCompleted(true, error);
            throw new Error(error);
        });
        // Attach an empty handler to allow the promise to run in the background while
        // other startup events happen. It'll eventually be awaited on.
        this.privConnectionPromise.catch(() => { });
        if (this.postConnectImplOverride !== undefined) {
            return this.postConnectImplOverride(this.privConnectionPromise);
        }
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
    async sendAudio(audioStreamNode) {
        const audioFormat = await this.audioSource.format;
        // The time we last sent data to the service.
        let nextSendTime = Date.now();
        // Max amount to send before we start to throttle
        const fastLaneSizeMs = this.privRecognizerConfig.parameters.getProperty("SPEECH-TransmitLengthBeforThrottleMs", "5000");
        const maxSendUnthrottledBytes = audioFormat.avgBytesPerSec / 1000 * parseInt(fastLaneSizeMs, 10);
        const startRecogNumber = this.privRequestSession.recogNumber;
        const readAndUploadCycle = async () => {
            var _a;
            // If speech is done, stop sending audio.
            if (!this.privIsDisposed &&
                !this.privRequestSession.isSpeechEnded &&
                this.privRequestSession.isRecognizing &&
                this.privRequestSession.recogNumber === startRecogNumber) {
                const connection = await this.fetchConnection();
                const audioStreamChunk = await audioStreamNode.read();
                // we have a new audio chunk to upload.
                if (this.privRequestSession.isSpeechEnded) {
                    // If service already recognized audio end then don't send any more audio
                    return;
                }
                let payload;
                let sendDelay;
                if (!audioStreamChunk || audioStreamChunk.isEnd) {
                    payload = null;
                    sendDelay = 0;
                }
                else {
                    payload = audioStreamChunk.buffer;
                    this.privRequestSession.onAudioSent(payload.byteLength);
                    if (maxSendUnthrottledBytes >= this.privRequestSession.bytesSent) {
                        sendDelay = 0;
                    }
                    else {
                        sendDelay = Math.max(0, nextSendTime - Date.now());
                    }
                }
                if (0 !== sendDelay) {
                    await this.delay(sendDelay);
                }
                if (payload !== null) {
                    nextSendTime = Date.now() + (payload.byteLength * 1000 / (audioFormat.avgBytesPerSec * 2));
                }
                // Are we still alive?
                if (!this.privIsDisposed &&
                    !this.privRequestSession.isSpeechEnded &&
                    this.privRequestSession.isRecognizing &&
                    this.privRequestSession.recogNumber === startRecogNumber) {
                    connection.send(new SpeechConnectionMessage(MessageType.Binary, "audio", this.privRequestSession.requestId, null, payload)).catch(() => {
                        this.privRequestSession.onServiceTurnEndResponse(this.privRecognizerConfig.isContinuousRecognition).catch(() => { });
                    });
                    if (!((_a = audioStreamChunk) === null || _a === void 0 ? void 0 : _a.isEnd)) {
                        // this.writeBufferToConsole(payload);
                        // Regardless of success or failure, schedule the next upload.
                        // If the underlying connection was broken, the next cycle will
                        // get a new connection and re-transmit missing audio automatically.
                        return readAndUploadCycle();
                    }
                    else {
                        // the audio stream has been closed, no need to schedule next
                        // read-upload cycle.
                        this.privRequestSession.onSpeechEnded();
                    }
                }
            }
        };
        return readAndUploadCycle();
    }
    delay(delayMs) {
        return new Promise((resolve, reject) => {
            this.privSetTimeout(resolve, delayMs);
        });
    }
    writeBufferToConsole(buffer) {
        let out = "Buffer Size: ";
        if (null === buffer) {
            out += "null";
        }
        else {
            const readView = new Uint8Array(buffer);
            out += buffer.byteLength + "\r\n";
            for (let i = 0; i < buffer.byteLength; i++) {
                out += readView[i].toString(16).padStart(2, "0") + " ";
            }
        }
        // tslint:disable-next-line:no-console
        console.info(out);
    }
    async sendFinalAudio() {
        const connection = await this.fetchConnection();
        await connection.send(new SpeechConnectionMessage(MessageType.Binary, "audio", this.privRequestSession.requestId, null, null));
        return;
    }
    // Takes an established websocket connection to the endpoint and sends speech configuration information.
    async configureConnection() {
        const connection = await this.connectImpl();
        if (this.configConnectionOverride !== undefined) {
            return this.configConnectionOverride(connection);
        }
        await this.sendSpeechServiceConfig(connection, this.privRequestSession, this.privRecognizerConfig.SpeechServiceConfig.serialize());
        await this.sendPrePayloadJSON(connection);
        return connection;
    }
}
ServiceRecognizerBase.telemetryDataEnabled = true;

//# sourceMappingURL=ServiceRecognizerBase.js.map