/**
 * Internal dependencies
 */
import type { QueueItem, Settings, State } from './types';
/**
 * Returns all items currently being uploaded.
 *
 * @param state Upload state.
 *
 * @return Queue items.
 */
export declare function getItems(state: State): QueueItem[];
/**
 * Determines whether any upload is currently in progress.
 *
 * @param state Upload state.
 *
 * @return Whether any upload is currently in progress.
 */
export declare function isUploading(state: State): boolean;
/**
 * Determines whether an upload is currently in progress given an attachment URL.
 *
 * @param state Upload state.
 * @param url   Attachment URL.
 *
 * @return Whether upload is currently in progress for the given attachment.
 */
export declare function isUploadingByUrl(state: State, url: string): boolean;
/**
 * Determines whether an upload is currently in progress given an attachment ID.
 *
 * @param state        Upload state.
 * @param attachmentId Attachment ID.
 *
 * @return Whether upload is currently in progress for the given attachment.
 */
export declare function isUploadingById(state: State, attachmentId: number): boolean;
/**
 * Returns the media upload settings.
 *
 * @param state Upload state.
 *
 * @return Settings
 */
export declare function getSettings(state: State): Settings;
//# sourceMappingURL=selectors.d.ts.map