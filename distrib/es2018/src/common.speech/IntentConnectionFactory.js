// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { ProxyInfo, WebsocketConnection, } from "../common.browser/Exports";
import { PropertyId } from "../sdk/Exports";
import { ConnectionFactoryBase } from "./ConnectionFactoryBase";
import { WebsocketMessageFormatter, } from "./Exports";
import { HeaderNames } from "./HeaderNames";
export class IntentConnectionFactory extends ConnectionFactoryBase {
    constructor() {
        super(...arguments);
        this.create = (config, authInfo, connectionId) => {
            let endpoint = config.parameters.getProperty(PropertyId.SpeechServiceConnection_Endpoint);
            if (!endpoint) {
                const region = config.parameters.getProperty(PropertyId.SpeechServiceConnection_IntentRegion);
                const hostSuffix = (region && region.toLowerCase().startsWith("china")) ? ".azure.cn" : ".microsoft.com";
                const host = config.parameters.getProperty(PropertyId.SpeechServiceConnection_Host, "wss://" + region + ".sr.speech" + hostSuffix);
                endpoint = host + "/speech/recognition/interactive/cognitiveservices/v1";
            }
            const queryParams = {
                format: "simple",
                language: config.parameters.getProperty(PropertyId.SpeechServiceConnection_RecoLanguage),
            };
            this.setCommonUrlParams(config, queryParams, endpoint);
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
    getSpeechRegionFromIntentRegion(intentRegion) {
        switch (intentRegion) {
            case "West US":
            case "US West":
            case "westus":
                return "uswest";
            case "West US 2":
            case "US West 2":
            case "westus2":
                return "uswest2";
            case "South Central US":
            case "US South Central":
            case "southcentralus":
                return "ussouthcentral";
            case "West Central US":
            case "US West Central":
            case "westcentralus":
                return "uswestcentral";
            case "East US":
            case "US East":
            case "eastus":
                return "useast";
            case "East US 2":
            case "US East 2":
            case "eastus2":
                return "useast2";
            case "West Europe":
            case "Europe West":
            case "westeurope":
                return "europewest";
            case "North Europe":
            case "Europe North":
            case "northeurope":
                return "europenorth";
            case "Brazil South":
            case "South Brazil":
            case "southbrazil":
                return "brazilsouth";
            case "Australia East":
            case "East Australia":
            case "eastaustralia":
                return "australiaeast";
            case "Southeast Asia":
            case "Asia Southeast":
            case "southeastasia":
                return "asiasoutheast";
            case "East Asia":
            case "Asia East":
            case "eastasia":
                return "asiaeast";
            default:
                return intentRegion;
        }
    }
}

//# sourceMappingURL=IntentConnectionFactory.js.map