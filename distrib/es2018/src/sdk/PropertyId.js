// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
/**
 * Defines speech property ids.
 * @class PropertyId
 */
export var PropertyId;
(function (PropertyId) {
    /**
     * The Cognitive Services Speech Service subscription Key. If you are using an intent recognizer, you need to specify
     * to specify the LUIS endpoint key for your particular LUIS app. Under normal circumstances, you shouldn't
     * have to use this property directly.
     * Instead, use [[SpeechConfig.fromSubscription]].
     * @member PropertyId.SpeechServiceConnection_Key
     */
    PropertyId[PropertyId["SpeechServiceConnection_Key"] = 0] = "SpeechServiceConnection_Key";
    /**
     * The Cognitive Services Speech Service endpoint (url). Under normal circumstances, you shouldn't
     * have to use this property directly.
     * Instead, use [[SpeechConfig.fromEndpoint]].
     * NOTE: This endpoint is not the same as the endpoint used to obtain an access token.
     * @member PropertyId.SpeechServiceConnection_Endpoint
     */
    PropertyId[PropertyId["SpeechServiceConnection_Endpoint"] = 1] = "SpeechServiceConnection_Endpoint";
    /**
     * The Cognitive Services Speech Service region. Under normal circumstances, you shouldn't have to
     * use this property directly.
     * Instead, use [[SpeechConfig.fromSubscription]], [[SpeechConfig.fromEndpoint]], [[SpeechConfig.fromAuthorizationToken]].
     * @member PropertyId.SpeechServiceConnection_Region
     */
    PropertyId[PropertyId["SpeechServiceConnection_Region"] = 2] = "SpeechServiceConnection_Region";
    /**
     * The Cognitive Services Speech Service authorization token (aka access token). Under normal circumstances,
     * you shouldn't have to use this property directly.
     * Instead, use [[SpeechConfig.fromAuthorizationToken]], [[SpeechRecognizer.authorizationToken]],
     * [[IntentRecognizer.authorizationToken]], [[TranslationRecognizer.authorizationToken]], [[SpeakerRecognizer.authorizationToken]].
     * @member PropertyId.SpeechServiceAuthorization_Token
     */
    PropertyId[PropertyId["SpeechServiceAuthorization_Token"] = 3] = "SpeechServiceAuthorization_Token";
    /**
     * The Cognitive Services Speech Service authorization type. Currently unused.
     * @member PropertyId.SpeechServiceAuthorization_Type
     */
    PropertyId[PropertyId["SpeechServiceAuthorization_Type"] = 4] = "SpeechServiceAuthorization_Type";
    /**
     * The Cognitive Services Speech Service endpoint id. Under normal circumstances, you shouldn't
     * have to use this property directly.
     * Instead, use [[SpeechConfig.endpointId]].
     * NOTE: The endpoint id is available in the Speech Portal, listed under Endpoint Details.
     * @member PropertyId.SpeechServiceConnection_EndpointId
     */
    PropertyId[PropertyId["SpeechServiceConnection_EndpointId"] = 5] = "SpeechServiceConnection_EndpointId";
    /**
     * The list of comma separated languages (BCP-47 format) used as target translation languages. Under normal circumstances,
     * you shouldn't have to use this property directly.
     * Instead use [[SpeechTranslationConfig.addTargetLanguage]],
     * [[SpeechTranslationConfig.targetLanguages]], [[TranslationRecognizer.targetLanguages]].
     * @member PropertyId.SpeechServiceConnection_TranslationToLanguages
     */
    PropertyId[PropertyId["SpeechServiceConnection_TranslationToLanguages"] = 6] = "SpeechServiceConnection_TranslationToLanguages";
    /**
     * The name of the Cognitive Service Text to Speech Service Voice. Under normal circumstances, you shouldn't have to use this
     * property directly.
     * Instead, use [[SpeechTranslationConfig.voiceName]].
     * NOTE: Valid voice names can be found <a href="https://aka.ms/csspeech/voicenames">here</a>.
     * @member PropertyId.SpeechServiceConnection_TranslationVoice
     */
    PropertyId[PropertyId["SpeechServiceConnection_TranslationVoice"] = 7] = "SpeechServiceConnection_TranslationVoice";
    /**
     * Translation features.
     * @member PropertyId.SpeechServiceConnection_TranslationFeatures
     */
    PropertyId[PropertyId["SpeechServiceConnection_TranslationFeatures"] = 8] = "SpeechServiceConnection_TranslationFeatures";
    /**
     * The Language Understanding Service Region. Under normal circumstances, you shouldn't have to use this property directly.
     * Instead, use [[LanguageUnderstandingModel]].
     * @member PropertyId.SpeechServiceConnection_IntentRegion
     */
    PropertyId[PropertyId["SpeechServiceConnection_IntentRegion"] = 9] = "SpeechServiceConnection_IntentRegion";
    /**
     * The host name of the proxy server used to connect to the Cognitive Services Speech Service. Only relevant in Node.js environments.
     * You shouldn't have to use this property directly.
     * Instead use <see cref="SpeechConfig.SetProxy(string,int,string,string)"/>.
     * Added in version 1.4.0.
     */
    PropertyId[PropertyId["SpeechServiceConnection_ProxyHostName"] = 10] = "SpeechServiceConnection_ProxyHostName";
    /**
     * The port of the proxy server used to connect to the Cognitive Services Speech Service. Only relevant in Node.js environments.
     * You shouldn't have to use this property directly.
     * Instead use <see cref="SpeechConfig.SetProxy(string,int,string,string)"/>.
     * Added in version 1.4.0.
     */
    PropertyId[PropertyId["SpeechServiceConnection_ProxyPort"] = 11] = "SpeechServiceConnection_ProxyPort";
    /**
     * The user name of the proxy server used to connect to the Cognitive Services Speech Service. Only relevant in Node.js environments.
     * You shouldn't have to use this property directly.
     * Instead use <see cref="SpeechConfig.SetProxy(string,int,string,string)"/>.
     * Added in version 1.4.0.
     */
    PropertyId[PropertyId["SpeechServiceConnection_ProxyUserName"] = 12] = "SpeechServiceConnection_ProxyUserName";
    /**
     * The password of the proxy server used to connect to the Cognitive Services Speech Service. Only relevant in Node.js environments.
     * You shouldn't have to use this property directly.
     * Instead use <see cref="SpeechConfig.SetProxy(string,int,string,string)"/>.
     * Added in version 1.4.0.
     */
    PropertyId[PropertyId["SpeechServiceConnection_ProxyPassword"] = 13] = "SpeechServiceConnection_ProxyPassword";
    /**
     * The Cognitive Services Speech Service recognition Mode. Can be "INTERACTIVE", "CONVERSATION", "DICTATION".
     * This property is intended to be read-only. The SDK is using it internally.
     * @member PropertyId.SpeechServiceConnection_RecoMode
     */
    PropertyId[PropertyId["SpeechServiceConnection_RecoMode"] = 14] = "SpeechServiceConnection_RecoMode";
    /**
     * The spoken language to be recognized (in BCP-47 format). Under normal circumstances, you shouldn't have to use this property
     * directly.
     * Instead, use [[SpeechConfig.speechRecognitionLanguage]].
     * @member PropertyId.SpeechServiceConnection_RecoLanguage
     */
    PropertyId[PropertyId["SpeechServiceConnection_RecoLanguage"] = 15] = "SpeechServiceConnection_RecoLanguage";
    /**
     * The session id. This id is a universally unique identifier (aka UUID) representing a specific binding of an audio input stream
     * and the underlying speech recognition instance to which it is bound. Under normal circumstances, you shouldn't have to use this
     * property directly.
     * Instead use [[SessionEventArgs.sessionId]].
     * @member PropertyId.Speech_SessionId
     */
    PropertyId[PropertyId["Speech_SessionId"] = 16] = "Speech_SessionId";
    /**
     * The spoken language to be synthesized (e.g. en-US)
     * @member PropertyId.SpeechServiceConnection_SynthLanguage
     */
    PropertyId[PropertyId["SpeechServiceConnection_SynthLanguage"] = 17] = "SpeechServiceConnection_SynthLanguage";
    /**
     * The name of the TTS voice to be used for speech synthesis
     * @member PropertyId.SpeechServiceConnection_SynthVoice
     */
    PropertyId[PropertyId["SpeechServiceConnection_SynthVoice"] = 18] = "SpeechServiceConnection_SynthVoice";
    /**
     * The string to specify TTS output audio format
     * @member PropertyId.SpeechServiceConnection_SynthOutputFormat
     */
    PropertyId[PropertyId["SpeechServiceConnection_SynthOutputFormat"] = 19] = "SpeechServiceConnection_SynthOutputFormat";
    /**
     * The list of comma separated languages used as possible source languages
     * Added in version 1.13.0
     * @member PropertyId.SpeechServiceConnection_AutoDetectSourceLanguages
     */
    PropertyId[PropertyId["SpeechServiceConnection_AutoDetectSourceLanguages"] = 20] = "SpeechServiceConnection_AutoDetectSourceLanguages";
    /**
     * The requested Cognitive Services Speech Service response output format (simple or detailed). Under normal circumstances, you shouldn't have
     * to use this property directly.
     * Instead use [[SpeechConfig.outputFormat]].
     * @member PropertyId.SpeechServiceResponse_RequestDetailedResultTrueFalse
     */
    PropertyId[PropertyId["SpeechServiceResponse_RequestDetailedResultTrueFalse"] = 21] = "SpeechServiceResponse_RequestDetailedResultTrueFalse";
    /**
     * The requested Cognitive Services Speech Service response output profanity level. Currently unused.
     * @member PropertyId.SpeechServiceResponse_RequestProfanityFilterTrueFalse
     */
    PropertyId[PropertyId["SpeechServiceResponse_RequestProfanityFilterTrueFalse"] = 22] = "SpeechServiceResponse_RequestProfanityFilterTrueFalse";
    /**
     * The Cognitive Services Speech Service response output (in JSON format). This property is available on recognition result objects only.
     * @member PropertyId.SpeechServiceResponse_JsonResult
     */
    PropertyId[PropertyId["SpeechServiceResponse_JsonResult"] = 23] = "SpeechServiceResponse_JsonResult";
    /**
     * The Cognitive Services Speech Service error details (in JSON format). Under normal circumstances, you shouldn't have to
     * use this property directly. Instead use [[CancellationDetails.errorDetails]].
     * @member PropertyId.SpeechServiceResponse_JsonErrorDetails
     */
    PropertyId[PropertyId["SpeechServiceResponse_JsonErrorDetails"] = 24] = "SpeechServiceResponse_JsonErrorDetails";
    /**
     * The cancellation reason. Currently unused.
     * @member PropertyId.CancellationDetails_Reason
     */
    PropertyId[PropertyId["CancellationDetails_Reason"] = 25] = "CancellationDetails_Reason";
    /**
     * The cancellation text. Currently unused.
     * @member PropertyId.CancellationDetails_ReasonText
     */
    PropertyId[PropertyId["CancellationDetails_ReasonText"] = 26] = "CancellationDetails_ReasonText";
    /**
     * The Cancellation detailed text. Currently unused.
     * @member PropertyId.CancellationDetails_ReasonDetailedText
     */
    PropertyId[PropertyId["CancellationDetails_ReasonDetailedText"] = 27] = "CancellationDetails_ReasonDetailedText";
    /**
     * The Language Understanding Service response output (in JSON format). Available via [[IntentRecognitionResult]]
     * @member PropertyId.LanguageUnderstandingServiceResponse_JsonResult
     */
    PropertyId[PropertyId["LanguageUnderstandingServiceResponse_JsonResult"] = 28] = "LanguageUnderstandingServiceResponse_JsonResult";
    /**
     * The URL string built from speech configuration.
     * This property is intended to be read-only. The SDK is using it internally.
     * NOTE: Added in version 1.7.0.
     */
    PropertyId[PropertyId["SpeechServiceConnection_Url"] = 29] = "SpeechServiceConnection_Url";
    /**
     * The initial silence timeout value (in milliseconds) used by the service.
     * Added in version 1.7.0
     */
    PropertyId[PropertyId["SpeechServiceConnection_InitialSilenceTimeoutMs"] = 30] = "SpeechServiceConnection_InitialSilenceTimeoutMs";
    /**
     * The end silence timeout value (in milliseconds) used by the service.
     * Added in version 1.7.0
     */
    PropertyId[PropertyId["SpeechServiceConnection_EndSilenceTimeoutMs"] = 31] = "SpeechServiceConnection_EndSilenceTimeoutMs";
    /**
     * A boolean value specifying whether audio logging is enabled in the service or not.
     * Added in version 1.7.0
     */
    PropertyId[PropertyId["SpeechServiceConnection_EnableAudioLogging"] = 32] = "SpeechServiceConnection_EnableAudioLogging";
    /**
     * The requested Cognitive Services Speech Service response output profanity setting.
     * Allowed values are "masked", "removed", and "raw".
     * Added in version 1.7.0.
     */
    PropertyId[PropertyId["SpeechServiceResponse_ProfanityOption"] = 33] = "SpeechServiceResponse_ProfanityOption";
    /**
     * A string value specifying which post processing option should be used by service.
     * Allowed values are "TrueText".
     * Added in version 1.7.0
     */
    PropertyId[PropertyId["SpeechServiceResponse_PostProcessingOption"] = 34] = "SpeechServiceResponse_PostProcessingOption";
    /**
     *  A boolean value specifying whether to include word-level timestamps in the response result.
     * Added in version 1.7.0
     */
    PropertyId[PropertyId["SpeechServiceResponse_RequestWordLevelTimestamps"] = 35] = "SpeechServiceResponse_RequestWordLevelTimestamps";
    /**
     * The number of times a word has to be in partial results to be returned.
     * Added in version 1.7.0
     */
    PropertyId[PropertyId["SpeechServiceResponse_StablePartialResultThreshold"] = 36] = "SpeechServiceResponse_StablePartialResultThreshold";
    /**
     * A string value specifying the output format option in the response result. Internal use only.
     * Added in version 1.7.0.
     */
    PropertyId[PropertyId["SpeechServiceResponse_OutputFormatOption"] = 37] = "SpeechServiceResponse_OutputFormatOption";
    /**
     * A boolean value to request for stabilizing translation partial results by omitting words in the end.
     * Added in version 1.7.0.
     */
    PropertyId[PropertyId["SpeechServiceResponse_TranslationRequestStablePartialResult"] = 38] = "SpeechServiceResponse_TranslationRequestStablePartialResult";
    /**
     * Identifier used to connect to the backend service.
     * @member PropertyId.Conversation_ApplicationId
     */
    PropertyId[PropertyId["Conversation_ApplicationId"] = 39] = "Conversation_ApplicationId";
    /**
     * Type of dialog backend to connect to.
     * @member PropertyId.Conversation_DialogType
     */
    PropertyId[PropertyId["Conversation_DialogType"] = 40] = "Conversation_DialogType";
    /**
     * Silence timeout for listening
     * @member PropertyId.Conversation_Initial_Silence_Timeout
     */
    PropertyId[PropertyId["Conversation_Initial_Silence_Timeout"] = 41] = "Conversation_Initial_Silence_Timeout";
    /**
     * From Id to add to speech recognition activities.
     * @member PropertyId.Conversation_From_Id
     */
    PropertyId[PropertyId["Conversation_From_Id"] = 42] = "Conversation_From_Id";
    /**
     * ConversationId for the session.
     * @member PropertyId.Conversation_Conversation_Id
     */
    PropertyId[PropertyId["Conversation_Conversation_Id"] = 43] = "Conversation_Conversation_Id";
    /**
     * Comma separated list of custom voice deployment ids.
     * @member PropertyId.Conversation_Custom_Voice_Deployment_Ids
     */
    PropertyId[PropertyId["Conversation_Custom_Voice_Deployment_Ids"] = 44] = "Conversation_Custom_Voice_Deployment_Ids";
    /**
     * Speech activity template, stamp properties from the template on the activity generated by the service for speech.
     * @member PropertyId.Conversation_Speech_Activity_Template
     * Added in version 1.10.0.
     */
    PropertyId[PropertyId["Conversation_Speech_Activity_Template"] = 45] = "Conversation_Speech_Activity_Template";
    /**
     * Enables or disables the receipt of turn status messages as obtained on the turnStatusReceived event.
     * @member PropertyId.Conversation_Request_Bot_Status_Messages
     * Added in version 1.15.0.
     */
    PropertyId[PropertyId["Conversation_Request_Bot_Status_Messages"] = 46] = "Conversation_Request_Bot_Status_Messages";
    /**
     * Specifies the connection ID to be provided in the Agent configuration message, e.g. a Direct Line token for
     * channel authentication.
     * Added in version 1.15.1.
     */
    PropertyId[PropertyId["Conversation_Agent_Connection_Id"] = 47] = "Conversation_Agent_Connection_Id";
    /**
     * The Cognitive Services Speech Service host (url). Under normal circumstances, you shouldn't have to use this property directly.
     * Instead, use [[SpeechConfig.fromHost]].
     */
    PropertyId[PropertyId["SpeechServiceConnection_Host"] = 48] = "SpeechServiceConnection_Host";
    /**
     * Set the host for service calls to the Conversation Translator REST management and websocket calls.
     */
    PropertyId[PropertyId["ConversationTranslator_Host"] = 49] = "ConversationTranslator_Host";
    /**
     * Optionally set the the host's display name.
     * Used when joining a conversation.
     */
    PropertyId[PropertyId["ConversationTranslator_Name"] = 50] = "ConversationTranslator_Name";
    /**
     * Optionally set a value for the X-CorrelationId request header.
     * Used for troubleshooting errors in the server logs. It should be a valid guid.
     */
    PropertyId[PropertyId["ConversationTranslator_CorrelationId"] = 51] = "ConversationTranslator_CorrelationId";
    /**
     * Set the conversation token to be sent to the speech service. This enables the
     * service to service call from the speech service to the Conversation Translator service for relaying
     * recognitions. For internal use.
     */
    PropertyId[PropertyId["ConversationTranslator_Token"] = 52] = "ConversationTranslator_Token";
    /**
     * The reference text of the audio for pronunciation evaluation.
     * For this and the following pronunciation assessment parameters, see
     * https://docs.microsoft.com/azure/cognitive-services/speech-service/rest-speech-to-text#pronunciation-assessment-parameters for details.
     * Under normal circumstances, you shouldn't have to use this property directly.
     * Added in version 1.15.0
     */
    PropertyId[PropertyId["PronunciationAssessment_ReferenceText"] = 53] = "PronunciationAssessment_ReferenceText";
    /**
     * The point system for pronunciation score calibration (FivePoint or HundredMark).
     * Under normal circumstances, you shouldn't have to use this property directly.
     * Added in version 1.15.0
     */
    PropertyId[PropertyId["PronunciationAssessment_GradingSystem"] = 54] = "PronunciationAssessment_GradingSystem";
    /**
     * The pronunciation evaluation granularity (Phoneme, Word, or FullText).
     * Under normal circumstances, you shouldn't have to use this property directly.
     * Added in version 1.15.0
     */
    PropertyId[PropertyId["PronunciationAssessment_Granularity"] = 55] = "PronunciationAssessment_Granularity";
    /**
     * Defines if enable miscue calculation.
     * With this enabled, the pronounced words will be compared to the reference text,
     * and will be marked with omission/insertion based on the comparison. The default setting is False.
     * Under normal circumstances, you shouldn't have to use this property directly.
     * Added in version 1.15.0
     */
    PropertyId[PropertyId["PronunciationAssessment_EnableMiscue"] = 56] = "PronunciationAssessment_EnableMiscue";
    /**
     * The json string of pronunciation assessment parameters
     * Under normal circumstances, you shouldn't have to use this property directly.
     * Added in version 1.15.0
     */
    PropertyId[PropertyId["PronunciationAssessment_Json"] = 57] = "PronunciationAssessment_Json";
    /**
     * Pronunciation assessment parameters.
     * This property is intended to be read-only. The SDK is using it internally.
     * Added in version 1.15.0
     */
    PropertyId[PropertyId["PronunciationAssessment_Params"] = 58] = "PronunciationAssessment_Params";
})(PropertyId || (PropertyId = {}));

//# sourceMappingURL=PropertyId.js.map