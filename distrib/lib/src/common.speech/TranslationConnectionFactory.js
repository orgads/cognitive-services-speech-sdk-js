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
var TranslationConnectionFactory = /** @class */ (function (_super) {
    __extends(TranslationConnectionFactory, _super);
    function TranslationConnectionFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.create = function (config, authInfo, connectionId) {
            var endpoint = config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_Endpoint, undefined);
            if (!endpoint) {
                var region = config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_Region, undefined);
                var hostSuffix = (region && region.toLowerCase().startsWith("china")) ? ".azure.cn" : ".microsoft.com";
                var host = config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_Host, "wss://" + region + ".s2s.speech" + hostSuffix);
                endpoint = host + "/speech/translation/cognitiveservices/v1";
            }
            var queryParams = {
                from: config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_RecoLanguage),
                to: config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_TranslationToLanguages),
            };
            _this.setCommonUrlParams(config, queryParams, endpoint);
            _this.setUrlParameter(Exports_2.PropertyId.SpeechServiceResponse_TranslationRequestStablePartialResult, QueryParameterNames_1.QueryParameterNames.StableTranslation, config, queryParams, endpoint);
            var voiceName = "voice";
            var featureName = "features";
            if (config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_TranslationVoice, undefined) !== undefined) {
                queryParams[voiceName] = config.parameters.getProperty(Exports_2.PropertyId.SpeechServiceConnection_TranslationVoice);
                queryParams[featureName] = "texttospeech";
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
    return TranslationConnectionFactory;
}(ConnectionFactoryBase_1.ConnectionFactoryBase));
exports.TranslationConnectionFactory = TranslationConnectionFactory;

//# sourceMappingURL=TranslationConnectionFactory.js.map