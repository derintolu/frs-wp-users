/**
 * ImageFile class.
 *
 * Small wrapper around the `File` class to hold
 * information about current dimensions and original
 * dimensions, in case the image was resized.
 */
export declare class ImageFile extends File {
    width: number;
    height: number;
    originalWidth?: number | undefined;
    originalHeight?: number | undefined;
    get wasResized(): boolean;
    constructor(file: File, width: number, height: number, originalWidth?: number, originalHeight?: number);
}
//# sourceMappingURL=image-file.d.ts.map