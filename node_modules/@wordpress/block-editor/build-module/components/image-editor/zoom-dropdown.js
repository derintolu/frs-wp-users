/**
 * WordPress dependencies
 */
import { ToolbarButton, RangeControl, Dropdown, __experimentalDropdownContentWrapper as DropdownContentWrapper } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { search } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { MIN_ZOOM, MAX_ZOOM, POPOVER_PROPS } from './constants';
import { useImageEditingContext } from './context';
import { jsx as _jsx } from "react/jsx-runtime";
export default function ZoomDropdown() {
  const {
    isInProgress,
    zoom,
    setZoom
  } = useImageEditingContext();
  return /*#__PURE__*/_jsx(Dropdown, {
    contentClassName: "wp-block-image__zoom",
    popoverProps: POPOVER_PROPS,
    renderToggle: ({
      isOpen,
      onToggle
    }) => /*#__PURE__*/_jsx(ToolbarButton, {
      icon: search,
      label: __('Zoom'),
      onClick: onToggle,
      "aria-expanded": isOpen,
      disabled: isInProgress
    }),
    renderContent: () => /*#__PURE__*/_jsx(DropdownContentWrapper, {
      paddingSize: "medium",
      children: /*#__PURE__*/_jsx(RangeControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        label: __('Zoom'),
        min: MIN_ZOOM,
        max: MAX_ZOOM,
        value: Math.round(zoom),
        onChange: setZoom
      })
    })
  });
}
//# sourceMappingURL=zoom-dropdown.js.map