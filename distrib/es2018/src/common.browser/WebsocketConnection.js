// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { ArgumentNullError, createNoDashGuid, } from "../common/Exports";
import { WebsocketMessageAdapter } from "./WebsocketMessageAdapter";
export class WebsocketConnection {
    constructor(uri, queryParameters, headers, messageFormatter, proxyInfo, enableCompression = false, connectionId) {
        this.privIsDisposed = false;
        this.isDisposed = () => {
            return this.privIsDisposed;
        };
        this.state = () => {
            return this.privConnectionMessageAdapter.state;
        };
        this.open = () => {
            return this.privConnectionMessageAdapter.open();
        };
        this.send = (message) => {
            return this.privConnectionMessageAdapter.send(message);
        };
        this.read = () => {
            return this.privConnectionMessageAdapter.read();
        };
        if (!uri) {
            throw new ArgumentNullError("uri");
        }
        if (!messageFormatter) {
            throw new ArgumentNullError("messageFormatter");
        }
        this.privMessageFormatter = messageFormatter;
        let queryParams = "";
        let i = 0;
        if (queryParameters) {
            for (const paramName in queryParameters) {
                if (paramName) {
                    queryParams += ((i === 0) && (uri.indexOf("?") === -1)) ? "?" : "&";
                    const val = encodeURIComponent(queryParameters[paramName]);
                    queryParams += `${paramName}=${val}`;
                    i++;
                }
            }
        }
        if (headers) {
            for (const headerName in headers) {
                if (headerName) {
                    queryParams += ((i === 0) && (uri.indexOf("?") === -1)) ? "?" : "&";
                    const val = encodeURIComponent(headers[headerName]);
                    queryParams += `${headerName}=${val}`;
                    i++;
                }
            }
        }
        this.privUri = uri + queryParams;
        this.privId = connectionId ? connectionId : createNoDashGuid();
        this.privConnectionMessageAdapter = new WebsocketMessageAdapter(this.privUri, this.id, this.privMessageFormatter, proxyInfo, headers, enableCompression);
    }
    async dispose() {
        this.privIsDisposed = true;
        if (this.privConnectionMessageAdapter) {
            await this.privConnectionMessageAdapter.close();
        }
    }
    get id() {
        return this.privId;
    }
    get events() {
        return this.privConnectionMessageAdapter.events;
    }
}

//# sourceMappingURL=WebsocketConnection.js.map