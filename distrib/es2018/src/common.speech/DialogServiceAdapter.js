// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { ReplayableAudioNode } from "../common.browser/Exports";
import { SendingAgentContextMessageEvent } from "../common/DialogEvents";
import { BackgroundEvent, createGuid, createNoDashGuid, Deferred, Events, EventSource, MessageType, ServiceEvent, } from "../common/Exports";
import { ActivityReceivedEventArgs, CancellationErrorCode, CancellationReason, DialogServiceConfig, PropertyCollection, PropertyId, RecognitionEventArgs, ResultReason, SessionEventArgs, SpeechRecognitionCanceledEventArgs, SpeechRecognitionEventArgs, SpeechRecognitionResult, SpeechSynthesisOutputFormat, TurnStatusReceivedEventArgs, } from "../sdk/Exports";
import { DialogServiceTurnStateManager } from "./DialogServiceTurnStateManager";
import { CancellationErrorCodePropertyName, EnumTranslation, RecognitionStatus, ServiceRecognizerBase, SimpleSpeechPhrase, SpeechDetected, SpeechHypothesis, } from "./Exports";
import { ActivityPayloadResponse } from "./ServiceMessages/ActivityResponsePayload";
import { SpeechConnectionMessage } from "./SpeechConnectionMessage.Internal";
export class DialogServiceAdapter extends ServiceRecognizerBase {
    constructor(authentication, connectionFactory, audioSource, recognizerConfig, dialogServiceConnector) {
        super(authentication, connectionFactory, audioSource, recognizerConfig, dialogServiceConnector);
        this.sendAgentConfig = (connection) => {
            if (this.agentConfig && !this.agentConfigSent) {
                if (this.privRecognizerConfig
                    .parameters
                    .getProperty(PropertyId.Conversation_DialogType) === DialogServiceConfig.DialogTypes.CustomCommands) {
                    const config = this.agentConfig.get();
                    config.botInfo.commandsCulture = this.privRecognizerConfig.parameters.getProperty(PropertyId.SpeechServiceConnection_RecoLanguage, "en-us");
                    this.agentConfig.set(config);
                }
                this.onEvent(new SendingAgentContextMessageEvent(this.agentConfig));
                const agentConfigJson = this.agentConfig.toJsonString();
                // guard against sending this multiple times on one connection
                this.agentConfigSent = true;
                return connection.send(new SpeechConnectionMessage(MessageType.Text, "agent.config", this.privRequestSession.requestId, "application/json", agentConfigJson));
            }
            return;
        };
        this.sendAgentContext = (connection) => {
            const guid = createGuid();
            const speechActivityTemplate = this.privDialogServiceConnector.properties.getProperty(PropertyId.Conversation_Speech_Activity_Template);
            const agentContext = {
                channelData: "",
                context: {
                    interactionId: guid
                },
                messagePayload: typeof speechActivityTemplate === undefined ? undefined : speechActivityTemplate,
                version: 0.5
            };
            const agentContextJson = JSON.stringify(agentContext);
            return connection.send(new SpeechConnectionMessage(MessageType.Text, "speech.agent.context", this.privRequestSession.requestId, "application/json", agentContextJson));
        };
        this.handleResponseMessage = (responseMessage) => {
            // "response" messages can contain either "message" (activity) or "MessageStatus" data. Fire the appropriate
            // event according to the message type that's specified.
            const responsePayload = JSON.parse(responseMessage.textBody);
            switch (responsePayload.messageType.toLowerCase()) {
                case "message":
                    const responseRequestId = responseMessage.requestId.toUpperCase();
                    const activityPayload = ActivityPayloadResponse.fromJSON(responseMessage.textBody);
                    const turn = this.privTurnStateManager.GetTurn(responseRequestId);
                    // update the conversation Id
                    if (activityPayload.conversationId) {
                        const updateAgentConfig = this.agentConfig.get();
                        updateAgentConfig.botInfo.conversationId = activityPayload.conversationId;
                        this.agentConfig.set(updateAgentConfig);
                    }
                    const pullAudioOutputStream = turn.processActivityPayload(activityPayload, SpeechSynthesisOutputFormat[this.privDialogServiceConnector.properties.getProperty(PropertyId.SpeechServiceConnection_SynthOutputFormat, undefined)]);
                    const activity = new ActivityReceivedEventArgs(activityPayload.messagePayload, pullAudioOutputStream);
                    if (!!this.privDialogServiceConnector.activityReceived) {
                        try {
                            this.privDialogServiceConnector.activityReceived(this.privDialogServiceConnector, activity);
                            /* tslint:disable:no-empty */
                        }
                        catch (error) {
                            // Not going to let errors in the event handler
                            // trip things up.
                        }
                    }
                    break;
                case "messagestatus":
                    if (!!this.privDialogServiceConnector.turnStatusReceived) {
                        try {
                            this.privDialogServiceConnector.turnStatusReceived(this.privDialogServiceConnector, new TurnStatusReceivedEventArgs(responseMessage.textBody));
                            /* tslint:disable:no-empty */
                        }
                        catch (error) {
                            // Not going to let errors in the event handler
                            // trip things up.
                        }
                    }
                    break;
                default:
                    Events.instance.onEvent(new BackgroundEvent(`Unexpected response of type ${responsePayload.messageType}. Ignoring.`));
                    break;
            }
        };
        this.privEvents = new EventSource();
        this.privDialogServiceConnector = dialogServiceConnector;
        this.receiveMessageOverride = this.receiveDialogMessageOverride;
        this.privTurnStateManager = new DialogServiceTurnStateManager();
        this.recognizeOverride = this.listenOnce;
        this.postConnectImplOverride = this.dialogConnectImpl;
        this.configConnectionOverride = this.configConnection;
        this.disconnectOverride = this.privDisconnect;
        this.privDialogAudioSource = audioSource;
        this.agentConfigSent = false;
        this.privLastResult = null;
        this.connectionEvents.attach(async (connectionEvent) => {
            if (connectionEvent.name === "ConnectionClosedEvent") {
                this.terminateMessageLoop = true;
            }
        });
    }
    async sendMessage(message) {
        const interactionGuid = createGuid();
        const requestId = createNoDashGuid();
        const agentMessage = {
            context: {
                interactionId: interactionGuid
            },
            messagePayload: JSON.parse(message),
            version: 0.5
        };
        const agentMessageJson = JSON.stringify(agentMessage);
        const connection = await this.fetchConnection();
        await connection.send(new SpeechConnectionMessage(MessageType.Text, "agent", requestId, "application/json", agentMessageJson));
    }
    async privDisconnect() {
        await this.cancelRecognition(this.privRequestSession.sessionId, this.privRequestSession.requestId, CancellationReason.Error, CancellationErrorCode.NoError, "Disconnecting");
        this.terminateMessageLoop = true;
        this.agentConfigSent = false;
        return;
    }
    async processTypeSpecificMessages(connectionMessage) {
        const resultProps = new PropertyCollection();
        if (connectionMessage.messageType === MessageType.Text) {
            resultProps.setProperty(PropertyId.SpeechServiceResponse_JsonResult, connectionMessage.textBody);
        }
        let result;
        let processed;
        switch (connectionMessage.path.toLowerCase()) {
            case "speech.phrase":
                const speechPhrase = SimpleSpeechPhrase.fromJSON(connectionMessage.textBody);
                this.privRequestSession.onPhraseRecognized(this.privRequestSession.currentTurnAudioOffset + speechPhrase.Offset + speechPhrase.Duration);
                if (speechPhrase.RecognitionStatus !== RecognitionStatus.TooManyRequests && speechPhrase.RecognitionStatus !== RecognitionStatus.Error) {
                    const args = this.fireEventForResult(speechPhrase, resultProps);
                    this.privLastResult = args.result;
                    if (!!this.privDialogServiceConnector.recognized) {
                        try {
                            this.privDialogServiceConnector.recognized(this.privDialogServiceConnector, args);
                            /* tslint:disable:no-empty */
                        }
                        catch (error) {
                            // Not going to let errors in the event handler
                            // trip things up.
                        }
                    }
                }
                processed = true;
                break;
            case "speech.hypothesis":
                const hypothesis = SpeechHypothesis.fromJSON(connectionMessage.textBody);
                const offset = hypothesis.Offset + this.privRequestSession.currentTurnAudioOffset;
                result = new SpeechRecognitionResult(this.privRequestSession.requestId, ResultReason.RecognizingSpeech, hypothesis.Text, hypothesis.Duration, offset, hypothesis.Language, hypothesis.LanguageDetectionConfidence, undefined, undefined, connectionMessage.textBody, resultProps);
                this.privRequestSession.onHypothesis(offset);
                const ev = new SpeechRecognitionEventArgs(result, hypothesis.Duration, this.privRequestSession.sessionId);
                if (!!this.privDialogServiceConnector.recognizing) {
                    try {
                        this.privDialogServiceConnector.recognizing(this.privDialogServiceConnector, ev);
                        /* tslint:disable:no-empty */
                    }
                    catch (error) {
                        // Not going to let errors in the event handler
                        // trip things up.
                    }
                }
                processed = true;
                break;
            case "audio":
                {
                    const audioRequestId = connectionMessage.requestId.toUpperCase();
                    const turn = this.privTurnStateManager.GetTurn(audioRequestId);
                    try {
                        // Empty binary message signals end of stream.
                        if (!connectionMessage.binaryBody) {
                            turn.endAudioStream();
                        }
                        else {
                            turn.audioStream.write(connectionMessage.binaryBody);
                        }
                    }
                    catch (error) {
                        // Not going to let errors in the event handler
                        // trip things up.
                    }
                }
                processed = true;
                break;
            case "response":
                {
                    this.handleResponseMessage(connectionMessage);
                }
                processed = true;
                break;
            default:
                break;
        }
        return processed;
    }
    // Cancels recognition.
    async cancelRecognition(sessionId, requestId, cancellationReason, errorCode, error) {
        this.terminateMessageLoop = true;
        if (!!this.privRequestSession.isRecognizing) {
            await this.privRequestSession.onStopRecognizing();
        }
        if (!!this.privDialogServiceConnector.canceled) {
            const properties = new PropertyCollection();
            properties.setProperty(CancellationErrorCodePropertyName, CancellationErrorCode[errorCode]);
            const cancelEvent = new SpeechRecognitionCanceledEventArgs(cancellationReason, error, errorCode, undefined, sessionId);
            try {
                this.privDialogServiceConnector.canceled(this.privDialogServiceConnector, cancelEvent);
                /* tslint:disable:no-empty */
            }
            catch (_a) { }
            if (!!this.privSuccessCallback) {
                const result = new SpeechRecognitionResult(undefined, // ResultId
                ResultReason.Canceled, undefined, // Text
                undefined, // Duration
                undefined, // Offset
                undefined, // Language
                undefined, // Language Detection Confidence
                undefined, // Speaker Id
                error, undefined, // Json
                properties);
                try {
                    this.privSuccessCallback(result);
                    this.privSuccessCallback = undefined;
                    /* tslint:disable:no-empty */
                }
                catch (_b) { }
            }
        }
    }
    async listenOnce(recoMode, successCallback, errorCallback) {
        this.privRecognizerConfig.recognitionMode = recoMode;
        this.privSuccessCallback = successCallback;
        this.privErrorCallback = errorCallback;
        this.privRequestSession.startNewRecognition();
        this.privRequestSession.listenForServiceTelemetry(this.privDialogAudioSource.events);
        this.privRecognizerConfig.parameters.setProperty(PropertyId.Speech_SessionId, this.privRequestSession.sessionId);
        // Start the connection to the service. The promise this will create is stored and will be used by configureConnection().
        const conPromise = this.connectImpl();
        const preAudioPromise = this.sendPreAudioMessages();
        const node = await this.privDialogAudioSource.attach(this.privRequestSession.audioNodeId);
        const format = await this.privDialogAudioSource.format;
        const deviceInfo = await this.privDialogAudioSource.deviceInfo;
        const audioNode = new ReplayableAudioNode(node, format.avgBytesPerSec);
        await this.privRequestSession.onAudioSourceAttachCompleted(audioNode, false);
        this.privRecognizerConfig.SpeechServiceConfig.Context.audio = { source: deviceInfo };
        try {
            await conPromise;
            await preAudioPromise;
        }
        catch (error) {
            await this.cancelRecognition(this.privRequestSession.sessionId, this.privRequestSession.requestId, CancellationReason.Error, CancellationErrorCode.ConnectionFailure, error);
            return Promise.resolve();
        }
        const sessionStartEventArgs = new SessionEventArgs(this.privRequestSession.sessionId);
        if (!!this.privRecognizer.sessionStarted) {
            this.privRecognizer.sessionStarted(this.privRecognizer, sessionStartEventArgs);
        }
        const audioSendPromise = this.sendAudio(audioNode);
        // /* tslint:disable:no-empty */
        audioSendPromise.then(() => { }, async (error) => {
            await this.cancelRecognition(this.privRequestSession.sessionId, this.privRequestSession.requestId, CancellationReason.Error, CancellationErrorCode.RuntimeError, error);
        });
    }
    // Establishes a websocket connection to the end point.
    dialogConnectImpl(connection) {
        this.privConnectionLoop = this.startMessageLoop();
        return connection;
    }
    receiveDialogMessageOverride() {
        // we won't rely on the cascading promises of the connection since we want to continually be available to receive messages
        const communicationCustodian = new Deferred();
        const loop = async () => {
            try {
                const isDisposed = this.isDisposed();
                const terminateMessageLoop = (!this.isDisposed() && this.terminateMessageLoop);
                if (isDisposed || terminateMessageLoop) {
                    // We're done.
                    communicationCustodian.resolve(undefined);
                    return;
                }
                const connection = await this.fetchConnection();
                const message = await connection.read();
                if (!message) {
                    return loop();
                }
                const connectionMessage = SpeechConnectionMessage.fromConnectionMessage(message);
                switch (connectionMessage.path.toLowerCase()) {
                    case "turn.start":
                        {
                            const turnRequestId = connectionMessage.requestId.toUpperCase();
                            const audioSessionReqId = this.privRequestSession.requestId.toUpperCase();
                            // turn started by the service
                            if (turnRequestId !== audioSessionReqId) {
                                this.privTurnStateManager.StartTurn(turnRequestId);
                            }
                            else {
                                this.privRequestSession.onServiceTurnStartResponse();
                            }
                        }
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
                        this.privRequestSession.onServiceRecognized(speechStopDetected.Offset + this.privRequestSession.currentTurnAudioOffset);
                        const speechStopEventArgs = new RecognitionEventArgs(speechStopDetected.Offset + this.privRequestSession.currentTurnAudioOffset, this.privRequestSession.sessionId);
                        if (!!this.privRecognizer.speechEndDetected) {
                            this.privRecognizer.speechEndDetected(this.privRecognizer, speechStopEventArgs);
                        }
                        break;
                    case "turn.end":
                        {
                            const turnEndRequestId = connectionMessage.requestId.toUpperCase();
                            const audioSessionReqId = this.privRequestSession.requestId.toUpperCase();
                            // turn started by the service
                            if (turnEndRequestId !== audioSessionReqId) {
                                this.privTurnStateManager.CompleteTurn(turnEndRequestId);
                            }
                            else {
                                // Audio session turn
                                const sessionStopEventArgs = new SessionEventArgs(this.privRequestSession.sessionId);
                                await this.privRequestSession.onServiceTurnEndResponse(false);
                                if (!this.privRecognizerConfig.isContinuousRecognition || this.privRequestSession.isSpeechEnded || !this.privRequestSession.isRecognizing) {
                                    if (!!this.privRecognizer.sessionStopped) {
                                        this.privRecognizer.sessionStopped(this.privRecognizer, sessionStopEventArgs);
                                    }
                                }
                                // report result to promise.
                                if (!!this.privSuccessCallback && this.privLastResult) {
                                    try {
                                        this.privSuccessCallback(this.privLastResult);
                                        this.privLastResult = null;
                                    }
                                    catch (e) {
                                        if (!!this.privErrorCallback) {
                                            this.privErrorCallback(e);
                                        }
                                    }
                                    // Only invoke the call back once.
                                    // and if it's successful don't invoke the
                                    // error after that.
                                    this.privSuccessCallback = undefined;
                                    this.privErrorCallback = undefined;
                                }
                            }
                        }
                        break;
                    default:
                        if (!this.processTypeSpecificMessages(connectionMessage)) {
                            if (!!this.serviceEvents) {
                                this.serviceEvents.onEvent(new ServiceEvent(connectionMessage.path.toLowerCase(), connectionMessage.textBody));
                            }
                        }
                }
                const ret = loop();
                return ret;
            }
            catch (error) {
                this.terminateMessageLoop = true;
                communicationCustodian.resolve();
            }
        };
        loop().catch((reason) => {
            Events.instance.onEvent(new BackgroundEvent(reason));
        });
        return communicationCustodian.promise;
    }
    async startMessageLoop() {
        this.terminateMessageLoop = false;
        try {
            await this.receiveDialogMessageOverride();
        }
        catch (error) {
            await this.cancelRecognition(this.privRequestSession.sessionId, this.privRequestSession.requestId, CancellationReason.Error, CancellationErrorCode.RuntimeError, error);
        }
        return Promise.resolve();
    }
    // Takes an established websocket connection to the endpoint and sends speech configuration information.
    async configConnection(connection) {
        if (this.terminateMessageLoop) {
            this.terminateMessageLoop = false;
            return Promise.reject(`Connection to service terminated.`);
        }
        await this.sendSpeechServiceConfig(connection, this.privRequestSession, this.privRecognizerConfig.SpeechServiceConfig.serialize());
        await this.sendAgentConfig(connection);
        return connection;
    }
    async sendPreAudioMessages() {
        const connection = await this.fetchConnection();
        await this.sendAgentContext(connection);
        await this.sendWaveHeader(connection);
    }
    fireEventForResult(serviceResult, properties) {
        const resultReason = EnumTranslation.implTranslateRecognitionResult(serviceResult.RecognitionStatus);
        const offset = serviceResult.Offset + this.privRequestSession.currentTurnAudioOffset;
        const result = new SpeechRecognitionResult(this.privRequestSession.requestId, resultReason, serviceResult.DisplayText, serviceResult.Duration, offset, serviceResult.Language, serviceResult.LanguageDetectionConfidence, undefined, undefined, JSON.stringify(serviceResult), properties);
        const ev = new SpeechRecognitionEventArgs(result, offset, this.privRequestSession.sessionId);
        return ev;
    }
    onEvent(event) {
        this.privEvents.onEvent(event);
        Events.instance.onEvent(event);
    }
}

//# sourceMappingURL=DialogServiceAdapter.js.map
