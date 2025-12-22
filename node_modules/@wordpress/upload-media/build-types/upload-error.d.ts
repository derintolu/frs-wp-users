interface UploadErrorArgs {
    code: string;
    message: string;
    file: File;
    cause?: Error;
}
/**
 * MediaError class.
 *
 * Small wrapper around the `Error` class
 * to hold an error code and a reference to a file object.
 */
export declare class UploadError extends Error {
    code: string;
    file: File;
    constructor({ code, message, file, cause }: UploadErrorArgs);
}
export {};
//# sourceMappingURL=upload-error.d.ts.map