"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
var PromiseState;
(function (PromiseState) {
    PromiseState[PromiseState["None"] = 0] = "None";
    PromiseState[PromiseState["Resolved"] = 1] = "Resolved";
    PromiseState[PromiseState["Rejected"] = 2] = "Rejected";
})(PromiseState = exports.PromiseState || (exports.PromiseState = {}));
var PromiseResult = /** @class */ (function () {
    function PromiseResult(promiseResultEventSource) {
        var _this = this;
        this.throwIfError = function () {
            if (_this.isError) {
                throw _this.error;
            }
        };
        promiseResultEventSource.on(function (result) {
            if (!_this.privIsCompleted) {
                _this.privIsCompleted = true;
                _this.privIsError = false;
                _this.privResult = result;
            }
        }, function (error) {
            if (!_this.privIsCompleted) {
                _this.privIsCompleted = true;
                _this.privIsError = true;
                _this.privError = error;
            }
        });
    }
    Object.defineProperty(PromiseResult.prototype, "isCompleted", {
        get: function () {
            return this.privIsCompleted;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PromiseResult.prototype, "isError", {
        get: function () {
            return this.privIsError;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PromiseResult.prototype, "error", {
        get: function () {
            return this.privError;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PromiseResult.prototype, "result", {
        get: function () {
            return this.privResult;
        },
        enumerable: true,
        configurable: true
    });
    return PromiseResult;
}());
exports.PromiseResult = PromiseResult;
var PromiseResultEventSource = /** @class */ (function () {
    function PromiseResultEventSource() {
        var _this = this;
        this.setResult = function (result) {
            _this.privOnSetResult(result);
        };
        this.setError = function (error) {
            _this.privOnSetError(error);
        };
        this.on = function (onSetResult, onSetError) {
            _this.privOnSetResult = onSetResult;
            _this.privOnSetError = onSetError;
        };
    }
    return PromiseResultEventSource;
}());
exports.PromiseResultEventSource = PromiseResultEventSource;
var Deferred = /** @class */ (function () {
    function Deferred() {
        var _this = this;
        this.resolve = function (result) {
            _this.privResolve(result);
            return _this;
        };
        this.reject = function (error) {
            _this.privReject(error);
            return _this;
        };
        this.privPromise = new Promise(function (resolve, reject) {
            _this.privResolve = resolve;
            _this.privReject = reject;
        });
    }
    Object.defineProperty(Deferred.prototype, "promise", {
        get: function () {
            return this.privPromise;
        },
        enumerable: true,
        configurable: true
    });
    return Deferred;
}());
exports.Deferred = Deferred;
var Sink = /** @class */ (function () {
    function Sink() {
        var _this = this;
        this.privState = PromiseState.None;
        this.privPromiseResult = null;
        this.privPromiseResultEvents = null;
        this.privSuccessHandlers = [];
        this.privErrorHandlers = [];
        this.resolve = function (result) {
            if (_this.privState !== PromiseState.None) {
                throw new Error("'Cannot resolve a completed promise'");
            }
            _this.privState = PromiseState.Resolved;
            _this.privPromiseResultEvents.setResult(result);
            for (var i = 0; i < _this.privSuccessHandlers.length; i++) {
                _this.executeSuccessCallback(result, _this.privSuccessHandlers[i], _this.privErrorHandlers[i]);
            }
            _this.detachHandlers();
        };
        this.reject = function (error) {
            if (_this.privState !== PromiseState.None) {
                throw new Error("'Cannot reject a completed promise'");
            }
            _this.privState = PromiseState.Rejected;
            _this.privPromiseResultEvents.setError(error);
            for (var _i = 0, _a = _this.privErrorHandlers; _i < _a.length; _i++) {
                var errorHandler = _a[_i];
                _this.executeErrorCallback(error, errorHandler);
            }
            _this.detachHandlers();
        };
        this.on = function (successCallback, errorCallback) {
            if (successCallback == null) {
                successCallback = function (r) { return; };
            }
            if (_this.privState === PromiseState.None) {
                _this.privSuccessHandlers.push(successCallback);
                _this.privErrorHandlers.push(errorCallback);
            }
            else {
                if (_this.privState === PromiseState.Resolved) {
                    _this.executeSuccessCallback(_this.privPromiseResult.result, successCallback, errorCallback);
                }
                else if (_this.privState === PromiseState.Rejected) {
                    _this.executeErrorCallback(_this.privPromiseResult.error, errorCallback);
                }
                _this.detachHandlers();
            }
        };
        this.executeSuccessCallback = function (result, successCallback, errorCallback) {
            try {
                successCallback(result);
            }
            catch (e) {
                _this.executeErrorCallback("'Unhandled callback error: " + e + "'", errorCallback);
            }
        };
        this.executeErrorCallback = function (error, errorCallback) {
            if (errorCallback) {
                try {
                    errorCallback(error);
                }
                catch (e) {
                    throw new Error("'Unhandled callback error: " + e + ". InnerError: " + error + "'");
                }
            }
            else {
                throw new Error("'Unhandled error: " + error + "'");
            }
        };
        this.detachHandlers = function () {
            _this.privErrorHandlers = [];
            _this.privSuccessHandlers = [];
        };
        this.privPromiseResultEvents = new PromiseResultEventSource();
        this.privPromiseResult = new PromiseResult(this.privPromiseResultEvents);
    }
    Object.defineProperty(Sink.prototype, "state", {
        get: function () {
            return this.privState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sink.prototype, "result", {
        get: function () {
            return this.privPromiseResult;
        },
        enumerable: true,
        configurable: true
    });
    return Sink;
}());
exports.Sink = Sink;
function marshalPromiseToCallbacks(promise, cb, err) {
    promise.then(function (val) {
        try {
            if (!!cb) {
                cb(val);
            }
        }
        catch (error) {
            if (!!err) {
                try {
                    if (error instanceof Error) {
                        var typedError = error;
                        err(typedError.name + ": " + typedError.message);
                    }
                    else {
                        err(error);
                    }
                    /* tslint:disable:no-empty */
                }
                catch (error) { }
            }
        }
    }, function (error) {
        if (!!err) {
            try {
                if (error instanceof Error) {
                    var typedError = error;
                    err(typedError.name + ": " + typedError.message);
                }
                else {
                    err(error);
                }
                /* tslint:disable:no-empty */
            }
            catch (error) { }
        }
    });
}
exports.marshalPromiseToCallbacks = marshalPromiseToCallbacks;

//# sourceMappingURL=Promise.js.map