// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { CognitiveSubscriptionKeyAuthentication, CognitiveTokenAuthentication, Context, OS, ServiceRecognizerBase, SpeechServiceConfig, } from "../common.speech/Exports";
import { Deferred, marshalPromiseToCallbacks } from "../common/Exports";
import { Contracts } from "./Contracts";
import { AudioConfig, PropertyId, } from "./Exports";
/**
 * Defines the base class Recognizer which mainly contains common event handlers.
 * @class Recognizer
 */
export class Recognizer {
    /**
     * Creates and initializes an instance of a Recognizer
     * @constructor
     * @param {AudioConfig} audioInput - An optional audio input stream associated with the recognizer
     */
    constructor(audioConfig, properties, connectionFactory) {
        this.audioConfig = (audioConfig !== undefined) ? audioConfig : AudioConfig.fromDefaultMicrophoneInput();
        this.privDisposed = false;
        this.privProperties = properties.clone();
        this.privConnectionFactory = connectionFactory;
        this.implCommonRecognizerSetup();
    }
    /**
     * Dispose of associated resources.
     * @member Recognizer.prototype.close
     * @function
     * @public
     */
    close(cb, errorCb) {
        Contracts.throwIfDisposed(this.privDisposed);
        marshalPromiseToCallbacks(this.dispose(true), cb, errorCb);
    }
    /**
     * @Internal
     * Internal data member to support fromRecognizer* pattern methods on other classes.
     * Do not use externally, object returned will change without warning or notice.
     */
    get internalData() {
        return this.privReco;
    }
    /**
     * This method performs cleanup of resources.
     * The Boolean parameter disposing indicates whether the method is called
     * from Dispose (if disposing is true) or from the finalizer (if disposing is false).
     * Derived classes should override this method to dispose resource if needed.
     * @member Recognizer.prototype.dispose
     * @function
     * @public
     * @param {boolean} disposing - Flag to request disposal.
     */
    async dispose(disposing) {
        if (this.privDisposed) {
            return;
        }
        this.privDisposed = true;
        if (disposing) {
            if (this.privReco) {
                await this.privReco.audioSource.turnOff();
                await this.privReco.dispose();
            }
        }
    }
    /**
     * This method returns the current state of the telemetry setting.
     * @member Recognizer.prototype.telemetryEnabled
     * @function
     * @public
     * @returns true if the telemetry is enabled, false otherwise.
     */
    static get telemetryEnabled() {
        return ServiceRecognizerBase.telemetryDataEnabled;
    }
    /**
     * This method globally enables or disables telemetry.
     * @member Recognizer.prototype.enableTelemetry
     * @function
     * @public
     * @param enabled - Global setting for telemetry collection.
     * If set to true, telemetry information like microphone errors,
     * recognition errors are collected and sent to Microsoft.
     * If set to false, no telemetry is sent to Microsoft.
     */
    /* tslint:disable:member-ordering */
    static enableTelemetry(enabled) {
        ServiceRecognizerBase.telemetryDataEnabled = enabled;
    }
    // Does the generic recognizer setup that is common across all recognizer types.
    implCommonRecognizerSetup() {
        let osPlatform = (typeof window !== "undefined") ? "Browser" : "Node";
        let osName = "unknown";
        let osVersion = "unknown";
        if (typeof navigator !== "undefined") {
            osPlatform = osPlatform + "/" + navigator.platform;
            osName = navigator.userAgent;
            osVersion = navigator.appVersion;
        }
        const recognizerConfig = this.createRecognizerConfig(new SpeechServiceConfig(new Context(new OS(osPlatform, osName, osVersion))));
        this.privReco = this.createServiceRecognizer(Recognizer.getAuthFromProperties(this.privProperties), this.privConnectionFactory, this.audioConfig, recognizerConfig);
    }
    async recognizeOnceAsyncImpl(recognitionMode) {
        Contracts.throwIfDisposed(this.privDisposed);
        const ret = new Deferred();
        await this.implRecognizerStop();
        await this.privReco.recognize(recognitionMode, ret.resolve, ret.reject);
        const result = await ret.promise;
        await this.implRecognizerStop();
        return result;
    }
    async startContinuousRecognitionAsyncImpl(recognitionMode) {
        Contracts.throwIfDisposed(this.privDisposed);
        await this.implRecognizerStop();
        await this.privReco.recognize(recognitionMode, undefined, undefined);
    }
    async stopContinuousRecognitionAsyncImpl() {
        Contracts.throwIfDisposed(this.privDisposed);
        await this.implRecognizerStop();
    }
    async implRecognizerStop() {
        if (this.privReco) {
            await this.privReco.stopRecognizing();
        }
        return;
    }
    static getAuthFromProperties(properties) {
        const subscriptionKey = properties.getProperty(PropertyId.SpeechServiceConnection_Key, undefined);
        const authentication = (subscriptionKey && subscriptionKey !== "") ?
            new CognitiveSubscriptionKeyAuthentication(subscriptionKey) :
            new CognitiveTokenAuthentication((authFetchEventId) => {
                const authorizationToken = properties.getProperty(PropertyId.SpeechServiceAuthorization_Token, undefined);
                return Promise.resolve(authorizationToken);
            }, (authFetchEventId) => {
                const authorizationToken = properties.getProperty(PropertyId.SpeechServiceAuthorization_Token, undefined);
                return Promise.resolve(authorizationToken);
            });
        return authentication;
    }
}

//# sourceMappingURL=Recognizer.js.map