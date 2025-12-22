/**
 * MediaError class.
 *
 * Small wrapper around the `Error` class
 * to hold an error code and a reference to a file object.
 */
export class UploadError extends Error {
  constructor({
    code,
    message,
    file,
    cause
  }) {
    super(message, {
      cause
    });
    Object.setPrototypeOf(this, new.target.prototype);
    this.code = code;
    this.file = file;
  }
}
//# sourceMappingURL=upload-error.js.map