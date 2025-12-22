/**
 * Internal dependencies
 */
import type { StoreState } from './types';
/**
 * Returns a boolean indicating whether a prefer is active for a particular
 * scope.
 *
 * @param {StoreState} state The store state.
 * @param {string}     scope The scope of the feature (e.g. core/edit-post).
 * @param {string}     name  The name of the feature.
 *
 * @return {*} Is the feature enabled?
 */
export declare const get: (state: StoreState, scope: string, name: string) => any;
//# sourceMappingURL=selectors.d.ts.map