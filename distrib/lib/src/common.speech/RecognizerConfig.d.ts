import { PropertyCollection } from "../sdk/Exports";
export declare enum RecognitionMode {
    Interactive = 0,
    Conversation = 1,
    Dictation = 2
}
export declare enum SpeechResultFormat {
    Simple = 0,
    Detailed = 1
}
export declare class RecognizerConfig {
    private privRecognitionMode;
    private privSpeechServiceConfig;
    private privRecognitionActivityTimeout;
    private privParameters;
    constructor(speechServiceConfig: SpeechServiceConfig, parameters: PropertyCollection);
    get parameters(): PropertyCollection;
    get recognitionMode(): RecognitionMode;
    set recognitionMode(value: RecognitionMode);
    get SpeechServiceConfig(): SpeechServiceConfig;
    get recognitionActivityTimeout(): number;
    get isContinuousRecognition(): boolean;
    get autoDetectSourceLanguages(): string;
}
export declare class SpeechServiceConfig {
    private context;
    private recognition;
    constructor(context: Context);
    serialize: () => string;
    get Context(): Context;
    get Recognition(): string;
    set Recognition(value: string);
}
export declare class Context {
    system: System;
    os: OS;
    audio: ISpeechConfigAudio;
    constructor(os: OS);
}
export declare class System {
    name: string;
    version: string;
    build: string;
    lang: string;
    constructor();
}
export declare class OS {
    platform: string;
    name: string;
    version: string;
    constructor(platform: string, name: string, version: string);
}
export declare class Device {
    manufacturer: string;
    model: string;
    version: string;
    constructor(manufacturer: string, model: string, version: string);
}
export interface ISpeechConfigAudio {
    source?: ISpeechConfigAudioDevice;
    playback?: ISpeechConfigAudioDevice;
}
export interface ISpeechConfigAudioDevice {
    manufacturer: string;
    model: string;
    connectivity: connectivity;
    type: type;
    samplerate: number;
    bitspersample: number;
    channelcount: number;
}
export declare enum connectivity {
    Bluetooth = "Bluetooth",
    Wired = "Wired",
    WiFi = "WiFi",
    Cellular = "Cellular",
    InBuilt = "InBuilt",
    Unknown = "Unknown"
}
export declare enum type {
    Phone = "Phone",
    Speaker = "Speaker",
    Car = "Car",
    Headset = "Headset",
    Thermostat = "Thermostat",
    Microphones = "Microphones",
    Deskphone = "Deskphone",
    RemoteControl = "RemoteControl",
    Unknown = "Unknown",
    File = "File",
    Stream = "Stream"
}