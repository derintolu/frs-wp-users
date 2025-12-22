/**
 * Internal dependencies
 */
import type { StoreState } from './types';
import type { AvailableActions } from './actions';
/**
 * Reducer returning the defaults for user preferences.
 *
 * This is kept intentionally separate from the preferences
 * themselves so that defaults are not persisted.
 *
 * @param state  Current state.
 * @param action Dispatched action.
 *
 * @return Updated state.
 */
export declare function defaults(state: StoreState["defaults"] | undefined, action: AvailableActions): StoreState['defaults'];
/**
 * Reducer returning the user preferences.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @return {Object} Updated state.
 */
export declare const preferences: (state: StoreState["preferences"], action: AvailableActions) => any;
declare const _default: import("redux").Reducer<{
    defaults: {
        [x: string]: {
            [x: string]: any;
        };
    };
    preferences: any;
}, AvailableActions, Partial<{
    defaults: never;
    preferences: never;
}>>;
export default _default;
//# sourceMappingURL=reducer.d.ts.map