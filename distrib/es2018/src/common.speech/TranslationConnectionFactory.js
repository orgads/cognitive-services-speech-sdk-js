// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { ProxyInfo, WebsocketConnection, } from "../common.browser/Exports";
import { PropertyId } from "../sdk/Exports";
import { ConnectionFactoryBase } from "./ConnectionFactoryBase";
import { WebsocketMessageFormatter, } from "./Exports";
import { HeaderNames } from "./HeaderNames";
import { QueryParameterNames } from "./QueryParameterNames";
export class TranslationConnectionFactory extends ConnectionFactoryBase {
    constructor() {
        super(...arguments);
        this.create = (config, authInfo, connectionId) => {
            let endpoint = config.parameters.getProperty(PropertyId.SpeechServiceConnection_Endpoint, undefined);
            if (!endpoint) {
                const region = config.parameters.getProperty(PropertyId.SpeechServiceConnection_Region, undefined);
                const hostSuffix = (region && region.toLowerCase().startsWith("china")) ? ".azure.cn" : ".microsoft.com";
                const host = config.parameters.getProperty(PropertyId.SpeechServiceConnection_Host, "wss://" + region + ".s2s.speech" + hostSuffix);
                endpoint = host + "/speech/translation/cognitiveservices/v1";
            }
            const queryParams = {
                from: config.parameters.getProperty(PropertyId.SpeechServiceConnection_RecoLanguage),
                to: config.parameters.getProperty(PropertyId.SpeechServiceConnection_TranslationToLanguages),
            };
            this.setCommonUrlParams(config, queryParams, endpoint);
            this.setUrlParameter(PropertyId.SpeechServiceResponse_TranslationRequestStablePartialResult, QueryParameterNames.StableTranslation, config, queryParams, endpoint);
            const voiceName = "voice";
            const featureName = "features";
            if (config.parameters.getProperty(PropertyId.SpeechServiceConnection_TranslationVoice, undefined) !== undefined) {
                queryParams[voiceName] = config.parameters.getProperty(PropertyId.SpeechServiceConnection_TranslationVoice);
                queryParams[featureName] = "texttospeech";
            }
            const headers = {};
            if (authInfo.token !== undefined && authInfo.token !== "") {
                headers[authInfo.headerName] = authInfo.token;
            }
            headers[HeaderNames.ConnectionId] = connectionId;
            config.parameters.setProperty(PropertyId.SpeechServiceConnection_Url, endpoint);
            const enableCompression = config.parameters.getProperty("SPEECH-EnableWebsocketCompression", "false") === "true";
            return new WebsocketConnection(endpoint, queryParams, headers, new WebsocketMessageFormatter(), ProxyInfo.fromRecognizerConfig(config), enableCompression, connectionId);
        };
    }
}

//# sourceMappingURL=TranslationConnectionFactory.js.map