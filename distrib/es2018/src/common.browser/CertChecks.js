// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import * as tls from "tls";
import * as url from "url";
import * as ocsp from "../../external/ocsp/ocsp";
import { Events, OCSPCacheEntryExpiredEvent, OCSPCacheEntryNeedsRefreshEvent, OCSPCacheFetchErrorEvent, OCSPCacheHitEvent, OCSPCacheMissEvent, OCSPCacheUpdatehCompleteEvent, OCSPCacheUpdateNeededEvent, OCSPDiskCacheHitEvent, OCSPDiskCacheStoreEvent, OCSPMemoryCacheHitEvent, OCSPMemoryCacheStoreEvent, OCSPResponseRetrievedEvent, OCSPStapleReceivedEvent, OCSPVerificationFailedEvent } from "../common/Exports";
import Agent from "agent-base";
// @ts-ignore
import Cache from "async-disk-cache";
import HttpsProxyAgent from "https-proxy-agent";
import * as net from "net";
import { OCSPCacheUpdateErrorEvent } from "../common/OCSPEvents";
export class CertCheckAgent {
    constructor(proxyInfo) {
        if (!!proxyInfo) {
            this.privProxyInfo = proxyInfo;
        }
        // Initialize this here to allow tests to set the env variable before the cache is constructed.
        if (!CertCheckAgent.privDiskCache) {
            CertCheckAgent.privDiskCache = new Cache("microsoft-cognitiveservices-speech-sdk-cache", { supportBuffer: true, location: (typeof process !== "undefined" && !!process.env.SPEECH_OCSP_CACHE_ROOT) ? process.env.SPEECH_OCSP_CACHE_ROOT : undefined });
        }
    }
    // Test hook to force the disk cache to be recreated.
    static forceReinitDiskCache() {
        CertCheckAgent.privDiskCache = undefined;
        CertCheckAgent.privMemCache = {};
    }
    GetAgent(disableStapling) {
        const agent = new Agent.Agent(this.CreateConnection);
        if (this.privProxyInfo !== undefined &&
            this.privProxyInfo.HostName !== undefined &&
            this.privProxyInfo.Port > 0) {
            const proxyName = "privProxyInfo";
            agent[proxyName] = this.privProxyInfo;
        }
        return agent;
    }
    static GetProxyAgent(proxyInfo) {
        const httpProxyOptions = {
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
        const httpProxyAgent = new HttpsProxyAgent(httpProxyOptions);
        return httpProxyAgent;
    }
    static async OCSPCheck(socketPromise, proxyInfo) {
        let ocspRequest;
        let stapling;
        let resolved = false;
        const socket = await socketPromise;
        socket.cork();
        const tlsSocket = socket;
        return new Promise((resolve, reject) => {
            socket.on("OCSPResponse", (data) => {
                if (!!data) {
                    this.onEvent(new OCSPStapleReceivedEvent());
                    stapling = data;
                }
            });
            socket.on("error", (error) => {
                if (!resolved) {
                    resolved = true;
                    socket.destroy();
                    reject(error);
                }
            });
            tlsSocket.on("secure", async () => {
                const peer = tlsSocket.getPeerCertificate(true);
                try {
                    const issuer = await this.GetIssuer(peer);
                    // We always need a request to verify the response.
                    ocspRequest = ocsp.request.generate(peer.raw, issuer.raw);
                    // Do we have a result for this certificate in our memory cache?
                    const sig = ocspRequest.id.toString("hex");
                    // Stapled response trumps cached response.
                    if (!stapling) {
                        const cacheEntry = await CertCheckAgent.GetResponseFromCache(sig, ocspRequest, proxyInfo);
                        stapling = cacheEntry;
                    }
                    await this.VerifyOCSPResponse(stapling, ocspRequest, proxyInfo);
                    socket.uncork();
                    resolved = true;
                    resolve(socket);
                }
                catch (e) {
                    socket.destroy();
                    resolved = true;
                    reject(e);
                }
            });
        });
    }
    static GetIssuer(peer) {
        if (peer.issuerCertificate) {
            return Promise.resolve(peer.issuerCertificate);
        }
        return new Promise((resolve, reject) => {
            const ocspAgent = new ocsp.Agent({});
            ocspAgent.fetchIssuer(peer, null, (error, value) => {
                if (!!error) {
                    reject(error);
                    return;
                }
                resolve(value);
            });
        });
    }
    static async GetResponseFromCache(signature, ocspRequest, proxyInfo) {
        let cachedResponse = CertCheckAgent.privMemCache[signature];
        if (!!cachedResponse) {
            this.onEvent(new OCSPMemoryCacheHitEvent(signature));
        }
        // Do we have a result for this certificate on disk in %TMP%?
        if (!cachedResponse) {
            try {
                const diskCacheResponse = await CertCheckAgent.privDiskCache.get(signature);
                if (!!diskCacheResponse.isCached) {
                    CertCheckAgent.onEvent(new OCSPDiskCacheHitEvent(signature));
                    CertCheckAgent.StoreMemoryCacheEntry(signature, diskCacheResponse.value);
                    cachedResponse = diskCacheResponse.value;
                }
            }
            catch (error) {
                cachedResponse = null;
            }
        }
        if (!cachedResponse) {
            return cachedResponse;
        }
        try {
            const cachedOcspResponse = ocsp.utils.parseResponse(cachedResponse);
            const tbsData = cachedOcspResponse.value.tbsResponseData;
            if (tbsData.responses.length < 1) {
                this.onEvent(new OCSPCacheFetchErrorEvent(signature, "Not enough data in cached response"));
                return;
            }
            const cachedStartTime = tbsData.responses[0].thisUpdate;
            const cachedNextTime = tbsData.responses[0].nextUpdate;
            if (cachedNextTime < (Date.now() + this.testTimeOffset - 60000)) {
                // Cached entry has expired.
                this.onEvent(new OCSPCacheEntryExpiredEvent(signature, cachedNextTime));
                cachedResponse = null;
            }
            else {
                // If we're within one day of the next update, or 50% of the way through the validity period,
                // background an update to the cache.
                const minUpdate = Math.min(24 * 60 * 60 * 1000, (cachedNextTime - cachedStartTime) / 2);
                if ((cachedNextTime - (Date.now() + this.testTimeOffset)) < minUpdate) {
                    this.onEvent(new OCSPCacheEntryNeedsRefreshEvent(signature, cachedStartTime, cachedNextTime));
                    this.UpdateCache(ocspRequest, proxyInfo).catch((error) => {
                        // Well, not much we can do here.
                        this.onEvent(new OCSPCacheUpdateErrorEvent(signature, error.toString()));
                    });
                }
                else {
                    this.onEvent(new OCSPCacheHitEvent(signature, cachedStartTime, cachedNextTime));
                }
            }
        }
        catch (error) {
            this.onEvent(new OCSPCacheFetchErrorEvent(signature, error));
            cachedResponse = null;
        }
        if (!cachedResponse) {
            this.onEvent(new OCSPCacheMissEvent(signature));
        }
        return cachedResponse;
    }
    static async VerifyOCSPResponse(cacheValue, ocspRequest, proxyInfo) {
        let ocspResponse = cacheValue;
        const sig = ocspRequest.certID.toString("hex");
        // Do we have a valid response?
        if (!ocspResponse) {
            ocspResponse = await CertCheckAgent.GetOCSPResponse(ocspRequest, proxyInfo);
        }
        return new Promise((resolve, reject) => {
            ocsp.verify({ request: ocspRequest, response: ocspResponse }, (error, result) => {
                if (!!error) {
                    CertCheckAgent.onEvent(new OCSPVerificationFailedEvent(ocspRequest.id.toString("hex"), error));
                    // Bad Cached Value? One more try without the cache.
                    if (!!cacheValue) {
                        this.VerifyOCSPResponse(null, ocspRequest, proxyInfo).then(() => {
                            resolve();
                        }, (error) => {
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
        });
    }
    static async UpdateCache(req, proxyInfo) {
        const signature = req.id.toString("hex");
        this.onEvent(new OCSPCacheUpdateNeededEvent(signature));
        const rawResponse = await this.GetOCSPResponse(req, proxyInfo);
        this.StoreCacheEntry(signature, rawResponse);
        this.onEvent(new OCSPCacheUpdatehCompleteEvent(req.id.toString("hex")));
    }
    static StoreCacheEntry(sig, rawResponse) {
        this.StoreMemoryCacheEntry(sig, rawResponse);
        this.StoreDiskCacheEntry(sig, rawResponse);
    }
    static StoreMemoryCacheEntry(sig, rawResponse) {
        this.privMemCache[sig] = rawResponse;
        this.onEvent(new OCSPMemoryCacheStoreEvent(sig));
    }
    static StoreDiskCacheEntry(sig, rawResponse) {
        this.privDiskCache.set(sig, rawResponse).then(() => {
            this.onEvent(new OCSPDiskCacheStoreEvent(sig));
        });
    }
    static GetOCSPResponse(req, proxyInfo) {
        const ocspMethod = "1.3.6.1.5.5.7.48.1";
        let options = {};
        if (!!proxyInfo) {
            const agent = CertCheckAgent.GetProxyAgent(proxyInfo);
            options.agent = agent;
        }
        return new Promise((resolve, reject) => {
            ocsp.utils.getAuthorityInfo(req.cert, ocspMethod, (error, uri) => {
                if (error) {
                    reject(error);
                    return;
                }
                const parsedUri = url.parse(uri);
                options = { ...options, ...parsedUri };
                ocsp.utils.getResponse(options, req.data, (error, raw) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    this.onEvent(new OCSPResponseRetrievedEvent(req.certID.toString("hex")));
                    resolve(raw);
                });
            });
        });
    }
    CreateConnection(request, options) {
        const enableOCSP = (typeof process !== "undefined" && process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "0" && process.env.SPEECH_CONDUCT_OCSP_CHECK !== "0") && options.secureEndpoint;
        let socketPromise;
        options = {
            ...options,
            ...{
                requestOCSP: !CertCheckAgent.forceDisableOCSPStapling,
                servername: options.host
            }
        };
        if (!!this.privProxyInfo) {
            const httpProxyAgent = CertCheckAgent.GetProxyAgent(this.privProxyInfo);
            const baseAgent = httpProxyAgent;
            socketPromise = new Promise((resolve, reject) => {
                baseAgent.callback(request, options, (error, socket) => {
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
    }
}
// Test hook to enable forcing expiration / refresh to happen.
CertCheckAgent.testTimeOffset = 0;
// Test hook to disable stapling for cache testing.
CertCheckAgent.forceDisableOCSPStapling = false;
// An in memory cache for recived responses.
CertCheckAgent.privMemCache = {};
CertCheckAgent.onEvent = (event) => {
    Events.instance.onEvent(event);
};

//# sourceMappingURL=CertChecks.js.map