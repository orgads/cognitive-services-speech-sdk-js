"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
var Exports_1 = require("../common.speech/Exports");
var Exports_2 = require("../sdk/Exports");
var QueryParameterNames_1 = require("./QueryParameterNames");
var ConnectionFactoryBase = /** @class */ (function () {
    function ConnectionFactoryBase() {
    }
    ConnectionFactoryBase.prototype.setCommonUrlParams = function (config, queryParams, endpoint) {
        this.setUrlParameter(Exports_2.PropertyId.SpeechServiceConnection_EnableAudioLogging, QueryParameterNames_1.QueryParameterNames.EnableAudioLogging, config, queryParams, endpoint);
        this.setUrlParameter(Exports_2.PropertyId.SpeechServiceResponse_RequestWordLevelTimestamps, QueryParameterNames_1.QueryParameterNames.EnableWordLevelTimestamps, config, queryParams, endpoint);
        this.setUrlParameter(Exports_2.PropertyId.SpeechServiceResponse_ProfanityOption, QueryParameterNames_1.QueryParameterNames.Profanity, config, queryParams, endpoint);
        this.setUrlParameter(Exports_2.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, QueryParameterNames_1.QueryParameterNames.InitialSilenceTimeoutMs, config, queryParams, endpoint);
        this.setUrlParameter(Exports_2.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, QueryParameterNames_1.QueryParameterNames.EndSilenceTimeoutMs, config, queryParams, endpoint);
        this.setUrlParameter(Exports_2.PropertyId.SpeechServiceResponse_StablePartialResultThreshold, QueryParameterNames_1.QueryParameterNames.StableIntermediateThreshold, config, queryParams, endpoint);
        var serviceProperties = JSON.parse(config.parameters.getProperty(Exports_1.ServicePropertiesPropertyName, "{}"));
        Object.keys(serviceProperties).forEach(function (value, num, array) {
            queryParams[value] = serviceProperties[value];
        });
    };
    ConnectionFactoryBase.prototype.setUrlParameter = function (propId, parameterName, config, queryParams, endpoint) {
        var value = config.parameters.getProperty(propId, undefined);
        if (value && (!endpoint || endpoint.search(parameterName) === -1)) {
            queryParams[parameterName] = value.toLocaleLowerCase();
        }
    };
    return ConnectionFactoryBase;
}());
exports.ConnectionFactoryBase = ConnectionFactoryBase;

//# sourceMappingURL=ConnectionFactoryBase.js.map