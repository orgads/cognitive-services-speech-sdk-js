"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var RestConfigBase_1 = require("../../common.browser/RestConfigBase");
// Node.JS specific xmlhttprequest / browser support.
var XHR = __importStar(require("xmlhttprequest-ts"));
/**
 * Config settings for Conversation Translator
 */
/**
 * Helpers for sending / receiving HTTPS requests / responses.
 * @param params
 */
function queryParams(params) {
    if (params === void 0) { params = {}; }
    return Object.keys(params)
        .map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]); })
        .join("&");
}
function withQuery(url, params) {
    if (params === void 0) { params = {}; }
    var queryString = queryParams(params);
    return queryString ? url + (url.indexOf("?") === -1 ? "?" : "&") + queryString : url;
}
function parseXHRResult(xhr) {
    return {
        data: xhr.responseText,
        headers: xhr.getAllResponseHeaders(),
        json: function () { return JSON.parse(xhr.responseText); },
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        statusText: xhr.statusText,
    };
}
function errorResponse(xhr, message) {
    if (message === void 0) { message = null; }
    return {
        data: message || xhr.statusText,
        headers: xhr.getAllResponseHeaders(),
        json: function () { return JSON.parse(message || ("\"" + xhr.statusText + "\"")); },
        ok: false,
        status: xhr.status,
        statusText: xhr.statusText,
    };
}
function extractHeaderValue(headerKey, headers) {
    var headerValue = "";
    try {
        var arr = headers.trim().split(/[\r\n]+/);
        var headerMap_1 = {};
        arr.forEach(function (line) {
            var parts = line.split(": ");
            var header = parts.shift().toLowerCase();
            var value = parts.join(": ");
            headerMap_1[header] = value;
        });
        headerValue = headerMap_1[headerKey.toLowerCase()];
    }
    catch (e) {
        // ignore the error
    }
    return headerValue;
}
exports.extractHeaderValue = extractHeaderValue;
function request(method, url, queryParams, body, options, callback) {
    if (queryParams === void 0) { queryParams = {}; }
    if (body === void 0) { body = null; }
    if (options === void 0) { options = {}; }
    var defaultRequestOptions = RestConfigBase_1.RestConfigBase.requestOptions;
    var ignoreCache = options.ignoreCache || defaultRequestOptions.ignoreCache;
    var headers = options.headers || defaultRequestOptions.headers;
    var timeout = options.timeout || defaultRequestOptions.timeout;
    var xhr;
    if (typeof window === "undefined") { // Node
        xhr = new XHR.XMLHttpRequest();
    }
    else {
        xhr = new XMLHttpRequest();
    }
    xhr.open(method, withQuery(url, queryParams), true);
    if (headers) {
        Object.keys(headers).forEach(function (key) { return xhr.setRequestHeader(key, headers[key]); });
    }
    if (ignoreCache) {
        xhr.setRequestHeader("Cache-Control", "no-cache");
    }
    xhr.timeout = timeout;
    xhr.onload = function (evt) {
        callback(parseXHRResult(xhr));
    };
    xhr.onerror = function (evt) {
        callback(errorResponse(xhr, "Failed to make request."));
    };
    xhr.ontimeout = function (evt) {
        callback(errorResponse(xhr, "Request took longer than expected."));
    };
    if (method === "post" && body) {
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(body));
    }
    else {
        xhr.send();
    }
}
exports.request = request;
function PromiseToEmptyCallback(promise, cb, err) {
    if (!!promise) {
        promise.then(function (result) {
            try {
                if (!!cb) {
                    cb();
                }
            }
            catch (e) {
                if (!!err) {
                    err("'Unhandled error on promise callback: " + e + "'");
                }
            }
        }, function (reason) {
            try {
                if (!!err) {
                    err(reason);
                }
                /* tslint:disable:no-empty */
            }
            catch (error) {
            }
        });
    }
    else {
        if (!!err) {
            err("Null promise");
        }
    }
}
exports.PromiseToEmptyCallback = PromiseToEmptyCallback;

//# sourceMappingURL=ConversationUtils.js.map