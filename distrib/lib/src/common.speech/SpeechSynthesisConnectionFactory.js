"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = require("../common.browser/Exports");
var Exports_2 = require("../sdk/Exports");
var Exports_3 = require("./Exports");
var HeaderNames_1 = require("./HeaderNames");
var QueryParameterNames_1 = require("./QueryParameterNames");
var SpeechSynthesisConnectionFactory = /** @class */ (function () {
    function SpeechSynthesisConnectionFactory() {
        var _this = this;
        this.synthesisUri = "/cognitiveservices/websocket/v1";
        this.create = function (config, authInfo, connectionId) {
            var endpoint = config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_Endpoint, undefined);
            var region = config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_Region, undefined);
            var hostSuffix = (region && region.toLowerCase().startsWith("china")) ? ".azure.cn" : ".microsoft.com";
            var endpointId = config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_EndpointId, undefined);
            var hostPrefix = (endpointId === undefined) ? "tts" : "voice";
            var host = config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_Host, "wss://" + region + "." + hostPrefix + ".speech" + hostSuffix);
            var queryParams = {};
            if (!endpoint) {
                endpoint = host + _this.synthesisUri;
            }
            var headers = {};
            if (authInfo.token !== undefined && authInfo.token !== "") {
                headers[authInfo.headerName] = authInfo.token;
            }
            headers[HeaderNames_1.HeaderNames.ConnectionId] = connectionId;
            if (endpointId !== undefined) {
                headers[QueryParameterNames_1.QueryParameterNames.CustomVoiceDeploymentId] = endpointId;
            }
            config.parameters.setProperty(Exports_2.PropertyId.SpeechServiceConnection_Url, endpoint);
            var enableCompression = config.parameters.getProperty("SPEECH-EnableWebsocketCompression", "false") === "true";
            return new Exports_1.WebsocketConnection(endpoint, queryParams, headers, new Exports_3.WebsocketMessageFormatter(), Exports_1.ProxyInfo.fromParameters(config.parameters), enableCompression, connectionId);
        };
    }
    return SpeechSynthesisConnectionFactory;
}());
exports.SpeechSynthesisConnectionFactory = SpeechSynthesisConnectionFactory;

//# sourceMappingURL=SpeechSynthesisConnectionFactory.js.map