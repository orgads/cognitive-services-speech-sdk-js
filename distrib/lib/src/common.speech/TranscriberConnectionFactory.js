"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = require("../common.browser/Exports");
var Exports_2 = require("../sdk/Exports");
var ConnectionFactoryBase_1 = require("./ConnectionFactoryBase");
var Exports_3 = require("./Exports");
var HeaderNames_1 = require("./HeaderNames");
var QueryParameterNames_1 = require("./QueryParameterNames");
var TranscriberConnectionFactory = /** @class */ (function (_super) {
    __extends(TranscriberConnectionFactory, _super);
    function TranscriberConnectionFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.multiaudioRelativeUri = "/speech/recognition/multiaudio";
        _this.create = function (config, authInfo, connectionId) {
            var endpoint = config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_Endpoint, undefined);
            var region = config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_Region, "centralus");
            var hostSuffix = (region && region.toLowerCase().startsWith("china")) ? ".azure.cn" : ".microsoft.com";
            var hostDefault = "wss://transcribe." + region + ".cts.speech" + hostSuffix + _this.multiaudioRelativeUri;
            var host = config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_Host, hostDefault);
            var queryParams = {};
            var endpointId = config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_EndpointId, undefined);
            var language = config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_RecoLanguage, undefined);
            if (endpointId) {
                if (!endpoint || endpoint.search(QueryParameterNames_1.QueryParameterNames.CustomSpeechDeploymentId) === -1) {
                    queryParams[QueryParameterNames_1.QueryParameterNames.CustomSpeechDeploymentId] = endpointId;
                }
            }
            else if (language) {
                if (!endpoint || endpoint.search(QueryParameterNames_1.QueryParameterNames.Language) === -1) {
                    queryParams[QueryParameterNames_1.QueryParameterNames.Language] = language;
                }
            }
            _this.setCommonUrlParams(config, queryParams, endpoint);
            if (!endpoint) {
                endpoint = host;
            }
            var headers = {};
            if (authInfo.token !== undefined && authInfo.token !== "") {
                headers[authInfo.headerName] = authInfo.token;
            }
            headers[HeaderNames_1.HeaderNames.ConnectionId] = connectionId;
            config.parameters.setProperty(Exports_2.PropertyId.SpeechServiceConnection_Url, endpoint);
            var enableCompression = config.parameters.getProperty("SPEECH-EnableWebsocketCompression", "false") === "true";
            return new Exports_1.WebsocketConnection(endpoint, queryParams, headers, new Exports_3.WebsocketMessageFormatter(), Exports_1.ProxyInfo.fromRecognizerConfig(config), enableCompression, connectionId);
        };
        return _this;
    }
    return TranscriberConnectionFactory;
}(ConnectionFactoryBase_1.ConnectionFactoryBase));
exports.TranscriberConnectionFactory = TranscriberConnectionFactory;

//# sourceMappingURL=TranscriberConnectionFactory.js.map