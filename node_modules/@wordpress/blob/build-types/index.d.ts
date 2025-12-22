/**
 * Create a blob URL from a file.
 *
 * @param file The file to create a blob URL for.
 *
 * @return The blob URL.
 */
export declare function createBlobURL(file: File): string;
/**
 * Retrieve a file based on a blob URL. The file must have been created by
 * `createBlobURL` and not removed by `revokeBlobURL`, otherwise it will return
 * `undefined`.
 *
 * @param url The blob URL.
 *
 * @return The file for the blob URL.
 */
export declare function getBlobByURL(url: string): File | undefined;
/**
 * Retrieve a blob type based on URL. The file must have been created by
 * `createBlobURL` and not removed by `revokeBlobURL`, otherwise it will return
 * `undefined`.
 *
 * @param url The blob URL.
 *
 * @return The blob type.
 */
export declare function getBlobTypeByURL(url: string): string | undefined;
/**
 * Remove the resource and file cache from memory.
 *
 * @param url The blob URL.
 */
export declare function revokeBlobURL(url: string): void;
/**
 * Check whether a url is a blob url.
 *
 * @param url The URL.
 *
 * @return Is the url a blob url?
 */
export declare function isBlobURL(url: string | undefined): boolean;
/**
 * Downloads a file, e.g., a text or readable stream, in the browser.
 * Appropriate for downloading smaller file sizes, e.g., < 5 MB.
 *
 * Example usage:
 *
 * ```js
 * 	const fileContent = JSON.stringify(
 * 		{
 * 			"title": "My Post",
 * 		},
 * 		null,
 * 		2
 * 	);
 * 	const filename = 'file.json';
 *
 * 	downloadBlob( filename, fileContent, 'application/json' );
 * ```
 *
 * @param filename    File name.
 * @param content     File content (BufferSource | Blob | string).
 * @param contentType (Optional) File mime type. Default is `''`.
 */
export declare function downloadBlob(filename: string, content: BlobPart, contentType?: string): void;
//# sourceMappingURL=index.d.ts.map