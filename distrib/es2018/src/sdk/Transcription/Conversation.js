// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// Multi-device Conversation is a Preview feature.
import { ConversationConnectionConfig, ConversationManager, ConversationRecognizerFactory, ConversationTranslatorCommandTypes, ConversationTranslatorMessageTypes, InternalParticipants } from "../../common.speech/Exports";
import { marshalPromiseToCallbacks } from "../../common/Exports";
import { Contracts } from "../Contracts";
import { ConversationParticipantsChangedEventArgs, ConversationTranslationEventArgs, Participant, ParticipantChangedReason, ProfanityOption, PropertyCollection, PropertyId, } from "../Exports";
export class Conversation {
    constructor() { }
    /**
     * Create a conversation
     * @param speechConfig
     * @param cb
     * @param err
     */
    static createConversationAsync(speechConfig, arg2, arg3, arg4) {
        Contracts.throwIfNullOrUndefined(speechConfig, ConversationConnectionConfig.restErrors.invalidArgs.replace("{arg}", "config"));
        Contracts.throwIfNullOrUndefined(speechConfig.region, ConversationConnectionConfig.restErrors.invalidArgs.replace("{arg}", "SpeechServiceConnection_Region"));
        if (!speechConfig.subscriptionKey && !speechConfig.getProperty(PropertyId[PropertyId.SpeechServiceAuthorization_Token])) {
            Contracts.throwIfNullOrUndefined(speechConfig.subscriptionKey, ConversationConnectionConfig.restErrors.invalidArgs.replace("{arg}", "SpeechServiceConnection_Key"));
        }
        if (typeof arg2 === "string") {
            const conversationImpl = new ConversationImpl(speechConfig, arg2);
            marshalPromiseToCallbacks((async () => { return; })(), arg3, arg4);
            return conversationImpl;
        }
        else {
            const conversationImpl = new ConversationImpl(speechConfig);
            const cb = arg2;
            const err = arg3;
            conversationImpl.createConversationAsync((() => {
                if (!!cb) {
                    cb();
                }
            }), (error) => {
                if (!!err) {
                    err(error);
                }
            });
            return conversationImpl;
        }
    }
}
// tslint:disable-next-line:max-classes-per-file
export class ConversationImpl extends Conversation {
    /**
     * Create a conversation impl
     * @param speechConfig
     * @param {string} id - optional conversationId
     */
    constructor(speechConfig, id) {
        super();
        this.privIsDisposed = false;
        this.privIsConnected = false;
        this.privErrors = ConversationConnectionConfig.restErrors;
        this.privConversationId = "";
        /** websocket callbacks */
        this.onConnected = (e) => {
            this.privIsConnected = true;
            try {
                if (!!this.privConversationTranslator.sessionStarted) {
                    this.privConversationTranslator.sessionStarted(this.privConversationTranslator, e);
                }
            }
            catch (e) {
                //
            }
        };
        this.onDisconnected = async (e) => {
            await this.close(false);
            try {
                if (!!this.privConversationTranslator.sessionStopped) {
                    this.privConversationTranslator.sessionStopped(this.privConversationTranslator, e);
                }
            }
            catch (e) {
                //
            }
        };
        this.onCanceled = async (r, e) => {
            await this.close(false); // ?
            try {
                if (!!this.privConversationTranslator.canceled) {
                    this.privConversationTranslator.canceled(this.privConversationTranslator, e);
                }
            }
            catch (e) {
                //
            }
        };
        this.onParticipantUpdateCommandReceived = (r, e) => {
            var _a, _b;
            try {
                const updatedParticipant = this.privParticipants.getParticipant(e.id);
                if (updatedParticipant !== undefined) {
                    switch (e.key) {
                        case ConversationTranslatorCommandTypes.changeNickname:
                            updatedParticipant.displayName = e.value;
                            break;
                        case ConversationTranslatorCommandTypes.setUseTTS:
                            updatedParticipant.useTts = e.value;
                            break;
                        case ConversationTranslatorCommandTypes.setProfanityFiltering:
                            updatedParticipant.profanity = e.value;
                            break;
                        case ConversationTranslatorCommandTypes.setMute:
                            updatedParticipant.isMuted = e.value;
                            break;
                        case ConversationTranslatorCommandTypes.setTranslateToLanguages:
                            updatedParticipant.translateToLanguages = e.value;
                            break;
                    }
                    this.privParticipants.addOrUpdateParticipant(updatedParticipant);
                    if (!!((_a = this.privConversationTranslator) === null || _a === void 0 ? void 0 : _a.participantsChanged)) {
                        (_b = this.privConversationTranslator) === null || _b === void 0 ? void 0 : _b.participantsChanged(this.privConversationTranslator, new ConversationParticipantsChangedEventArgs(ParticipantChangedReason.Updated, [this.toParticipant(updatedParticipant)], e.sessionId));
                    }
                }
            }
            catch (e) {
                //
            }
        };
        this.onLockRoomCommandReceived = (r, e) => {
            // TODO
        };
        this.onMuteAllCommandReceived = (r, e) => {
            var _a, _b;
            try {
                this.privParticipants.participants.forEach((p) => p.isMuted = (p.isHost ? false : e.isMuted));
                if (!!((_a = this.privConversationTranslator) === null || _a === void 0 ? void 0 : _a.participantsChanged)) {
                    (_b = this.privConversationTranslator) === null || _b === void 0 ? void 0 : _b.participantsChanged(this.privConversationTranslator, new ConversationParticipantsChangedEventArgs(ParticipantChangedReason.Updated, this.toParticipants(false), e.sessionId));
                }
            }
            catch (e) {
                //
            }
        };
        this.onParticipantJoinCommandReceived = (r, e) => {
            var _a, _b;
            try {
                const newParticipant = this.privParticipants.addOrUpdateParticipant(e.participant);
                if (newParticipant !== undefined) {
                    if (!!((_a = this.privConversationTranslator) === null || _a === void 0 ? void 0 : _a.participantsChanged)) {
                        (_b = this.privConversationTranslator) === null || _b === void 0 ? void 0 : _b.participantsChanged(this.privConversationTranslator, new ConversationParticipantsChangedEventArgs(ParticipantChangedReason.JoinedConversation, [this.toParticipant(newParticipant)], e.sessionId));
                    }
                }
            }
            catch (e) {
                //
            }
        };
        this.onParticipantLeaveCommandReceived = (r, e) => {
            var _a, _b;
            try {
                const ejectedParticipant = this.privParticipants.getParticipant(e.participant.id);
                if (ejectedParticipant !== undefined) {
                    // remove the participant from the internal participants list
                    this.privParticipants.deleteParticipant(e.participant.id);
                    if (!!((_a = this.privConversationTranslator) === null || _a === void 0 ? void 0 : _a.participantsChanged)) {
                        // notify subscribers that the participant has left the conversation
                        (_b = this.privConversationTranslator) === null || _b === void 0 ? void 0 : _b.participantsChanged(this.privConversationTranslator, new ConversationParticipantsChangedEventArgs(ParticipantChangedReason.LeftConversation, [this.toParticipant(ejectedParticipant)], e.sessionId));
                    }
                }
            }
            catch (e) {
                //
            }
        };
        this.onTranslationReceived = (r, e) => {
            var _a, _b, _c, _d, _e, _f;
            try {
                switch (e.command) {
                    case ConversationTranslatorMessageTypes.final:
                        if (!!((_a = this.privConversationTranslator) === null || _a === void 0 ? void 0 : _a.transcribed)) {
                            (_b = this.privConversationTranslator) === null || _b === void 0 ? void 0 : _b.transcribed(this.privConversationTranslator, new ConversationTranslationEventArgs(e.payload, undefined, e.sessionId));
                        }
                        break;
                    case ConversationTranslatorMessageTypes.partial:
                        if (!!((_c = this.privConversationTranslator) === null || _c === void 0 ? void 0 : _c.transcribing)) {
                            (_d = this.privConversationTranslator) === null || _d === void 0 ? void 0 : _d.transcribing(this.privConversationTranslator, new ConversationTranslationEventArgs(e.payload, undefined, e.sessionId));
                        }
                        break;
                    case ConversationTranslatorMessageTypes.instantMessage:
                        if (!!((_e = this.privConversationTranslator) === null || _e === void 0 ? void 0 : _e.textMessageReceived)) {
                            (_f = this.privConversationTranslator) === null || _f === void 0 ? void 0 : _f.textMessageReceived(this.privConversationTranslator, new ConversationTranslationEventArgs(e.payload, undefined, e.sessionId));
                        }
                        break;
                }
            }
            catch (e) {
                //
            }
        };
        this.onParticipantsListReceived = (r, e) => {
            var _a, _b, _c;
            try {
                // check if the session token needs to be updated
                if (e.sessionToken !== undefined && e.sessionToken !== null) {
                    this.privRoom.token = e.sessionToken;
                }
                // save the participants
                this.privParticipants.participants = [...e.participants];
                // enable the conversation
                if (this.privParticipants.me !== undefined) {
                    this.privIsReady = true;
                }
                if (!!((_a = this.privConversationTranslator) === null || _a === void 0 ? void 0 : _a.participantsChanged)) {
                    (_b = this.privConversationTranslator) === null || _b === void 0 ? void 0 : _b.participantsChanged(this.privConversationTranslator, new ConversationParticipantsChangedEventArgs(ParticipantChangedReason.JoinedConversation, this.toParticipants(true), e.sessionId));
                }
                // if this is the host, update the nickname if needed
                if (this.me.isHost) {
                    const nickname = (_c = this.privConversationTranslator) === null || _c === void 0 ? void 0 : _c.properties.getProperty(PropertyId.ConversationTranslator_Name);
                    if (nickname !== undefined && nickname.length > 0 && nickname !== this.me.displayName) {
                        // issue a change nickname request
                        this.changeNicknameAsync(nickname);
                    }
                }
            }
            catch (e) {
                //
            }
        };
        this.onConversationExpiration = (r, e) => {
            var _a, _b;
            try {
                if (!!((_a = this.privConversationTranslator) === null || _a === void 0 ? void 0 : _a.conversationExpiration)) {
                    (_b = this.privConversationTranslator) === null || _b === void 0 ? void 0 : _b.conversationExpiration(this.privConversationTranslator, e);
                }
            }
            catch (e) {
                //
            }
        };
        this.privProperties = new PropertyCollection();
        this.privManager = new ConversationManager();
        // check the speech language
        const language = speechConfig.getProperty(PropertyId[PropertyId.SpeechServiceConnection_RecoLanguage]);
        if (!language) {
            speechConfig.setProperty(PropertyId[PropertyId.SpeechServiceConnection_RecoLanguage], ConversationConnectionConfig.defaultLanguageCode);
        }
        this.privLanguage = speechConfig.getProperty(PropertyId[PropertyId.SpeechServiceConnection_RecoLanguage]);
        if (!id) {
            // check the target language(s)
            if (speechConfig.targetLanguages.length === 0) {
                speechConfig.addTargetLanguage(this.privLanguage);
            }
            // check the profanity setting: speech and conversationTranslator should be in sync
            const profanity = speechConfig.getProperty(PropertyId[PropertyId.SpeechServiceResponse_ProfanityOption]);
            if (!profanity) {
                speechConfig.setProfanity(ProfanityOption.Masked);
            }
            // check the nickname: it should pass this regex: ^\w+([\s-][\w\(\)]+)*$"
            // TODO: specify the regex required. Nicknames must be unique or get the duplicate nickname error
            // TODO: check what the max length is and if a truncation is required or if the service handles it without an error
            let hostNickname = speechConfig.getProperty(PropertyId[PropertyId.ConversationTranslator_Name]);
            if (hostNickname === undefined || hostNickname === null || hostNickname.length <= 1 || hostNickname.length > 50) {
                hostNickname = "Host";
            }
            speechConfig.setProperty(PropertyId[PropertyId.ConversationTranslator_Name], hostNickname);
        }
        else {
            this.privConversationId = id;
        }
        // save the speech config for future usage
        this.privConfig = speechConfig;
        // save the config properties
        const configImpl = speechConfig;
        Contracts.throwIfNull(configImpl, "speechConfig");
        this.privProperties = configImpl.properties.clone();
        this.privIsConnected = false;
        this.privParticipants = new InternalParticipants();
        this.privIsReady = false;
        this.privTextMessageMaxLength = 1000;
    }
    set conversationTranslator(value) {
        this.privConversationTranslator = value;
    }
    // get the internal data about a conversation
    get room() {
        return this.privRoom;
    }
    // get the wrapper for connecting to the websockets
    get connection() {
        return this.privConversationRecognizer; // this.privConnection;
    }
    // get / set the speech auth token
    get authorizationToken() {
        return this.privToken;
    }
    set authorizationToken(value) {
        Contracts.throwIfNullOrWhitespace(value, "authorizationToken");
        this.privToken = value;
    }
    // get the config
    get config() {
        return this.privConfig;
    }
    // get the conversation Id
    get conversationId() {
        return this.privRoom ? this.privRoom.roomId : this.privConversationId;
    }
    // get the properties
    get properties() {
        return this.privProperties;
    }
    // get the speech language
    get speechRecognitionLanguage() {
        return this.privLanguage;
    }
    get isMutedByHost() {
        var _a, _b;
        return ((_a = this.privParticipants.me) === null || _a === void 0 ? void 0 : _a.isHost) ? false : (_b = this.privParticipants.me) === null || _b === void 0 ? void 0 : _b.isMuted;
    }
    get isConnected() {
        return this.privIsConnected && this.privIsReady;
    }
    get participants() {
        return this.toParticipants(true);
    }
    get me() {
        return this.toParticipant(this.privParticipants.me);
    }
    get host() {
        return this.toParticipant(this.privParticipants.host);
    }
    /**
     * Create a new conversation as Host
     * @param cb
     * @param err
     */
    createConversationAsync(cb, err) {
        try {
            if (!!this.privConversationRecognizer) {
                this.handleError(new Error(this.privErrors.permissionDeniedStart), err);
            }
            this.privManager.createOrJoin(this.privProperties, undefined, ((room) => {
                if (!room) {
                    this.handleError(new Error(this.privErrors.permissionDeniedConnect), err);
                }
                this.privRoom = room;
                this.handleCallback(cb, err);
            }), ((error) => {
                this.handleError(error, err);
            }));
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Starts a new conversation as host.
     * @param cb
     * @param err
     */
    startConversationAsync(cb, err) {
        try {
            // check if there is already a recognizer
            if (!!this.privConversationRecognizer) {
                this.handleError(new Error(this.privErrors.permissionDeniedStart), err);
            }
            // check if there is conversation data available
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedConnect);
            // connect to the conversation websocket
            this.privParticipants.meId = this.privRoom.participantId;
            this.privConversationRecognizer = ConversationRecognizerFactory.fromConfig(this.privConfig);
            // Because ConversationTranslator manually sets up and manages the connection, Conversation
            // has to forward serviceRecognizer connection events that usually get passed automatically
            this.privConversationRecognizer.connected = this.onConnected;
            this.privConversationRecognizer.disconnected = this.onDisconnected;
            this.privConversationRecognizer.canceled = this.onCanceled;
            this.privConversationRecognizer.participantUpdateCommandReceived = this.onParticipantUpdateCommandReceived;
            this.privConversationRecognizer.lockRoomCommandReceived = this.onLockRoomCommandReceived;
            this.privConversationRecognizer.muteAllCommandReceived = this.onMuteAllCommandReceived;
            this.privConversationRecognizer.participantJoinCommandReceived = this.onParticipantJoinCommandReceived;
            this.privConversationRecognizer.participantLeaveCommandReceived = this.onParticipantLeaveCommandReceived;
            this.privConversationRecognizer.translationReceived = this.onTranslationReceived;
            this.privConversationRecognizer.participantsListReceived = this.onParticipantsListReceived;
            this.privConversationRecognizer.conversationExpiration = this.onConversationExpiration;
            this.privConversationRecognizer.connect(this.privRoom.token, (() => {
                this.handleCallback(cb, err);
            }), ((error) => {
                this.handleError(error, err);
            }));
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Join a conversation as a participant.
     * @param { IParticipant } participant - participant to add
     * @param cb
     * @param err
     */
    addParticipantAsync(participant, cb, err) {
        Contracts.throwIfNullOrUndefined(participant, "Participant");
        marshalPromiseToCallbacks(this.addParticipantImplAsync(participant), cb, err);
    }
    /**
     * Join a conversation as a participant.
     * @param conversation
     * @param nickname
     * @param lang
     * @param cb
     * @param err
     */
    joinConversationAsync(conversationId, nickname, lang, cb, err) {
        try {
            // TODO
            // if (!!this.privConversationRecognizer) {
            //     throw new Error(this.privErrors.permissionDeniedStart);
            // }
            Contracts.throwIfNullOrWhitespace(conversationId, this.privErrors.invalidArgs.replace("{arg}", "conversationId"));
            Contracts.throwIfNullOrWhitespace(nickname, this.privErrors.invalidArgs.replace("{arg}", "nickname"));
            Contracts.throwIfNullOrWhitespace(lang, this.privErrors.invalidArgs.replace("{arg}", "language"));
            // join the conversation
            this.privManager.createOrJoin(this.privProperties, conversationId, ((room) => {
                Contracts.throwIfNullOrUndefined(room, this.privErrors.permissionDeniedConnect);
                this.privRoom = room;
                this.privConfig.authorizationToken = room.cognitiveSpeechAuthToken;
                // join callback
                if (!!cb) {
                    cb(room.cognitiveSpeechAuthToken);
                }
            }), ((error) => {
                this.handleError(error, err);
            }));
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Deletes a conversation
     * @param cb
     * @param err
     */
    deleteConversationAsync(cb, err) {
        marshalPromiseToCallbacks(this.deleteConversationImplAsync(), cb, err);
    }
    async deleteConversationImplAsync() {
        Contracts.throwIfNullOrUndefined(this.privProperties, this.privErrors.permissionDeniedConnect);
        Contracts.throwIfNullOrWhitespace(this.privRoom.token, this.privErrors.permissionDeniedConnect);
        await this.privManager.leave(this.privProperties, this.privRoom.token);
        this.dispose();
    }
    /**
     * Issues a request to close the client websockets
     * @param cb
     * @param err
     */
    endConversationAsync(cb, err) {
        marshalPromiseToCallbacks(this.endConversationImplAsync(), cb, err);
    }
    endConversationImplAsync() {
        return this.close(true);
    }
    /**
     * Issues a request to lock the conversation
     * @param cb
     * @param err
     */
    lockConversationAsync(cb, err) {
        var _a;
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
            if (!this.canSendAsHost) {
                this.handleError(new Error(this.privErrors.permissionDeniedConversation.replace("{command}", "lock")), err);
            }
            (_a = this.privConversationRecognizer) === null || _a === void 0 ? void 0 : _a.sendRequest(this.getLockCommand(true), (() => {
                this.handleCallback(cb, err);
            }), ((error) => {
                this.handleError(error, err);
            }));
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Issues a request to mute the conversation
     * @param cb
     * @param err
     */
    muteAllParticipantsAsync(cb, err) {
        var _a;
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
            Contracts.throwIfNullOrUndefined(this.privConversationRecognizer, this.privErrors.permissionDeniedSend);
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
            // check the user's permissions
            if (!this.canSendAsHost) {
                this.handleError(new Error(this.privErrors.permissionDeniedConversation.replace("{command}", "mute")), err);
            }
            (_a = this.privConversationRecognizer) === null || _a === void 0 ? void 0 : _a.sendRequest(this.getMuteAllCommand(true), (() => {
                this.handleCallback(cb, err);
            }), ((error) => {
                this.handleError(error, err);
            }));
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Issues a request to mute a participant in the conversation
     * @param userId
     * @param cb
     * @param err
     */
    muteParticipantAsync(userId, cb, err) {
        var _a;
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
            Contracts.throwIfNullOrWhitespace(userId, this.privErrors.invalidArgs.replace("{arg}", "userId"));
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
            // check the connection is open (host + participant can perform the mute command)
            if (!this.canSend) {
                this.handleError(new Error(this.privErrors.permissionDeniedSend), err);
            }
            // if not host, check the participant is not muting another participant
            if (!this.me.isHost && this.me.id !== userId) {
                this.handleError(new Error(this.privErrors.permissionDeniedParticipant.replace("{command}", "mute")), err);
            }
            // check the user exists
            const exists = this.privParticipants.getParticipantIndex(userId);
            if (exists === -1) {
                this.handleError(new Error(this.privErrors.invalidParticipantRequest), err);
            }
            (_a = this.privConversationRecognizer) === null || _a === void 0 ? void 0 : _a.sendRequest(this.getMuteCommand(userId, true), (() => {
                this.handleCallback(cb, err);
            }), ((error) => {
                this.handleError(error, err);
            }));
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Issues a request to remove a participant from the conversation
     * @param userId
     * @param cb
     * @param err
     */
    removeParticipantAsync(userId, cb, err) {
        var _a;
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            if (!!this.privTranscriberRecognizer && userId.hasOwnProperty("id")) {
                // Assume this is a transcription participant
                marshalPromiseToCallbacks(this.removeParticipantImplAsync(userId), cb, err);
            }
            else {
                Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
                Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
                if (!this.canSendAsHost) {
                    this.handleError(new Error(this.privErrors.permissionDeniedParticipant.replace("{command}", "remove")), err);
                }
                let participantId = "";
                if (typeof userId === "string") {
                    participantId = userId;
                }
                else if (userId.hasOwnProperty("id")) {
                    const participant = userId;
                    participantId = participant.id;
                }
                else if (userId.hasOwnProperty("userId")) {
                    const user = userId;
                    participantId = user.userId;
                }
                Contracts.throwIfNullOrWhitespace(participantId, this.privErrors.invalidArgs.replace("{arg}", "userId"));
                // check the participant exists
                const index = this.participants.findIndex((p) => p.id === participantId);
                if (index === -1) {
                    this.handleError(new Error(this.privErrors.invalidParticipantRequest), err);
                }
                (_a = this.privConversationRecognizer) === null || _a === void 0 ? void 0 : _a.sendRequest(this.getEjectCommand(participantId), (() => {
                    this.handleCallback(cb, err);
                }), ((error) => {
                    this.handleError(error, err);
                }));
            }
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Issues a request to unlock the conversation
     * @param cb
     * @param err
     */
    unlockConversationAsync(cb, err) {
        var _a;
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
            if (!this.canSendAsHost) {
                this.handleError(new Error(this.privErrors.permissionDeniedConversation.replace("{command}", "unlock")), err);
            }
            (_a = this.privConversationRecognizer) === null || _a === void 0 ? void 0 : _a.sendRequest(this.getLockCommand(false), (() => {
                this.handleCallback(cb, err);
            }), ((error) => {
                this.handleError(error, err);
            }));
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Issues a request to unmute all participants in the conversation
     * @param cb
     * @param err
     */
    unmuteAllParticipantsAsync(cb, err) {
        var _a;
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
            if (!this.canSendAsHost) {
                this.handleError(new Error(this.privErrors.permissionDeniedConversation.replace("{command}", "unmute all")), err);
            }
            (_a = this.privConversationRecognizer) === null || _a === void 0 ? void 0 : _a.sendRequest(this.getMuteAllCommand(false), (() => {
                this.handleCallback(cb, err);
            }), ((error) => {
                this.handleError(error, err);
            }));
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Issues a request to unmute a participant in the conversation
     * @param userId
     * @param cb
     * @param err
     */
    unmuteParticipantAsync(userId, cb, err) {
        var _a;
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
            Contracts.throwIfNullOrWhitespace(userId, this.privErrors.invalidArgs.replace("{arg}", "userId"));
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
            // check the connection is open (host + participant can perform the mute command)
            if (!this.canSend) {
                this.handleError(new Error(this.privErrors.permissionDeniedSend), err);
            }
            // if not host, check the participant is not muting another participant
            if (!this.me.isHost && this.me.id !== userId) {
                this.handleError(new Error(this.privErrors.permissionDeniedParticipant.replace("{command}", "mute")), err);
            }
            // check the user exists
            const exists = this.privParticipants.getParticipantIndex(userId);
            if (exists === -1) {
                this.handleError(new Error(this.privErrors.invalidParticipantRequest), err);
            }
            (_a = this.privConversationRecognizer) === null || _a === void 0 ? void 0 : _a.sendRequest(this.getMuteCommand(userId, false), (() => {
                this.handleCallback(cb, err);
            }), ((error) => {
                this.handleError(error, err);
            }));
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Send a text message
     * @param message
     * @param cb
     * @param err
     */
    sendTextMessageAsync(message, cb, err) {
        var _a;
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
            Contracts.throwIfNullOrWhitespace(message, this.privErrors.invalidArgs.replace("{arg}", "message"));
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
            if (!this.canSend) {
                this.handleError(new Error(this.privErrors.permissionDeniedSend), err);
            }
            // TODO: is a max length check required?
            if (message.length > this.privTextMessageMaxLength) {
                this.handleError(new Error(this.privErrors.invalidArgs.replace("{arg}", "message length")), err);
            }
            (_a = this.privConversationRecognizer) === null || _a === void 0 ? void 0 : _a.sendRequest(this.getMessageCommand(message), (() => {
                this.handleCallback(cb, err);
            }), ((error) => {
                this.handleError(error, err);
            }));
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    /**
     * Change nickname
     * @param message
     * @param cb
     * @param err
     */
    changeNicknameAsync(nickname, cb, err) {
        var _a;
        try {
            Contracts.throwIfDisposed(this.privIsDisposed);
            Contracts.throwIfDisposed(this.privConversationRecognizer.isDisposed());
            Contracts.throwIfNullOrWhitespace(nickname, this.privErrors.invalidArgs.replace("{arg}", "nickname"));
            Contracts.throwIfNullOrUndefined(this.privRoom, this.privErrors.permissionDeniedSend);
            if (!this.canSend) {
                this.handleError(new Error(this.privErrors.permissionDeniedSend), err);
            }
            (_a = this.privConversationRecognizer) === null || _a === void 0 ? void 0 : _a.sendRequest(this.getChangeNicknameCommand(nickname), (() => {
                this.handleCallback(cb, err);
            }), ((error) => {
                this.handleError(error, err);
            }));
        }
        catch (error) {
            this.handleError(error, err);
        }
    }
    isDisposed() {
        return this.privIsDisposed;
    }
    dispose(reason) {
        var _a;
        if (this.isDisposed) {
            return;
        }
        this.privIsDisposed = true;
        (_a = this.config) === null || _a === void 0 ? void 0 : _a.close();
        this.privConfig = undefined;
        this.privLanguage = undefined;
        this.privProperties = undefined;
        this.privRoom = undefined;
        this.privToken = undefined;
        this.privManager = undefined;
        this.privConversationRecognizer = undefined;
        this.privIsConnected = false;
        this.privIsReady = false;
        this.privParticipants = undefined;
    }
    get transcriberRecognizer() {
        return this.privTranscriberRecognizer;
    }
    async connectTranscriberRecognizer(recognizer) {
        if (!!this.privTranscriberRecognizer) {
            await this.privTranscriberRecognizer.close();
        }
        this.privTranscriberRecognizer = recognizer;
        this.privTranscriberRecognizer.conversation = this;
    }
    get conversationInfo() {
        const convId = this.conversationId;
        const p = this.participants.map((part) => {
            return {
                id: part.id,
                preferredLanguage: part.preferredLanguage,
                voice: part.voice
            };
        });
        const props = {};
        for (const key of ConversationConnectionConfig.transcriptionEventKeys) {
            const val = this.properties.getProperty(key, "");
            if (val !== "") {
                props[key] = val;
            }
        }
        const info = { id: convId, participants: p, conversationProperties: props };
        return info;
    }
    addParticipantImplAsync(participant) {
        const newParticipant = this.privParticipants.addOrUpdateParticipant(participant);
        if (newParticipant !== undefined) {
            if (!!this.privTranscriberRecognizer) {
                const conversationInfo = this.conversationInfo;
                conversationInfo.participants = [participant];
                return this.privTranscriberRecognizer.pushConversationEvent(conversationInfo, "join");
            }
        }
    }
    removeParticipantImplAsync(participant) {
        this.privParticipants.deleteParticipant(participant.id);
        const conversationInfo = this.conversationInfo;
        conversationInfo.participants = [participant];
        return this.privTranscriberRecognizer.pushConversationEvent(conversationInfo, "leave");
    }
    async close(dispose) {
        var _a, _b;
        try {
            this.privIsConnected = false;
            await this.privConversationRecognizer.close();
            await ((_a = this.privTranscriberRecognizer) === null || _a === void 0 ? void 0 : _a.close());
            this.privConversationRecognizer = undefined;
            (_b = this.privConversationTranslator) === null || _b === void 0 ? void 0 : _b.dispose();
        }
        catch (e) {
            // ignore error
        }
        if (dispose) {
            this.dispose();
        }
    }
    /** Helpers */
    get canSend() {
        var _a;
        return this.privIsConnected && !((_a = this.privParticipants.me) === null || _a === void 0 ? void 0 : _a.isMuted);
    }
    get canSendAsHost() {
        var _a;
        return this.privIsConnected && ((_a = this.privParticipants.me) === null || _a === void 0 ? void 0 : _a.isHost);
    }
    handleCallback(cb, err) {
        if (!!cb) {
            try {
                cb();
            }
            catch (e) {
                if (!!err) {
                    err(e);
                }
            }
            cb = undefined;
        }
    }
    handleError(error, err) {
        if (!!err) {
            if (error instanceof Error) {
                const typedError = error;
                err(typedError.name + ": " + typedError.message);
            }
            else {
                err(error);
            }
        }
    }
    /** Participant Helpers */
    toParticipants(includeHost) {
        const participants = this.privParticipants.participants.map((p) => {
            return this.toParticipant(p);
        });
        if (!includeHost) {
            return participants.filter((p) => p.isHost === false);
        }
        else {
            return participants;
        }
    }
    toParticipant(p) {
        return new Participant(p.id, p.avatar, p.displayName, p.isHost, p.isMuted, p.isUsingTts, p.preferredLanguage, p.voice);
    }
    getMuteAllCommand(isMuted) {
        Contracts.throwIfNullOrWhitespace(this.privRoom.roomId, "conversationId");
        Contracts.throwIfNullOrWhitespace(this.privRoom.participantId, "participantId");
        return JSON.stringify({
            command: ConversationTranslatorCommandTypes.setMuteAll,
            // tslint:disable-next-line: object-literal-shorthand
            participantId: this.privRoom.participantId,
            roomid: this.privRoom.roomId,
            type: ConversationTranslatorMessageTypes.participantCommand,
            value: isMuted
        });
    }
    getMuteCommand(participantId, isMuted) {
        Contracts.throwIfNullOrWhitespace(this.privRoom.roomId, "conversationId");
        Contracts.throwIfNullOrWhitespace(participantId, "participantId");
        return JSON.stringify({
            command: ConversationTranslatorCommandTypes.setMute,
            // tslint:disable-next-line: object-literal-shorthand
            participantId: participantId,
            roomid: this.privRoom.roomId,
            type: ConversationTranslatorMessageTypes.participantCommand,
            value: isMuted
        });
    }
    getLockCommand(isLocked) {
        Contracts.throwIfNullOrWhitespace(this.privRoom.roomId, "conversationId");
        Contracts.throwIfNullOrWhitespace(this.privRoom.participantId, "participantId");
        return JSON.stringify({
            command: ConversationTranslatorCommandTypes.setLockState,
            // tslint:disable-next-line: object-literal-shorthand
            participantId: this.privRoom.participantId,
            roomid: this.privRoom.roomId,
            type: ConversationTranslatorMessageTypes.participantCommand,
            value: isLocked
        });
    }
    getEjectCommand(participantId) {
        Contracts.throwIfNullOrWhitespace(this.privRoom.roomId, "conversationId");
        Contracts.throwIfNullOrWhitespace(participantId, "participantId");
        return JSON.stringify({
            command: ConversationTranslatorCommandTypes.ejectParticipant,
            // tslint:disable-next-line: object-literal-shorthand
            participantId: participantId,
            roomid: this.privRoom.roomId,
            type: ConversationTranslatorMessageTypes.participantCommand,
        });
    }
    getChangeNicknameCommand(nickname) {
        Contracts.throwIfNullOrWhitespace(this.privRoom.roomId, "conversationId");
        Contracts.throwIfNullOrWhitespace(nickname, "nickname");
        Contracts.throwIfNullOrWhitespace(this.privRoom.participantId, "participantId");
        return JSON.stringify({
            command: ConversationTranslatorCommandTypes.changeNickname,
            nickname,
            // tslint:disable-next-line: object-literal-shorthand
            participantId: this.privRoom.participantId,
            roomid: this.privRoom.roomId,
            type: ConversationTranslatorMessageTypes.participantCommand,
            value: nickname
        });
    }
    getMessageCommand(message) {
        Contracts.throwIfNullOrWhitespace(this.privRoom.roomId, "conversationId");
        Contracts.throwIfNullOrWhitespace(this.privRoom.participantId, "participantId");
        Contracts.throwIfNullOrWhitespace(message, "message");
        return JSON.stringify({
            // tslint:disable-next-line: object-literal-shorthand
            participantId: this.privRoom.participantId,
            roomId: this.privRoom.roomId,
            text: message,
            type: ConversationTranslatorMessageTypes.instantMessage
        });
    }
}

//# sourceMappingURL=Conversation.js.map