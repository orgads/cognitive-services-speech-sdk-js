"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var tls = __importStar(require("tls"));
var url = __importStar(require("url"));
var ocsp = __importStar(require("../../external/ocsp/ocsp"));
var Exports_1 = require("../common/Exports");
var agent_base_1 = __importDefault(require("agent-base"));
// @ts-ignore
var async_disk_cache_1 = __importDefault(require("async-disk-cache"));
var https_proxy_agent_1 = __importDefault(require("https-proxy-agent"));
var net = __importStar(require("net"));
var OCSPEvents_1 = require("../common/OCSPEvents");
var CertCheckAgent = /** @class */ (function () {
    function CertCheckAgent(proxyInfo) {
        if (!!proxyInfo) {
            this.privProxyInfo = proxyInfo;
        }
        // Initialize this here to allow tests to set the env variable before the cache is constructed.
        if (!CertCheckAgent.privDiskCache) {
            CertCheckAgent.privDiskCache = new async_disk_cache_1.default("microsoft-cognitiveservices-speech-sdk-cache", { supportBuffer: true, location: (typeof process !== "undefined" && !!process.env.SPEECH_OCSP_CACHE_ROOT) ? process.env.SPEECH_OCSP_CACHE_ROOT : undefined });
        }
    }
    // Test hook to force the disk cache to be recreated.
    CertCheckAgent.forceReinitDiskCache = function () {
        CertCheckAgent.privDiskCache = undefined;
        CertCheckAgent.privMemCache = {};
    };
    CertCheckAgent.prototype.GetAgent = function (disableStapling) {
        var agent = new agent_base_1.default.Agent(this.CreateConnection);
        if (this.privProxyInfo !== undefined &&
            this.privProxyInfo.HostName !== undefined &&
            this.privProxyInfo.Port > 0) {
            var proxyName = "privProxyInfo";
            agent[proxyName] = this.privProxyInfo;
        }
        return agent;
    };
    CertCheckAgent.GetProxyAgent = function (proxyInfo) {
        var httpProxyOptions = {
            host: proxyInfo.HostName,
            port: proxyInfo.Port,
        };
        if (!!proxyInfo.UserName) {
            httpProxyOptions.headers = {
                "Proxy-Authentication": "Basic " + new Buffer(proxyInfo.UserName + ":" + (proxyInfo.Password === undefined) ? "" : proxyInfo.Password).toString("base64"),
            };
        }
        else {
            httpProxyOptions.headers = {};
        }
        httpProxyOptions.headers.requestOCSP = "true";
        var httpProxyAgent = new https_proxy_agent_1.default(httpProxyOptions);
        return httpProxyAgent;
    };
    CertCheckAgent.OCSPCheck = function (socketPromise, proxyInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var ocspRequest, stapling, resolved, socket, tlsSocket;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resolved = false;
                        return [4 /*yield*/, socketPromise];
                    case 1:
                        socket = _a.sent();
                        socket.cork();
                        tlsSocket = socket;
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                socket.on("OCSPResponse", function (data) {
                                    if (!!data) {
                                        _this.onEvent(new Exports_1.OCSPStapleReceivedEvent());
                                        stapling = data;
                                    }
                                });
                                socket.on("error", function (error) {
                                    if (!resolved) {
                                        resolved = true;
                                        socket.destroy();
                                        reject(error);
                                    }
                                });
                                tlsSocket.on("secure", function () { return __awaiter(_this, void 0, void 0, function () {
                                    var peer, issuer, sig, cacheEntry, e_1;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                peer = tlsSocket.getPeerCertificate(true);
                                                _a.label = 1;
                                            case 1:
                                                _a.trys.push([1, 6, , 7]);
                                                return [4 /*yield*/, this.GetIssuer(peer)];
                                            case 2:
                                                issuer = _a.sent();
                                                // We always need a request to verify the response.
                                                ocspRequest = ocsp.request.generate(peer.raw, issuer.raw);
                                                sig = ocspRequest.id.toString("hex");
                                                if (!!stapling) return [3 /*break*/, 4];
                                                return [4 /*yield*/, CertCheckAgent.GetResponseFromCache(sig, ocspRequest, proxyInfo)];
                                            case 3:
                                                cacheEntry = _a.sent();
                                                stapling = cacheEntry;
                                                _a.label = 4;
                                            case 4: return [4 /*yield*/, this.VerifyOCSPResponse(stapling, ocspRequest, proxyInfo)];
                                            case 5:
                                                _a.sent();
                                                socket.uncork();
                                                resolved = true;
                                                resolve(socket);
                                                return [3 /*break*/, 7];
                                            case 6:
                                                e_1 = _a.sent();
                                                socket.destroy();
                                                resolved = true;
                                                reject(e_1);
                                                return [3 /*break*/, 7];
                                            case 7: return [2 /*return*/];
                                        }
                                    });
                                }); });
                            })];
                }
            });
        });
    };
    CertCheckAgent.GetIssuer = function (peer) {
        if (peer.issuerCertificate) {
            return Promise.resolve(peer.issuerCertificate);
        }
        return new Promise(function (resolve, reject) {
            var ocspAgent = new ocsp.Agent({});
            ocspAgent.fetchIssuer(peer, null, function (error, value) {
                if (!!error) {
                    reject(error);
                    return;
                }
                resolve(value);
            });
        });
    };
    CertCheckAgent.GetResponseFromCache = function (signature, ocspRequest, proxyInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var cachedResponse, diskCacheResponse, error_1, cachedOcspResponse, tbsData, cachedStartTime, cachedNextTime, minUpdate;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cachedResponse = CertCheckAgent.privMemCache[signature];
                        if (!!cachedResponse) {
                            this.onEvent(new Exports_1.OCSPMemoryCacheHitEvent(signature));
                        }
                        if (!!cachedResponse) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, CertCheckAgent.privDiskCache.get(signature)];
                    case 2:
                        diskCacheResponse = _a.sent();
                        if (!!diskCacheResponse.isCached) {
                            CertCheckAgent.onEvent(new Exports_1.OCSPDiskCacheHitEvent(signature));
                            CertCheckAgent.StoreMemoryCacheEntry(signature, diskCacheResponse.value);
                            cachedResponse = diskCacheResponse.value;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        cachedResponse = null;
                        return [3 /*break*/, 4];
                    case 4:
                        if (!cachedResponse) {
                            return [2 /*return*/, cachedResponse];
                        }
                        try {
                            cachedOcspResponse = ocsp.utils.parseResponse(cachedResponse);
                            tbsData = cachedOcspResponse.value.tbsResponseData;
                            if (tbsData.responses.length < 1) {
                                this.onEvent(new Exports_1.OCSPCacheFetchErrorEvent(signature, "Not enough data in cached response"));
                                return [2 /*return*/];
                            }
                            cachedStartTime = tbsData.responses[0].thisUpdate;
                            cachedNextTime = tbsData.responses[0].nextUpdate;
                            if (cachedNextTime < (Date.now() + this.testTimeOffset - 60000)) {
                                // Cached entry has expired.
                                this.onEvent(new Exports_1.OCSPCacheEntryExpiredEvent(signature, cachedNextTime));
                                cachedResponse = null;
                            }
                            else {
                                minUpdate = Math.min(24 * 60 * 60 * 1000, (cachedNextTime - cachedStartTime) / 2);
                                if ((cachedNextTime - (Date.now() + this.testTimeOffset)) < minUpdate) {
                                    this.onEvent(new Exports_1.OCSPCacheEntryNeedsRefreshEvent(signature, cachedStartTime, cachedNextTime));
                                    this.UpdateCache(ocspRequest, proxyInfo).catch(function (error) {
                                        // Well, not much we can do here.
                                        _this.onEvent(new OCSPEvents_1.OCSPCacheUpdateErrorEvent(signature, error.toString()));
                                    });
                                }
                                else {
                                    this.onEvent(new Exports_1.OCSPCacheHitEvent(signature, cachedStartTime, cachedNextTime));
                                }
                            }
                        }
                        catch (error) {
                            this.onEvent(new Exports_1.OCSPCacheFetchErrorEvent(signature, error));
                            cachedResponse = null;
                        }
                        if (!cachedResponse) {
                            this.onEvent(new Exports_1.OCSPCacheMissEvent(signature));
                        }
                        return [2 /*return*/, cachedResponse];
                }
            });
        });
    };
    CertCheckAgent.VerifyOCSPResponse = function (cacheValue, ocspRequest, proxyInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var ocspResponse, sig;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ocspResponse = cacheValue;
                        sig = ocspRequest.certID.toString("hex");
                        if (!!ocspResponse) return [3 /*break*/, 2];
                        return [4 /*yield*/, CertCheckAgent.GetOCSPResponse(ocspRequest, proxyInfo)];
                    case 1:
                        ocspResponse = _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, new Promise(function (resolve, reject) {
                            ocsp.verify({ request: ocspRequest, response: ocspResponse }, function (error, result) {
                                if (!!error) {
                                    CertCheckAgent.onEvent(new Exports_1.OCSPVerificationFailedEvent(ocspRequest.id.toString("hex"), error));
                                    // Bad Cached Value? One more try without the cache.
                                    if (!!cacheValue) {
                                        _this.VerifyOCSPResponse(null, ocspRequest, proxyInfo).then(function () {
                                            resolve();
                                        }, function (error) {
                                            reject(error);
                                        });
                                    }
                                    else {
                                        reject(error);
                                    }
                                }
                                else {
                                    if (!cacheValue) {
                                        CertCheckAgent.StoreCacheEntry(ocspRequest.id.toString("hex"), ocspResponse);
                                    }
                                    resolve();
                                }
                            });
                        })];
                }
            });
        });
    };
    CertCheckAgent.UpdateCache = function (req, proxyInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var signature, rawResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        signature = req.id.toString("hex");
                        this.onEvent(new Exports_1.OCSPCacheUpdateNeededEvent(signature));
                        return [4 /*yield*/, this.GetOCSPResponse(req, proxyInfo)];
                    case 1:
                        rawResponse = _a.sent();
                        this.StoreCacheEntry(signature, rawResponse);
                        this.onEvent(new Exports_1.OCSPCacheUpdatehCompleteEvent(req.id.toString("hex")));
                        return [2 /*return*/];
                }
            });
        });
    };
    CertCheckAgent.StoreCacheEntry = function (sig, rawResponse) {
        this.StoreMemoryCacheEntry(sig, rawResponse);
        this.StoreDiskCacheEntry(sig, rawResponse);
    };
    CertCheckAgent.StoreMemoryCacheEntry = function (sig, rawResponse) {
        this.privMemCache[sig] = rawResponse;
        this.onEvent(new Exports_1.OCSPMemoryCacheStoreEvent(sig));
    };
    CertCheckAgent.StoreDiskCacheEntry = function (sig, rawResponse) {
        var _this = this;
        this.privDiskCache.set(sig, rawResponse).then(function () {
            _this.onEvent(new Exports_1.OCSPDiskCacheStoreEvent(sig));
        });
    };
    CertCheckAgent.GetOCSPResponse = function (req, proxyInfo) {
        var _this = this;
        var ocspMethod = "1.3.6.1.5.5.7.48.1";
        var options = {};
        if (!!proxyInfo) {
            var agent = CertCheckAgent.GetProxyAgent(proxyInfo);
            options.agent = agent;
        }
        return new Promise(function (resolve, reject) {
            ocsp.utils.getAuthorityInfo(req.cert, ocspMethod, function (error, uri) {
                if (error) {
                    reject(error);
                    return;
                }
                var parsedUri = url.parse(uri);
                options = __assign(__assign({}, options), parsedUri);
                ocsp.utils.getResponse(options, req.data, function (error, raw) {
                    if (error) {
                        reject(error);
                        return;
                    }
                    _this.onEvent(new Exports_1.OCSPResponseRetrievedEvent(req.certID.toString("hex")));
                    resolve(raw);
                });
            });
        });
    };
    CertCheckAgent.prototype.CreateConnection = function (request, options) {
        var enableOCSP = (typeof process !== "undefined" && process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "0" && process.env.SPEECH_CONDUCT_OCSP_CHECK !== "0") && options.secureEndpoint;
        var socketPromise;
        options = __assign(__assign({}, options), {
            requestOCSP: !CertCheckAgent.forceDisableOCSPStapling,
            servername: options.host
        });
        if (!!this.privProxyInfo) {
            var httpProxyAgent = CertCheckAgent.GetProxyAgent(this.privProxyInfo);
            var baseAgent_1 = httpProxyAgent;
            socketPromise = new Promise(function (resolve, reject) {
                baseAgent_1.callback(request, options, function (error, socket) {
                    if (!!error) {
                        reject(error);
                    }
                    else {
                        resolve(socket);
                    }
                });
            });
        }
        else {
            if (!!options.secureEndpoint) {
                socketPromise = Promise.resolve(tls.connect(options));
            }
            else {
                socketPromise = Promise.resolve(net.connect(options));
            }
        }
        if (!!enableOCSP) {
            return CertCheckAgent.OCSPCheck(socketPromise, this.privProxyInfo);
        }
        else {
            return socketPromise;
        }
    };
    // Test hook to enable forcing expiration / refresh to happen.
    CertCheckAgent.testTimeOffset = 0;
    // Test hook to disable stapling for cache testing.
    CertCheckAgent.forceDisableOCSPStapling = false;
    // An in memory cache for recived responses.
    CertCheckAgent.privMemCache = {};
    CertCheckAgent.onEvent = function (event) {
        Exports_1.Events.instance.onEvent(event);
    };
    return CertCheckAgent;
}());
exports.CertCheckAgent = CertCheckAgent;

//# sourceMappingURL=CertChecks.js.map