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
var fs = __importStar(require("fs"));
var Contracts_1 = require("../Contracts");
var AudioFileWriter = /** @class */ (function () {
    function AudioFileWriter(filename) {
        var _this = this;
        this.id = function () {
            return _this.privId;
        };
        this.privFd = fs.openSync(filename, "w");
    }
    Object.defineProperty(AudioFileWriter.prototype, "format", {
        set: function (format) {
            Contracts_1.Contracts.throwIfNotUndefined(this.privAudioFormat, "format is already set");
            this.privAudioFormat = format;
            var headerOffset = 0;
            if (this.privAudioFormat.hasHeader) {
                headerOffset = this.privAudioFormat.header.byteLength;
            }
            if (this.privFd !== undefined) {
                this.privWriteStream = fs.createWriteStream("", { fd: this.privFd, start: headerOffset, autoClose: false });
            }
        },
        enumerable: true,
        configurable: true
    });
    AudioFileWriter.prototype.write = function (buffer) {
        Contracts_1.Contracts.throwIfNullOrUndefined(this.privAudioFormat, "must set format before writing.");
        if (this.privWriteStream !== undefined) {
            this.privWriteStream.write(new Uint8Array(buffer.slice(0)));
        }
    };
    AudioFileWriter.prototype.close = function () {
        var _this = this;
        if (this.privFd !== undefined) {
            this.privWriteStream.on("finish", function () {
                if (_this.privAudioFormat.hasHeader) {
                    _this.privAudioFormat.updateHeader(_this.privWriteStream.bytesWritten);
                    fs.writeSync(_this.privFd, new Int8Array(_this.privAudioFormat.header), 0, _this.privAudioFormat.header.byteLength, 0);
                }
                fs.closeSync(_this.privFd);
                _this.privFd = undefined;
            });
            this.privWriteStream.end();
        }
    };
    return AudioFileWriter;
}());
exports.AudioFileWriter = AudioFileWriter;

//# sourceMappingURL=AudioFileWriter.js.map