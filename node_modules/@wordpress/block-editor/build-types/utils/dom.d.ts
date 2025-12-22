/**
 * Returns true if two elements are contained within the same block.
 *
 * @param {Element} a First element.
 * @param {Element} b Second element.
 *
 * @return {boolean} Whether elements are in the same block.
 */
export function isInSameBlock(a: Element, b: Element): boolean;
/**
 * Returns true if an element is considered part of the block and not its inner
 * blocks or appender.
 *
 * @param {Element} blockElement Block container element.
 * @param {Element} element      Element.
 *
 * @return {boolean} Whether an element is considered part of the block and not
 *                   its inner blocks or appender.
 */
export function isInsideRootBlock(blockElement: Element, element: Element): boolean;
/**
 * Finds the block client ID given any DOM node inside the block.
 *
 * @param {Node?} node DOM node.
 *
 * @return {string|undefined} Client ID or undefined if the node is not part of
 *                            a block.
 */
export function getBlockClientId(node: Node | null): string | undefined;
/**
 * Calculates the union of two rectangles.
 *
 * @param {DOMRect} rect1 First rectangle.
 * @param {DOMRect} rect2 Second rectangle.
 * @return {DOMRect} Union of the two rectangles.
 */
export function rectUnion(rect1: DOMRect, rect2: DOMRect): DOMRect;
/**
 * Returns the bounding rectangle of an element, with special handling for blocks
 * that have visible overflowing children (defined in WITH_OVERFLOW_ELEMENT_BLOCKS).
 *
 * For blocks like Navigation that can have overflowing elements (e.g. submenus),
 * this function calculates the combined bounds of both the parent and its visible
 * children. The returned rect may extend beyond the viewport.
 * The returned rect represents the full extent of the element and its visible
 * children, which may extend beyond the viewport.
 *
 * @param {Element} element Element.
 * @return {DOMRect} Bounding client rect of the element and its visible children.
 */
export function getElementBounds(element: Element): DOMRect;
export const WITH_OVERFLOW_ELEMENT_BLOCKS: string[];
//# sourceMappingURL=dom.d.ts.map