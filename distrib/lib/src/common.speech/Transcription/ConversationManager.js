"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
var Contracts_1 = require("../../sdk/Contracts");
var Exports_1 = require("../../sdk/Exports");
var ConversationConnectionConfig_1 = require("./ConversationConnectionConfig");
var ConversationUtils_1 = require("./ConversationUtils");
var ConversationManager = /** @class */ (function () {
    function ConversationManager() {
        //
        this.privRequestParams = ConversationConnectionConfig_1.ConversationConnectionConfig.configParams;
        this.privErrors = ConversationConnectionConfig_1.ConversationConnectionConfig.restErrors;
        this.privHost = ConversationConnectionConfig_1.ConversationConnectionConfig.host;
        this.privApiVersion = ConversationConnectionConfig_1.ConversationConnectionConfig.apiVersion;
        this.privRestPath = ConversationConnectionConfig_1.ConversationConnectionConfig.restPath;
    }
    /**
     * Make a POST request to the Conversation Manager service endpoint to create or join a conversation.
     * @param args
     * @param conversationCode
     * @param callback
     * @param errorCallback
     */
    ConversationManager.prototype.createOrJoin = function (args, conversationCode, cb, err) {
        var _this = this;
        try {
            Contracts_1.Contracts.throwIfNullOrUndefined(args, "args");
            var languageCode = args.getProperty(Exports_1.PropertyId.SpeechServiceConnection_RecoLanguage, ConversationConnectionConfig_1.ConversationConnectionConfig.defaultLanguageCode);
            var nickname = args.getProperty(Exports_1.PropertyId.ConversationTranslator_Name);
            var endpointHost = args.getProperty(Exports_1.PropertyId.ConversationTranslator_Host, this.privHost);
            var correlationId = args.getProperty(Exports_1.PropertyId.ConversationTranslator_CorrelationId);
            var subscriptionKey = args.getProperty(Exports_1.PropertyId.SpeechServiceConnection_Key);
            var subscriptionRegion = args.getProperty(Exports_1.PropertyId.SpeechServiceConnection_Region);
            var authToken = args.getProperty(Exports_1.PropertyId.SpeechServiceAuthorization_Token);
            Contracts_1.Contracts.throwIfNullOrWhitespace(languageCode, "languageCode");
            Contracts_1.Contracts.throwIfNullOrWhitespace(nickname, "nickname");
            Contracts_1.Contracts.throwIfNullOrWhitespace(endpointHost, "endpointHost");
            var queryParams = {};
            queryParams[this.privRequestParams.apiVersion] = this.privApiVersion;
            queryParams[this.privRequestParams.languageCode] = languageCode;
            queryParams[this.privRequestParams.nickname] = nickname;
            var headers = {};
            if (correlationId) {
                headers[this.privRequestParams.correlationId] = correlationId;
            }
            headers[this.privRequestParams.clientAppId] = ConversationConnectionConfig_1.ConversationConnectionConfig.clientAppId;
            if (conversationCode !== undefined) {
                queryParams[this.privRequestParams.roomId] = conversationCode;
            }
            else {
                Contracts_1.Contracts.throwIfNullOrUndefined(subscriptionRegion, this.privErrors.authInvalidSubscriptionRegion);
                headers[this.privRequestParams.subscriptionRegion] = subscriptionRegion;
                if (subscriptionKey) {
                    headers[this.privRequestParams.subscriptionKey] = subscriptionKey;
                }
                else if (authToken) {
                    headers[this.privRequestParams.authorization] = "Bearer " + authToken;
                }
                else {
                    Contracts_1.Contracts.throwIfNullOrUndefined(subscriptionKey, this.privErrors.authInvalidSubscriptionKey);
                }
            }
            var config = {};
            config.headers = headers;
            var endpoint = "https://" + endpointHost + this.privRestPath;
            // TODO: support a proxy and certificate validation
            ConversationUtils_1.request("post", endpoint, queryParams, null, config, function (response) {
                var requestId = ConversationUtils_1.extractHeaderValue(_this.privRequestParams.requestId, response.headers);
                if (!response.ok) {
                    if (!!err) {
                        // get the error
                        var errorMessage = _this.privErrors.invalidCreateJoinConversationResponse.replace("{status}", response.status.toString());
                        var errMessageRaw = void 0;
                        try {
                            errMessageRaw = JSON.parse(response.data);
                            errorMessage += " [" + errMessageRaw.error.code + ": " + errMessageRaw.error.message + "]";
                        }
                        catch (e) {
                            errorMessage += " [" + response.data + "]";
                        }
                        if (requestId) {
                            errorMessage += " " + requestId;
                        }
                        err(errorMessage);
                    }
                    return;
                }
                var conversation = JSON.parse(response.data);
                if (conversation) {
                    conversation.requestId = requestId;
                }
                if (!!cb) {
                    try {
                        cb(conversation);
                    }
                    catch (e) {
                        if (!!err) {
                            err(e);
                        }
                    }
                    cb = undefined;
                }
            });
        }
        catch (error) {
            if (!!err) {
                if (error instanceof Error) {
                    var typedError = error;
                    err(typedError.name + ": " + typedError.message);
                }
                else {
                    err(error);
                }
            }
        }
    };
    /**
     * Make a DELETE request to the Conversation Manager service endpoint to leave the conversation.
     * @param args
     * @param sessionToken
     * @param callback
     */
    ConversationManager.prototype.leave = function (args, sessionToken) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                Contracts_1.Contracts.throwIfNullOrUndefined(args, _this.privErrors.invalidArgs.replace("{arg}", "config"));
                Contracts_1.Contracts.throwIfNullOrWhitespace(sessionToken, _this.privErrors.invalidArgs.replace("{arg}", "token"));
                var endpointHost = args.getProperty(Exports_1.PropertyId.ConversationTranslator_Host, _this.privHost);
                var correlationId = args.getProperty(Exports_1.PropertyId.ConversationTranslator_CorrelationId);
                var queryParams = {};
                queryParams[_this.privRequestParams.apiVersion] = _this.privApiVersion;
                queryParams[_this.privRequestParams.sessionToken] = sessionToken;
                var headers = {};
                if (correlationId) {
                    headers[_this.privRequestParams.correlationId] = correlationId;
                }
                var config = {};
                config.headers = headers;
                var endpoint = "https://" + endpointHost + _this.privRestPath;
                // TODO: support a proxy and certificate validation
                ConversationUtils_1.request("delete", endpoint, queryParams, null, config, function (response) {
                    if (!response.ok) {
                        // ignore errors on delete
                    }
                    resolve();
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    var typedError = error;
                    reject(typedError.name + ": " + typedError.message);
                }
                else {
                    reject(error);
                }
            }
        });
    };
    return ConversationManager;
}());
exports.ConversationManager = ConversationManager;

//# sourceMappingURL=ConversationManager.js.map