"use strict";
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE.md file in the project root for full license information.
//
Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = require("../common.speech/Exports");
var Exports_2 = require("../common/Exports");
var ConnectionMessage_1 = require("./ConnectionMessage");
var Contracts_1 = require("./Contracts");
var Exports_3 = require("./Exports");
/**
 * Connection is a proxy class for managing connection to the speech service of the specified Recognizer.
 * By default, a Recognizer autonomously manages connection to service when needed.
 * The Connection class provides additional methods for users to explicitly open or close a connection and
 * to subscribe to connection status changes.
 * The use of Connection is optional, and mainly for scenarios where fine tuning of application
 * behavior based on connection status is needed. Users can optionally call Open() to manually set up a connection
 * in advance before starting recognition on the Recognizer associated with this Connection.
 * If the Recognizer needs to connect or disconnect to service, it will
 * setup or shutdown the connection independently. In this case the Connection will be notified by change of connection
 * status via Connected/Disconnected events.
 * Added in version 1.2.1.
 */
var Connection = /** @class */ (function () {
    function Connection() {
    }
    /**
     * Gets the Connection instance from the specified recognizer.
     * @param recognizer The recognizer associated with the connection.
     * @return The Connection instance of the recognizer.
     */
    Connection.fromRecognizer = function (recognizer) {
        var recoBase = recognizer.internalData;
        var ret = new Connection();
        ret.privInternalData = recoBase;
        ret.setupEvents();
        return ret;
    };
    /**
     * Gets the Connection instance from the specified synthesizer.
     * @param synthesizer The synthesizer associated with the connection.
     * @return The Connection instance of the synthesizer.
     */
    Connection.fromSynthesizer = function (synthesizer) {
        var synthBase = synthesizer.internalData;
        var ret = new Connection();
        ret.privInternalData = synthBase;
        ret.setupEvents();
        return ret;
    };
    /**
     * Starts to set up connection to the service.
     * Users can optionally call openConnection() to manually set up a connection in advance before starting recognition on the
     * Recognizer associated with this Connection. After starting recognition, calling Open() will have no effect
     *
     * Note: On return, the connection might not be ready yet. Please subscribe to the Connected event to
     * be notified when the connection is established.
     */
    Connection.prototype.openConnection = function (cb, err) {
        Exports_2.marshalPromiseToCallbacks(this.privInternalData.connect(), cb, err);
    };
    /**
     * Closes the connection the service.
     * Users can optionally call closeConnection() to manually shutdown the connection of the associated Recognizer.
     *
     * If closeConnection() is called during recognition, recognition will fail and cancel with an error.
     */
    Connection.prototype.closeConnection = function (cb, err) {
        if (this.privInternalData instanceof Exports_1.SynthesisAdapterBase) {
            throw new Error("Disconnecting a synthesizer's connection is currently not supported");
        }
        else {
            Exports_2.marshalPromiseToCallbacks(this.privInternalData.disconnect(), cb, err);
        }
    };
    /**
     * Appends a parameter in a message to service.
     * Added in version 1.12.1.
     * @param path The path of the network message.
     * @param propertyName Name of the property
     * @param propertyValue Value of the property. This is a json string.
     */
    Connection.prototype.setMessageProperty = function (path, propertyName, propertyValue) {
        Contracts_1.Contracts.throwIfNullOrWhitespace(propertyName, "propertyName");
        if (this.privInternalData instanceof Exports_1.ServiceRecognizerBase) {
            if (path.toLowerCase() !== "speech.context") {
                throw new Error("Only speech.context message property sets are currently supported for recognizer");
            }
            else {
                this.privInternalData.speechContext.setSection(propertyName, propertyValue);
            }
        }
        else if (this.privInternalData instanceof Exports_1.SynthesisAdapterBase) {
            if (path.toLowerCase() !== "synthesis.context") {
                throw new Error("Only synthesis.context message property sets are currently supported for synthesizer");
            }
            else {
                this.privInternalData.synthesisContext.setSection(propertyName, propertyValue);
            }
        }
    };
    /**
     * Sends a message to the speech service.
     * Added in version 1.13.0.
     * @param path The WebSocket path of the message
     * @param payload The payload of the message. This is a json string or a ArrayBuffer.
     * @param success A callback to indicate success.
     * @param error A callback to indicate an error.
     */
    Connection.prototype.sendMessageAsync = function (path, payload, success, error) {
        Exports_2.marshalPromiseToCallbacks(this.privInternalData.sendNetworkMessage(path, payload), success, error);
    };
    /**
     * Dispose of associated resources.
     */
    Connection.prototype.close = function () {
        /* tslint:disable:no-empty */
    };
    Connection.prototype.setupEvents = function () {
        var _this = this;
        this.privEventListener = this.privInternalData.connectionEvents.attach(function (connectionEvent) {
            if (connectionEvent.name === "ConnectionEstablishedEvent") {
                if (!!_this.connected) {
                    _this.connected(new Exports_3.ConnectionEventArgs(connectionEvent.connectionId));
                }
            }
            else if (connectionEvent.name === "ConnectionClosedEvent") {
                if (!!_this.disconnected) {
                    _this.disconnected(new Exports_3.ConnectionEventArgs(connectionEvent.connectionId));
                }
            }
            else if (connectionEvent.name === "ConnectionMessageSentEvent") {
                if (!!_this.messageSent) {
                    _this.messageSent(new Exports_3.ConnectionMessageEventArgs(new ConnectionMessage_1.ConnectionMessageImpl(connectionEvent.message)));
                }
            }
            else if (connectionEvent.name === "ConnectionMessageReceivedEvent") {
                if (!!_this.messageReceived) {
                    _this.messageReceived(new Exports_3.ConnectionMessageEventArgs(new ConnectionMessage_1.ConnectionMessageImpl(connectionEvent.message)));
                }
            }
        });
        this.privServiceEventListener = this.privInternalData.serviceEvents.attach(function (e) {
            if (!!_this.receivedServiceMessage) {
                _this.receivedServiceMessage(new Exports_3.ServiceEventArgs(e.jsonString, e.name));
            }
        });
    };
    return Connection;
}());
exports.Connection = Connection;

//# sourceMappingURL=Connection.js.map