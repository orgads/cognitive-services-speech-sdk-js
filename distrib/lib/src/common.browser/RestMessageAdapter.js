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
var Exports_1 = require("../common/Exports");
// Node.JS specific xmlhttprequest / browser support.
var XHR = __importStar(require("xmlhttprequest-ts"));
var RestRequestType;
(function (RestRequestType) {
    RestRequestType["Get"] = "get";
    RestRequestType["Post"] = "post";
    RestRequestType["Delete"] = "delete";
    RestRequestType["File"] = "file";
})(RestRequestType = exports.RestRequestType || (exports.RestRequestType = {}));
// accept rest operations via request method and return abstracted objects from server response
var RestMessageAdapter = /** @class */ (function () {
    function RestMessageAdapter(configParams, connectionId) {
        if (!configParams) {
            throw new Exports_1.ArgumentNullError("configParams");
        }
        this.privHeaders = configParams.headers;
        this.privTimeout = configParams.timeout;
        this.privIgnoreCache = configParams.ignoreCache;
    }
    RestMessageAdapter.prototype.setHeaders = function (key, value) {
        this.privHeaders[key] = value;
    };
    RestMessageAdapter.prototype.request = function (method, uri, queryParams, body, binaryBody) {
        var _this = this;
        if (queryParams === void 0) { queryParams = {}; }
        if (body === void 0) { body = null; }
        if (binaryBody === void 0) { binaryBody = null; }
        var responseReceivedDeferral = new Exports_1.Deferred();
        var xhr;
        if (typeof (XMLHttpRequest) === "undefined") {
            xhr = new XHR.XMLHttpRequest();
        }
        else {
            xhr = new XMLHttpRequest();
        }
        var requestCommand = method === RestRequestType.File ? "post" : method;
        xhr.open(requestCommand, this.withQuery(uri, queryParams), true);
        if (this.privHeaders) {
            Object.keys(this.privHeaders).forEach(function (key) { return xhr.setRequestHeader(key, _this.privHeaders[key]); });
        }
        if (this.privIgnoreCache) {
            xhr.setRequestHeader("Cache-Control", "no-cache");
        }
        xhr.timeout = this.privTimeout;
        xhr.onload = function () {
            responseReceivedDeferral.resolve(_this.parseXHRResult(xhr));
        };
        xhr.onerror = function () {
            responseReceivedDeferral.resolve(_this.errorResponse(xhr, "Failed to make request."));
        };
        xhr.ontimeout = function () {
            responseReceivedDeferral.resolve(_this.errorResponse(xhr, "Request took longer than expected."));
        };
        if (method === RestRequestType.File && binaryBody) {
            xhr.setRequestHeader("Content-Type", "multipart/form-data");
            xhr.send(binaryBody);
        }
        else if (method === RestRequestType.Post && body) {
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify(body));
        }
        else {
            xhr.send();
        }
        return responseReceivedDeferral.promise;
    };
    RestMessageAdapter.prototype.parseXHRResult = function (xhr) {
        return {
            data: xhr.responseText,
            headers: xhr.getAllResponseHeaders(),
            json: function () { return JSON.parse(xhr.responseText); },
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            statusText: xhr.statusText,
        };
    };
    RestMessageAdapter.prototype.errorResponse = function (xhr, message) {
        if (message === void 0) { message = null; }
        return {
            data: message || xhr.statusText,
            headers: xhr.getAllResponseHeaders(),
            json: function () { return JSON.parse(message || ("\"" + xhr.statusText + "\"")); },
            ok: false,
            status: xhr.status,
            statusText: xhr.statusText,
        };
    };
    RestMessageAdapter.prototype.withQuery = function (url, params) {
        if (params === void 0) { params = {}; }
        var queryString = this.queryParams(params);
        return queryString ? url + (url.indexOf("?") === -1 ? "?" : "&") + queryString : url;
    };
    RestMessageAdapter.prototype.queryParams = function (params) {
        if (params === void 0) { params = {}; }
        return Object.keys(params)
            .map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]); })
            .join("&");
    };
    return RestMessageAdapter;
}());
exports.RestMessageAdapter = RestMessageAdapter;

//# sourceMappingURL=RestMessageAdapter.js.map