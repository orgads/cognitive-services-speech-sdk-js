// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
var _a;
import { Contracts } from "./Contracts";
import { PropertyId, SpeechConfigImpl } from "./Exports";
/**
 * Class that defines base configurations for dialog service connector
 * @class DialogServiceConfig
 */
export class DialogServiceConfig {
    /**
     * Creates an instance of DialogService config.
     * @constructor
     */
    constructor() {
    }
    /**
     * Sets the corresponding backend application identifier.
     * @member DialogServiceConfig.prototype.Conversation_ApplicationId
     * @function
     * @public
     * @param {string} value - The application identifier to set.
     */
    // tslint:disable-next-line: no-empty
    set applicationId(value) { }
}
DialogServiceConfig.DialogTypes = (_a = class {
    },
    _a.BotFramework = "bot_framework",
    _a.CustomCommands = "custom_commands",
    _a);
/**
 * Dialog Service configuration.
 * @class DialogServiceConfigImpl
 */
// tslint:disable-next-line:max-classes-per-file
export class DialogServiceConfigImpl extends DialogServiceConfig {
    /**
     * Creates an instance of dialogService config.
     */
    constructor() {
        super();
        this.privSpeechConfig = new SpeechConfigImpl();
    }
    /**
     * Provides access to custom properties.
     * @member DialogServiceConfigImpl.prototype.properties
     * @function
     * @public
     * @returns {PropertyCollection} The properties.
     */
    get properties() {
        return this.privSpeechConfig.properties;
    }
    /**
     * Gets the speech recognition language.
     * @member DialogServiceConfigImpl.prototype.speechRecognitionLanguage
     * @function
     * @public
     */
    get speechRecognitionLanguage() {
        return this.privSpeechConfig.speechRecognitionLanguage;
    }
    /**
     * Sets the speech recognition language.
     * @member DialogServiceConfigImpl.prototype.speechRecognitionLanguage
     * @function
     * @public
     * @param {string} value - The language to set.
     */
    set speechRecognitionLanguage(value) {
        Contracts.throwIfNullOrWhitespace(value, "value");
        this.privSpeechConfig.speechRecognitionLanguage = value;
    }
    get outputFormat() {
        return this.privSpeechConfig.outputFormat;
    }
    set outputFormat(value) {
        this.privSpeechConfig.outputFormat = value;
    }
    /**
     * Sets a named property as value
     * @member DialogServiceConfigImpl.prototype.setProperty
     * @function
     * @public
     * @param {PropertyId | string} name - The property to set.
     * @param {string} value - The value.
     */
    setProperty(name, value) {
        this.privSpeechConfig.setProperty(name, value);
    }
    /**
     * Sets a named property as value
     * @member DialogServiceConfigImpl.prototype.getProperty
     * @function
     * @public
     * @param {PropertyId | string} name - The property to get.
     * @param {string} def - The default value to return in case the property is not known.
     * @returns {string} The current value, or provided default, of the given property.
     */
    getProperty(name, def) {
        return this.privSpeechConfig.getProperty(name);
    }
    /**
     * Sets the proxy configuration.
     * Only relevant in Node.js environments.
     * Added in version 1.4.0.
     * @param proxyHostName The host name of the proxy server, without the protocol scheme (http://)
     * @param proxyPort The port number of the proxy server.
     * @param proxyUserName The user name of the proxy server.
     * @param proxyPassword The password of the proxy server.
     */
    setProxy(proxyHostName, proxyPort, proxyUserName, proxyPassword) {
        this.setProperty(PropertyId.SpeechServiceConnection_ProxyHostName, proxyHostName);
        this.setProperty(PropertyId.SpeechServiceConnection_ProxyPort, `${proxyPort}`);
        if (proxyUserName) {
            this.setProperty(PropertyId.SpeechServiceConnection_ProxyUserName, proxyUserName);
        }
        if (proxyPassword) {
            this.setProperty(PropertyId.SpeechServiceConnection_ProxyPassword, proxyPassword);
        }
    }
    setServiceProperty(name, value, channel) {
        this.privSpeechConfig.setServiceProperty(name, value, channel);
    }
    /**
     * Dispose of associated resources.
     * @member DialogServiceConfigImpl.prototype.close
     * @function
     * @public
     */
    close() {
        return;
    }
}

//# sourceMappingURL=DialogServiceConfig.js.map