// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { AutoDetectSourceLanguagesOpenRangeOptionName, CognitiveSubscriptionKeyAuthentication, CognitiveTokenAuthentication, Context, OS, SpeechServiceConfig, SpeechSynthesisConnectionFactory, SynthesisAdapterBase, SynthesizerConfig, } from "../common.speech/Exports";
import { createNoDashGuid, marshalPromiseToCallbacks, Queue } from "../common/Exports";
import { AudioFileWriter } from "./Audio/AudioFileWriter";
import { AudioOutputFormatImpl } from "./Audio/AudioOutputFormat";
import { PushAudioOutputStreamImpl } from "./Audio/AudioOutputStream";
import { Contracts } from "./Contracts";
import { AudioConfig, PropertyId, PullAudioOutputStream, PushAudioOutputStreamCallback, SpeechSynthesisOutputFormat, } from "./Exports";
/**
 * Defines the class SpeechSynthesizer for text to speech.
 * Added in version 1.11.0
 * @class SpeechSynthesizer
 */
export class SpeechSynthesizer {
    /**
     * SpeechSynthesizer constructor.
     * @constructor
     * @param {SpeechConfig} speechConfig - An set of initial properties for this synthesizer.
     * @param {AudioConfig} audioConfig - An optional audio configuration associated with the synthesizer.
     */
    constructor(speechConfig, audioConfig) {
        const speechConfigImpl = speechConfig;
        Contracts.throwIfNull(speechConfigImpl, "speechConfig");
        if (audioConfig !== null) {
            if (audioConfig === undefined) {
                this.audioConfig = (typeof window === "undefined") ? undefined : AudioConfig.fromDefaultSpeakerOutput();
            }
            else {
                this.audioConfig = audioConfig;
            }
        }
        this.privProperties = speechConfigImpl.properties.clone();
        this.privDisposed = false;
        this.privSynthesizing = false;
        this.privConnectionFactory = new SpeechSynthesisConnectionFactory();
        this.synthesisRequestQueue = new Queue();
        this.implCommonSynthesizeSetup();
    }
    /**
     * Gets the authorization token used to communicate with the service.
     * @member SpeechSynthesizer.prototype.authorizationToken
     * @function
     * @public
     * @returns {string} Authorization token.
     */
    get authorizationToken() {
        return this.properties.getProperty(PropertyId.SpeechServiceAuthorization_Token);
    }
    /**
     * Gets/Sets the authorization token used to communicate with the service.
     * @member SpeechSynthesizer.prototype.authorizationToken
     * @function
     * @public
     * @param {string} token - Authorization token.
     */
    set authorizationToken(token) {
        Contracts.throwIfNullOrWhitespace(token, "token");
        this.properties.setProperty(PropertyId.SpeechServiceAuthorization_Token, token);
    }
    /**
     * The collection of properties and their values defined for this SpeechSynthesizer.
     * @member SpeechSynthesizer.prototype.properties
     * @function
     * @public
     * @returns {PropertyCollection} The collection of properties and their values defined for this SpeechSynthesizer.
     */
    get properties() {
        return this.privProperties;
    }
    /**
     * Indicates if auto detect source language is enabled
     * @member SpeechSynthesizer.prototype.properties
     * @function
     * @public
     * @returns {boolean} if auto detect source language is enabled
     */
    get autoDetectSourceLanguage() {
        return this.properties.getProperty(PropertyId.SpeechServiceConnection_AutoDetectSourceLanguages) === AutoDetectSourceLanguagesOpenRangeOptionName;
    }
    /**
     * SpeechSynthesizer constructor.
     * @constructor
     * @param {SpeechConfig} speechConfig - an set of initial properties for this synthesizer
     * @param {AutoDetectSourceLanguageConfig} autoDetectSourceLanguageConfig - An source language detection configuration associated with the synthesizer
     * @param {AudioConfig} audioConfig - An optional audio configuration associated with the synthesizer
     */
    static FromConfig(speechConfig, autoDetectSourceLanguageConfig, audioConfig) {
        const speechConfigImpl = speechConfig;
        autoDetectSourceLanguageConfig.properties.mergeTo(speechConfigImpl.properties);
        return new SpeechSynthesizer(speechConfig, audioConfig);
    }
    buildSsml(text) {
        const languageToDefaultVoice = {
            ["ar-EG"]: "Microsoft Server Speech Text to Speech Voice (ar-EG, Hoda)",
            ["ar-SA"]: "Microsoft Server Speech Text to Speech Voice (ar-SA, Naayf)",
            ["bg-BG"]: "Microsoft Server Speech Text to Speech Voice (bg-BG, Ivan)",
            ["ca-ES"]: "Microsoft Server Speech Text to Speech Voice (ca-ES, HerenaRUS)",
            ["cs-CZ"]: "Microsoft Server Speech Text to Speech Voice (cs-CZ, Jakub)",
            ["da-DK"]: "Microsoft Server Speech Text to Speech Voice (da-DK, HelleRUS)",
            ["de-AT"]: "Microsoft Server Speech Text to Speech Voice (de-AT, Michael)",
            ["de-CH"]: "Microsoft Server Speech Text to Speech Voice (de-CH, Karsten)",
            ["de-DE"]: "Microsoft Server Speech Text to Speech Voice (de-DE, HeddaRUS)",
            ["el-GR"]: "Microsoft Server Speech Text to Speech Voice (el-GR, Stefanos)",
            ["en-AU"]: "Microsoft Server Speech Text to Speech Voice (en-AU, HayleyRUS)",
            ["en-CA"]: "Microsoft Server Speech Text to Speech Voice (en-CA, HeatherRUS)",
            ["en-GB"]: "Microsoft Server Speech Text to Speech Voice (en-GB, HazelRUS)",
            ["en-IE"]: "Microsoft Server Speech Text to Speech Voice (en-IE, Sean)",
            ["en-IN"]: "Microsoft Server Speech Text to Speech Voice (en-IN, PriyaRUS)",
            ["en-US"]: "Microsoft Server Speech Text to Speech Voice (en-US, AriaRUS)",
            ["es-ES"]: "Microsoft Server Speech Text to Speech Voice (es-ES, HelenaRUS)",
            ["es-MX"]: "Microsoft Server Speech Text to Speech Voice (es-MX, HildaRUS)",
            ["fi-FI"]: "Microsoft Server Speech Text to Speech Voice (fi-FI, HeidiRUS)",
            ["fr-CA"]: "Microsoft Server Speech Text to Speech Voice (fr-CA, HarmonieRUS)",
            ["fr-CH"]: "Microsoft Server Speech Text to Speech Voice (fr-CH, Guillaume)",
            ["fr-FR"]: "Microsoft Server Speech Text to Speech Voice (fr-FR, HortenseRUS)",
            ["he-IL"]: "Microsoft Server Speech Text to Speech Voice (he-IL, Asaf)",
            ["hi-IN"]: "Microsoft Server Speech Text to Speech Voice (hi-IN, Kalpana)",
            ["hr-HR"]: "Microsoft Server Speech Text to Speech Voice (hr-HR, Matej)",
            ["hu-HU"]: "Microsoft Server Speech Text to Speech Voice (hu-HU, Szabolcs)",
            ["id-ID"]: "Microsoft Server Speech Text to Speech Voice (id-ID, Andika)",
            ["it-IT"]: "Microsoft Server Speech Text to Speech Voice (it-IT, LuciaRUS)",
            ["ja-JP"]: "Microsoft Server Speech Text to Speech Voice (ja-JP, HarukaRUS)",
            ["ko-KR"]: "Microsoft Server Speech Text to Speech Voice (ko-KR, HeamiRUS)",
            ["ms-MY"]: "Microsoft Server Speech Text to Speech Voice (ms-MY, Rizwan)",
            ["nb-NO"]: "Microsoft Server Speech Text to Speech Voice (nb-NO, HuldaRUS)",
            ["nl-NL"]: "Microsoft Server Speech Text to Speech Voice (nl-NL, HannaRUS)",
            ["pl-PL"]: "Microsoft Server Speech Text to Speech Voice (pl-PL, PaulinaRUS)",
            ["pt-BR"]: "Microsoft Server Speech Text to Speech Voice (pt-BR, HeloisaRUS)",
            ["pt-PT"]: "Microsoft Server Speech Text to Speech Voice (pt-PT, HeliaRUS)",
            ["ro-RO"]: "Microsoft Server Speech Text to Speech Voice (ro-RO, Andrei)",
            ["ru-RU"]: "Microsoft Server Speech Text to Speech Voice (ru-RU, EkaterinaRUS)",
            ["sk-SK"]: "Microsoft Server Speech Text to Speech Voice (sk-SK, Filip)",
            ["sl-SI"]: "Microsoft Server Speech Text to Speech Voice (sl-SI, Lado)",
            ["sv-SE"]: "Microsoft Server Speech Text to Speech Voice (sv-SE, HedvigRUS)",
            ["ta-IN"]: "Microsoft Server Speech Text to Speech Voice (ta-IN, Valluvar)",
            ["te-IN"]: "Microsoft Server Speech Text to Speech Voice (te-IN, Chitra)",
            ["th-TH"]: "Microsoft Server Speech Text to Speech Voice (th-TH, Pattara)",
            ["tr-TR"]: "Microsoft Server Speech Text to Speech Voice (tr-TR, SedaRUS)",
            ["vi-VN"]: "Microsoft Server Speech Text to Speech Voice (vi-VN, An)",
            ["zh-CN"]: "Microsoft Server Speech Text to Speech Voice (zh-CN, HuihuiRUS)",
            ["zh-HK"]: "Microsoft Server Speech Text to Speech Voice (zh-HK, TracyRUS)",
            ["zh-TW"]: "Microsoft Server Speech Text to Speech Voice (zh-TW, HanHanRUS)",
        };
        let language = this.properties.getProperty(PropertyId.SpeechServiceConnection_SynthLanguage, "en-US");
        let voice = this.properties.getProperty(PropertyId.SpeechServiceConnection_SynthVoice, "");
        let ssml = SpeechSynthesizer.XMLEncode(text);
        if (this.autoDetectSourceLanguage) {
            language = "en-US";
        }
        else {
            voice = voice || languageToDefaultVoice[language];
        }
        if (voice) {
            ssml = `<voice name='${voice}'>${ssml}</voice>`;
        }
        ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xmlns:emo='http://www.w3.org/2009/10/emotionml' xml:lang='${language}'>${ssml}</speak>`;
        return ssml;
    }
    /**
     * Executes speech synthesis on plain text.
     * The task returns the synthesis result.
     * @member SpeechSynthesizer.prototype.speakTextAsync
     * @function
     * @public
     * @param text - Text to be synthesized.
     * @param cb - Callback that received the SpeechSynthesisResult.
     * @param err - Callback invoked in case of an error.
     * @param stream - AudioOutputStream to receive the synthesized audio.
     */
    speakTextAsync(text, cb, err, stream) {
        this.speakImpl(text, false, cb, err, stream);
    }
    /**
     * Executes speech synthesis on SSML.
     * The task returns the synthesis result.
     * @member SpeechSynthesizer.prototype.speakSsmlAsync
     * @function
     * @public
     * @param ssml - SSML to be synthesized.
     * @param cb - Callback that received the SpeechSynthesisResult.
     * @param err - Callback invoked in case of an error.
     * @param stream - AudioOutputStream to receive the synthesized audio.
     */
    speakSsmlAsync(ssml, cb, err, stream) {
        this.speakImpl(ssml, true, cb, err, stream);
    }
    /**
     * Dispose of associated resources.
     * @member SpeechSynthesizer.prototype.close
     * @function
     * @public
     */
    close(cb, err) {
        Contracts.throwIfDisposed(this.privDisposed);
        marshalPromiseToCallbacks(this.dispose(true), cb, err);
    }
    /**
     * @Internal
     * Do not use externally, object returned will change without warning or notice.
     */
    get internalData() {
        return this.privAdapter;
    }
    /**
     * This method performs cleanup of resources.
     * The Boolean parameter disposing indicates whether the method is called
     * from Dispose (if disposing is true) or from the finalizer (if disposing is false).
     * Derived classes should override this method to dispose resource if needed.
     * @member SpeechSynthesizer.prototype.dispose
     * @function
     * @public
     * @param {boolean} disposing - Flag to request disposal.
     */
    async dispose(disposing) {
        if (this.privDisposed) {
            return;
        }
        if (disposing) {
            if (this.privAdapter) {
                await this.privAdapter.dispose();
            }
        }
        this.privDisposed = true;
    }
    //
    // ################################################################################################################
    // IMPLEMENTATION.
    // Move to independent class
    // ################################################################################################################
    //
    createSynthesizerConfig(speechConfig) {
        return new SynthesizerConfig(speechConfig, this.privProperties);
    }
    // Creates the synthesis adapter
    createSynthesisAdapter(authentication, connectionFactory, audioConfig, synthesizerConfig) {
        return new SynthesisAdapterBase(authentication, connectionFactory, synthesizerConfig, this, this.audioConfig);
    }
    implCommonSynthesizeSetup() {
        let osPlatform = (typeof window !== "undefined") ? "Browser" : "Node";
        let osName = "unknown";
        let osVersion = "unknown";
        if (typeof navigator !== "undefined") {
            osPlatform = osPlatform + "/" + navigator.platform;
            osName = navigator.userAgent;
            osVersion = navigator.appVersion;
        }
        const synthesizerConfig = this.createSynthesizerConfig(new SpeechServiceConfig(new Context(new OS(osPlatform, osName, osVersion))));
        const subscriptionKey = this.privProperties.getProperty(PropertyId.SpeechServiceConnection_Key, undefined);
        const authentication = (subscriptionKey && subscriptionKey !== "") ?
            new CognitiveSubscriptionKeyAuthentication(subscriptionKey) :
            new CognitiveTokenAuthentication((authFetchEventId) => {
                const authorizationToken = this.privProperties.getProperty(PropertyId.SpeechServiceAuthorization_Token, undefined);
                return Promise.resolve(authorizationToken);
            }, (authFetchEventId) => {
                const authorizationToken = this.privProperties.getProperty(PropertyId.SpeechServiceAuthorization_Token, undefined);
                return Promise.resolve(authorizationToken);
            });
        this.privAdapter = this.createSynthesisAdapter(authentication, this.privConnectionFactory, this.audioConfig, synthesizerConfig);
        this.privAdapter.audioOutputFormat = AudioOutputFormatImpl.fromSpeechSynthesisOutputFormat(SpeechSynthesisOutputFormat[this.properties.getProperty(PropertyId.SpeechServiceConnection_SynthOutputFormat, undefined)]);
    }
    speakImpl(text, IsSsml, cb, err, dataStream) {
        try {
            Contracts.throwIfDisposed(this.privDisposed);
            const requestId = createNoDashGuid();
            let audioDestination;
            if (dataStream instanceof PushAudioOutputStreamCallback) {
                audioDestination = new PushAudioOutputStreamImpl(dataStream);
            }
            else if (dataStream instanceof PullAudioOutputStream) {
                audioDestination = dataStream;
            }
            else if (dataStream !== undefined) {
                audioDestination = new AudioFileWriter(dataStream);
            }
            else {
                audioDestination = undefined;
            }
            this.synthesisRequestQueue.enqueue(new SynthesisRequest(requestId, text, IsSsml, (e) => {
                this.privSynthesizing = false;
                if (!!cb) {
                    try {
                        cb(e);
                    }
                    catch (e) {
                        if (!!err) {
                            err(e);
                        }
                    }
                }
                cb = undefined;
                /* tslint:disable:no-empty */
                this.adapterSpeak().catch(() => { });
            }, (e) => {
                if (!!err) {
                    err(e);
                }
            }, audioDestination));
            /* tslint:disable:no-empty */
            this.adapterSpeak().catch(() => { });
        }
        catch (error) {
            if (!!err) {
                if (error instanceof Error) {
                    const typedError = error;
                    err(typedError.name + ": " + typedError.message);
                }
                else {
                    err(error);
                }
            }
            // Destroy the synthesizer.
            /* tslint:disable:no-empty */
            this.dispose(true).catch(() => { });
        }
    }
    async adapterSpeak() {
        if (!this.privDisposed && !this.privSynthesizing) {
            this.privSynthesizing = true;
            const request = await this.synthesisRequestQueue.dequeue();
            return this.privAdapter.Speak(request.text, request.isSSML, request.requestId, request.cb, request.err, request.dataStream);
        }
    }
    static XMLEncode(text) {
        return text.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }
}
// tslint:disable-next-line:max-classes-per-file
export class SynthesisRequest {
    constructor(requestId, text, isSSML, cb, err, dataStream) {
        this.requestId = requestId;
        this.text = text;
        this.isSSML = isSSML;
        this.cb = cb;
        this.err = err;
        this.dataStream = dataStream;
    }
}

//# sourceMappingURL=SpeechSynthesizer.js.map