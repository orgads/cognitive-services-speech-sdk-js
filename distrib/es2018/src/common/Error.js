// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// tslint:disable:max-classes-per-file
/**
 * The error that is thrown when an argument passed in is null.
 *
 * @export
 * @class ArgumentNullError
 * @extends {Error}
 */
export class ArgumentNullError extends Error {
    /**
     * Creates an instance of ArgumentNullError.
     *
     * @param {string} argumentName - Name of the argument that is null
     *
     * @memberOf ArgumentNullError
     */
    constructor(argumentName) {
        super(argumentName);
        this.name = "ArgumentNull";
        this.message = argumentName;
    }
}
/**
 * The error that is thrown when an invalid operation is performed in the code.
 *
 * @export
 * @class InvalidOperationError
 * @extends {Error}
 */
export class InvalidOperationError extends Error {
    /**
     * Creates an instance of InvalidOperationError.
     *
     * @param {string} error - The error
     *
     * @memberOf InvalidOperationError
     */
    constructor(error) {
        super(error);
        this.name = "InvalidOperation";
        this.message = error;
    }
}
/**
 * The error that is thrown when an object is disposed.
 *
 * @export
 * @class ObjectDisposedError
 * @extends {Error}
 */
// tslint:disable-next-line:max-classes-per-file
export class ObjectDisposedError extends Error {
    /**
     * Creates an instance of ObjectDisposedError.
     *
     * @param {string} objectName - The object that is disposed
     * @param {string} error - The error
     *
     * @memberOf ObjectDisposedError
     */
    constructor(objectName, error) {
        super(error);
        this.name = objectName + "ObjectDisposed";
        this.message = error;
    }
}

//# sourceMappingURL=Error.js.map