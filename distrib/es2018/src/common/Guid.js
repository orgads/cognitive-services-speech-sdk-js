// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { v4 as uuid } from "uuid";
const createGuid = () => {
    return uuid();
};
const createNoDashGuid = () => {
    return createGuid().replace(new RegExp("-", "g"), "").toUpperCase();
};
export { createGuid, createNoDashGuid };

//# sourceMappingURL=Guid.js.map