/**
 * WordPress dependencies
 */
import { __experimentalToolsPanelContext as ToolsPanelContext } from '@wordpress/components';
import { useContext, useMemo } from '@wordpress/element';
import { jsx as _jsx } from "react/jsx-runtime";
export default function BlockSupportSlotContainer({
  Slot,
  fillProps,
  ...props
}) {
  // Add the toolspanel context provider and value to existing fill props
  const toolsPanelContext = useContext(ToolsPanelContext);
  const computedFillProps = useMemo(() => {
    var _fillProps$forwardedC;
    return {
      ...(fillProps !== null && fillProps !== void 0 ? fillProps : {}),
      forwardedContext: [...((_fillProps$forwardedC = fillProps?.forwardedContext) !== null && _fillProps$forwardedC !== void 0 ? _fillProps$forwardedC : []), [ToolsPanelContext.Provider, {
        value: toolsPanelContext
      }]]
    };
  }, [toolsPanelContext, fillProps]);
  return /*#__PURE__*/_jsx(Slot, {
    ...props,
    fillProps: computedFillProps,
    bubblesVirtually: true
  });
}
//# sourceMappingURL=block-support-slot-container.js.map