"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:max-classes-per-file
var Exports_1 = require("../sdk/Exports");
var RecognitionMode;
(function (RecognitionMode) {
    RecognitionMode[RecognitionMode["Interactive"] = 0] = "Interactive";
    RecognitionMode[RecognitionMode["Conversation"] = 1] = "Conversation";
    RecognitionMode[RecognitionMode["Dictation"] = 2] = "Dictation";
})(RecognitionMode = exports.RecognitionMode || (exports.RecognitionMode = {}));
var SpeechResultFormat;
(function (SpeechResultFormat) {
    SpeechResultFormat[SpeechResultFormat["Simple"] = 0] = "Simple";
    SpeechResultFormat[SpeechResultFormat["Detailed"] = 1] = "Detailed";
})(SpeechResultFormat = exports.SpeechResultFormat || (exports.SpeechResultFormat = {}));
var RecognizerConfig = /** @class */ (function () {
    function RecognizerConfig(speechServiceConfig, parameters) {
        this.privRecognitionMode = RecognitionMode.Interactive;
        this.privSpeechServiceConfig = speechServiceConfig ? speechServiceConfig : new SpeechServiceConfig(new Context(null));
        this.privParameters = parameters;
    }
    Object.defineProperty(RecognizerConfig.prototype, "parameters", {
        get: function () {
            return this.privParameters;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognizerConfig.prototype, "recognitionMode", {
        get: function () {
            return this.privRecognitionMode;
        },
        set: function (value) {
            this.privRecognitionMode = value;
            this.privRecognitionActivityTimeout = value === RecognitionMode.Interactive ? 8000 : 25000;
            this.privSpeechServiceConfig.Recognition = RecognitionMode[value];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognizerConfig.prototype, "SpeechServiceConfig", {
        get: function () {
            return this.privSpeechServiceConfig;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognizerConfig.prototype, "recognitionActivityTimeout", {
        get: function () {
            return this.privRecognitionActivityTimeout;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognizerConfig.prototype, "isContinuousRecognition", {
        get: function () {
            return this.privRecognitionMode !== RecognitionMode.Interactive;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RecognizerConfig.prototype, "autoDetectSourceLanguages", {
        get: function () {
            return this.parameters.getProperty(Exports_1.PropertyId.SpeechServiceConnection_AutoDetectSourceLanguages, undefined);
        },
        enumerable: true,
        configurable: true
    });
    return RecognizerConfig;
}());
exports.RecognizerConfig = RecognizerConfig;
// The config is serialized and sent as the Speech.Config
var SpeechServiceConfig = /** @class */ (function () {
    function SpeechServiceConfig(context) {
        var _this = this;
        this.serialize = function () {
            return JSON.stringify(_this, function (key, value) {
                if (value && typeof value === "object") {
                    var replacement = {};
                    for (var k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            replacement[k && k.charAt(0).toLowerCase() + k.substring(1)] = value[k];
                        }
                    }
                    return replacement;
                }
                return value;
            });
        };
        this.context = context;
    }
    Object.defineProperty(SpeechServiceConfig.prototype, "Context", {
        get: function () {
            return this.context;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpeechServiceConfig.prototype, "Recognition", {
        get: function () {
            return this.recognition;
        },
        set: function (value) {
            this.recognition = value.toLowerCase();
        },
        enumerable: true,
        configurable: true
    });
    return SpeechServiceConfig;
}());
exports.SpeechServiceConfig = SpeechServiceConfig;
var Context = /** @class */ (function () {
    function Context(os) {
        this.system = new System();
        this.os = os;
    }
    return Context;
}());
exports.Context = Context;
var System = /** @class */ (function () {
    function System() {
        // Note: below will be patched for official builds.
        var SPEECHSDK_CLIENTSDK_VERSION = "1.15.0-alpha.0.1";
        this.name = "SpeechSDK";
        this.version = SPEECHSDK_CLIENTSDK_VERSION;
        this.build = "JavaScript";
        this.lang = "JavaScript";
    }
    return System;
}());
exports.System = System;
var OS = /** @class */ (function () {
    function OS(platform, name, version) {
        this.platform = platform;
        this.name = name;
        this.version = version;
    }
    return OS;
}());
exports.OS = OS;
var Device = /** @class */ (function () {
    function Device(manufacturer, model, version) {
        this.manufacturer = manufacturer;
        this.model = model;
        this.version = version;
    }
    return Device;
}());
exports.Device = Device;
var connectivity;
(function (connectivity) {
    connectivity["Bluetooth"] = "Bluetooth";
    connectivity["Wired"] = "Wired";
    connectivity["WiFi"] = "WiFi";
    connectivity["Cellular"] = "Cellular";
    connectivity["InBuilt"] = "InBuilt";
    connectivity["Unknown"] = "Unknown";
})(connectivity = exports.connectivity || (exports.connectivity = {}));
var type;
(function (type) {
    type["Phone"] = "Phone";
    type["Speaker"] = "Speaker";
    type["Car"] = "Car";
    type["Headset"] = "Headset";
    type["Thermostat"] = "Thermostat";
    type["Microphones"] = "Microphones";
    type["Deskphone"] = "Deskphone";
    type["RemoteControl"] = "RemoteControl";
    type["Unknown"] = "Unknown";
    type["File"] = "File";
    type["Stream"] = "Stream";
})(type = exports.type || (exports.type = {}));

//# sourceMappingURL=RecognizerConfig.js.map