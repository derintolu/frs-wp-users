/**
 * WordPress dependencies
 */
import { createContext, useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { getLayoutType } from '../../layouts';
import { useSettings } from '../use-settings';
import { jsx as _jsx } from "react/jsx-runtime";
export const defaultLayout = {
  type: 'default'
};
const Layout = createContext(defaultLayout);

/**
 * Allows to define the layout.
 */
export const LayoutProvider = Layout.Provider;

/**
 * React hook used to retrieve the layout config.
 */
export function useLayout() {
  return useContext(Layout);
}
export function LayoutStyle({
  layout = {},
  css,
  ...props
}) {
  const layoutType = getLayoutType(layout.type);
  const [blockGapSupport] = useSettings('spacing.blockGap');
  const hasBlockGapSupport = blockGapSupport !== null;
  if (layoutType) {
    if (css) {
      return /*#__PURE__*/_jsx("style", {
        children: css
      });
    }
    const layoutStyle = layoutType.getLayoutStyle?.({
      hasBlockGapSupport,
      layout,
      ...props
    });
    if (layoutStyle) {
      return /*#__PURE__*/_jsx("style", {
        children: layoutStyle
      });
    }
  }
  return null;
}
//# sourceMappingURL=layout.js.map