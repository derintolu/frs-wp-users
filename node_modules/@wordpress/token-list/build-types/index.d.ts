/**
 * A set of tokens.
 *
 * @see https://dom.spec.whatwg.org/#domtokenlist
 */
export default class TokenList {
    private _currentValue;
    private _valueAsArray;
    /**
     * Constructs a new instance of TokenList.
     *
     * @param initialValue Initial value to assign.
     */
    constructor(initialValue?: string);
    entries(...args: Parameters<Array<string>['entries']>): ArrayIterator<[number, string]>;
    forEach(...args: Parameters<Array<string>['forEach']>): void;
    keys(...args: Parameters<Array<string>['keys']>): ArrayIterator<number>;
    values(...args: Parameters<Array<string>['values']>): ArrayIterator<string>;
    /**
     * Returns the associated set as string.
     *
     * @see https://dom.spec.whatwg.org/#dom-domtokenlist-value
     *
     * @return Token set as string.
     */
    get value(): string;
    /**
     * Replaces the associated set with a new string value.
     *
     * @see https://dom.spec.whatwg.org/#dom-domtokenlist-value
     *
     * @param value New token set as string.
     */
    set value(value: string);
    /**
     * Returns the number of tokens.
     *
     * @see https://dom.spec.whatwg.org/#dom-domtokenlist-length
     *
     * @return Number of tokens.
     */
    get length(): number;
    /**
     * Returns the stringified form of the TokenList.
     *
     * @see https://dom.spec.whatwg.org/#DOMTokenList-stringification-behavior
     * @see https://www.ecma-international.org/ecma-262/9.0/index.html#sec-tostring
     *
     * @return Token set as string.
     */
    toString(): string;
    /**
     * Returns an iterator for the TokenList, iterating items of the set.
     *
     * @see https://dom.spec.whatwg.org/#domtokenlist
     *
     * @return TokenList iterator.
     */
    [Symbol.iterator](): IterableIterator<string>;
    /**
     * Returns the token with index `index`.
     *
     * @see https://dom.spec.whatwg.org/#dom-domtokenlist-item
     *
     * @param index Index at which to return token.
     *
     * @return Token at index.
     */
    item(index: number): string | undefined;
    /**
     * Returns true if `token` is present, and false otherwise.
     *
     * @see https://dom.spec.whatwg.org/#dom-domtokenlist-contains
     *
     * @param item Token to test.
     *
     * @return Whether token is present.
     */
    contains(item: string): boolean;
    /**
     * Adds all arguments passed, except those already present.
     *
     * @see https://dom.spec.whatwg.org/#dom-domtokenlist-add
     *
     * @param items Items to add.
     */
    add(...items: string[]): void;
    /**
     * Removes arguments passed, if they are present.
     *
     * @see https://dom.spec.whatwg.org/#dom-domtokenlist-remove
     *
     * @param items Items to remove.
     */
    remove(...items: string[]): void;
    /**
     * If `force` is not given, "toggles" `token`, removing it if it’s present
     * and adding it if it’s not present. If `force` is true, adds token (same
     * as add()). If force is false, removes token (same as remove()). Returns
     * true if `token` is now present, and false otherwise.
     *
     * @see https://dom.spec.whatwg.org/#dom-domtokenlist-toggle
     *
     * @param token   Token to toggle.
     * @param [force] Presence to force.
     *
     * @return Whether token is present after toggle.
     */
    toggle(token: string, force?: boolean): boolean;
    /**
     * Replaces `token` with `newToken`. Returns true if `token` was replaced
     * with `newToken`, and false otherwise.
     *
     * @see https://dom.spec.whatwg.org/#dom-domtokenlist-replace
     *
     * @param token    Token to replace with `newToken`.
     * @param newToken Token to use in place of `token`.
     *
     * @return Whether replacement occurred.
     */
    replace(token: string, newToken: string): boolean;
    /**
     * Returns true if `token` is in the associated attribute’s supported
     * tokens. Returns false otherwise.
     *
     * Always returns `true` in this implementation.
     *
     * @param _token
     * @see https://dom.spec.whatwg.org/#dom-domtokenlist-supports
     *
     * @return Whether token is supported.
     */
    supports(_token: string): boolean;
}
//# sourceMappingURL=index.d.ts.map