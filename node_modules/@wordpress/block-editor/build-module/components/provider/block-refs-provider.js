/**
 * WordPress dependencies
 */
import { createContext, useMemo } from '@wordpress/element';
import { observableMap } from '@wordpress/compose';
import { jsx as _jsx } from "react/jsx-runtime";
export const BlockRefs = createContext({
  refsMap: observableMap()
});
export function BlockRefsProvider({
  children
}) {
  const value = useMemo(() => ({
    refsMap: observableMap()
  }), []);
  return /*#__PURE__*/_jsx(BlockRefs.Provider, {
    value: value,
    children: children
  });
}
//# sourceMappingURL=block-refs-provider.js.map