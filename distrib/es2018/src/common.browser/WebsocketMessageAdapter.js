// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { HeaderNames } from "../common.speech/HeaderNames";
import { ArgumentNullError, BackgroundEvent, ConnectionClosedEvent, ConnectionErrorEvent, ConnectionEstablishedEvent, ConnectionMessageReceivedEvent, ConnectionMessageSentEvent, ConnectionOpenResponse, ConnectionStartEvent, ConnectionState, Deferred, Events, EventSource, MessageType, Queue, RawWebsocketMessage, } from "../common/Exports";
// Node.JS specific web socket / browser support.
import ws from "ws";
import { CertCheckAgent } from "./CertChecks";
export class WebsocketMessageAdapter {
    constructor(uri, connectionId, messageFormatter, proxyInfo, headers, enableCompression) {
        this.open = () => {
            if (this.privConnectionState === ConnectionState.Disconnected) {
                return Promise.reject(`Cannot open a connection that is in ${this.privConnectionState} state`);
            }
            if (this.privConnectionEstablishDeferral) {
                return this.privConnectionEstablishDeferral.promise;
            }
            this.privConnectionEstablishDeferral = new Deferred();
            this.privCertificateValidatedDeferral = new Deferred();
            this.privConnectionState = ConnectionState.Connecting;
            try {
                if (typeof WebSocket !== "undefined" && !WebsocketMessageAdapter.forceNpmWebSocket) {
                    // Browser handles cert checks.
                    this.privCertificateValidatedDeferral.resolve();
                    this.privWebsocketClient = new WebSocket(this.privUri);
                }
                else {
                    const options = { headers: this.privHeaders, perMessageDeflate: this.privEnableCompression };
                    // The ocsp library will handle validation for us and fail the connection if needed.
                    this.privCertificateValidatedDeferral.resolve();
                    const checkAgent = new CertCheckAgent(this.proxyInfo);
                    options.agent = checkAgent.GetAgent();
                    this.privWebsocketClient = new ws(this.privUri, options);
                }
                this.privWebsocketClient.binaryType = "arraybuffer";
                this.privReceivingMessageQueue = new Queue();
                this.privDisconnectDeferral = new Deferred();
                this.privSendMessageQueue = new Queue();
                this.processSendQueue().catch((reason) => {
                    Events.instance.onEvent(new BackgroundEvent(reason));
                });
            }
            catch (error) {
                this.privConnectionEstablishDeferral.resolve(new ConnectionOpenResponse(500, error));
                return this.privConnectionEstablishDeferral.promise;
            }
            this.onEvent(new ConnectionStartEvent(this.privConnectionId, this.privUri));
            this.privWebsocketClient.onopen = (e) => {
                this.privCertificateValidatedDeferral.promise.then(() => {
                    this.privConnectionState = ConnectionState.Connected;
                    this.onEvent(new ConnectionEstablishedEvent(this.privConnectionId));
                    this.privConnectionEstablishDeferral.resolve(new ConnectionOpenResponse(200, ""));
                }, (error) => {
                    this.privConnectionEstablishDeferral.reject(error);
                });
            };
            this.privWebsocketClient.onerror = (e) => {
                this.onEvent(new ConnectionErrorEvent(this.privConnectionId, e.message, e.type));
                this.privLastErrorReceived = e.message;
            };
            this.privWebsocketClient.onclose = (e) => {
                if (this.privConnectionState === ConnectionState.Connecting) {
                    this.privConnectionState = ConnectionState.Disconnected;
                    // this.onEvent(new ConnectionEstablishErrorEvent(this.connectionId, e.code, e.reason));
                    this.privConnectionEstablishDeferral.resolve(new ConnectionOpenResponse(e.code, e.reason + " " + this.privLastErrorReceived));
                }
                else {
                    this.privConnectionState = ConnectionState.Disconnected;
                    this.onEvent(new ConnectionClosedEvent(this.privConnectionId, e.code, e.reason));
                }
                this.onClose(e.code, e.reason).catch((reason) => {
                    Events.instance.onEvent(new BackgroundEvent(reason));
                });
            };
            this.privWebsocketClient.onmessage = (e) => {
                const networkReceivedTime = new Date().toISOString();
                if (this.privConnectionState === ConnectionState.Connected) {
                    const deferred = new Deferred();
                    // let id = ++this.idCounter;
                    this.privReceivingMessageQueue.enqueueFromPromise(deferred.promise);
                    if (e.data instanceof ArrayBuffer) {
                        const rawMessage = new RawWebsocketMessage(MessageType.Binary, e.data);
                        this.privMessageFormatter
                            .toConnectionMessage(rawMessage)
                            .then((connectionMessage) => {
                            this.onEvent(new ConnectionMessageReceivedEvent(this.privConnectionId, networkReceivedTime, connectionMessage));
                            deferred.resolve(connectionMessage);
                        }, (error) => {
                            // TODO: Events for these ?
                            deferred.reject(`Invalid binary message format. Error: ${error}`);
                        });
                    }
                    else {
                        const rawMessage = new RawWebsocketMessage(MessageType.Text, e.data);
                        this.privMessageFormatter
                            .toConnectionMessage(rawMessage)
                            .then((connectionMessage) => {
                            this.onEvent(new ConnectionMessageReceivedEvent(this.privConnectionId, networkReceivedTime, connectionMessage));
                            deferred.resolve(connectionMessage);
                        }, (error) => {
                            // TODO: Events for these ?
                            deferred.reject(`Invalid text message format. Error: ${error}`);
                        });
                    }
                }
            };
            return this.privConnectionEstablishDeferral.promise;
        };
        this.send = (message) => {
            if (this.privConnectionState !== ConnectionState.Connected) {
                return Promise.reject(`Cannot send on connection that is in ${ConnectionState[this.privConnectionState]} state`);
            }
            const messageSendStatusDeferral = new Deferred();
            const messageSendDeferral = new Deferred();
            this.privSendMessageQueue.enqueueFromPromise(messageSendDeferral.promise);
            this.privMessageFormatter
                .fromConnectionMessage(message)
                .then((rawMessage) => {
                messageSendDeferral.resolve({
                    Message: message,
                    RawWebsocketMessage: rawMessage,
                    sendStatusDeferral: messageSendStatusDeferral,
                });
            }, (error) => {
                messageSendDeferral.reject(`Error formatting the message. ${error}`);
            });
            return messageSendStatusDeferral.promise;
        };
        this.read = () => {
            if (this.privConnectionState !== ConnectionState.Connected) {
                return Promise.reject(`Cannot read on connection that is in ${this.privConnectionState} state`);
            }
            return this.privReceivingMessageQueue.dequeue();
        };
        this.close = (reason) => {
            if (this.privWebsocketClient) {
                if (this.privConnectionState !== ConnectionState.Disconnected) {
                    this.privWebsocketClient.close(1000, reason ? reason : "Normal closure by client");
                }
            }
            else {
                return Promise.resolve();
            }
            return this.privDisconnectDeferral.promise;
        };
        this.sendRawMessage = (sendItem) => {
            try {
                // indicates we are draining the queue and it came with no message;
                if (!sendItem) {
                    return Promise.resolve();
                }
                this.onEvent(new ConnectionMessageSentEvent(this.privConnectionId, new Date().toISOString(), sendItem.Message));
                // add a check for the ws readystate in order to stop the red console error 'WebSocket is already in CLOSING or CLOSED state' appearing
                if (this.isWebsocketOpen) {
                    this.privWebsocketClient.send(sendItem.RawWebsocketMessage.payload);
                }
                else {
                    return Promise.reject("websocket send error: Websocket not ready " + this.privConnectionId + " " + sendItem.Message.id + " " + new Error().stack);
                }
                return Promise.resolve();
            }
            catch (e) {
                return Promise.reject(`websocket send error: ${e}`);
            }
        };
        this.onEvent = (event) => {
            this.privConnectionEvents.onEvent(event);
            Events.instance.onEvent(event);
        };
        if (!uri) {
            throw new ArgumentNullError("uri");
        }
        if (!messageFormatter) {
            throw new ArgumentNullError("messageFormatter");
        }
        this.proxyInfo = proxyInfo;
        this.privConnectionEvents = new EventSource();
        this.privConnectionId = connectionId;
        this.privMessageFormatter = messageFormatter;
        this.privConnectionState = ConnectionState.None;
        this.privUri = uri;
        this.privHeaders = headers;
        this.privEnableCompression = enableCompression;
        // Add the connection ID to the headers
        this.privHeaders[HeaderNames.ConnectionId] = this.privConnectionId;
        this.privLastErrorReceived = "";
    }
    get state() {
        return this.privConnectionState;
    }
    get events() {
        return this.privConnectionEvents;
    }
    async onClose(code, reason) {
        const closeReason = `Connection closed. ${code}: ${reason}`;
        this.privConnectionState = ConnectionState.Disconnected;
        this.privDisconnectDeferral.resolve();
        await this.privReceivingMessageQueue.drainAndDispose((pendingReceiveItem) => {
            // TODO: Events for these ?
            // Logger.instance.onEvent(new LoggingEvent(LogType.Warning, null, `Failed to process received message. Reason: ${closeReason}, Message: ${JSON.stringify(pendingReceiveItem)}`));
        }, closeReason);
        await this.privSendMessageQueue.drainAndDispose((pendingSendItem) => {
            pendingSendItem.sendStatusDeferral.reject(closeReason);
        }, closeReason);
    }
    async processSendQueue() {
        while (true) {
            const itemToSend = this.privSendMessageQueue.dequeue();
            const sendItem = await itemToSend;
            // indicates we are draining the queue and it came with no message;
            if (!sendItem) {
                return;
            }
            try {
                await this.sendRawMessage(sendItem);
                sendItem.sendStatusDeferral.resolve();
            }
            catch (sendError) {
                sendItem.sendStatusDeferral.reject(sendError);
            }
        }
    }
    get isWebsocketOpen() {
        return this.privWebsocketClient && this.privWebsocketClient.readyState === this.privWebsocketClient.OPEN;
    }
}
WebsocketMessageAdapter.forceNpmWebSocket = false;

//# sourceMappingURL=WebsocketMessageAdapter.js.map