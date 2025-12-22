/**
 * WordPress dependencies
 */

import { ToolbarButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { rotateRight as rotateRightIcon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { useImageEditingContext } from './context';
import { jsx as _jsx } from "react/jsx-runtime";
export default function RotationButton() {
  const {
    isInProgress,
    rotateClockwise
  } = useImageEditingContext();
  return /*#__PURE__*/_jsx(ToolbarButton, {
    icon: rotateRightIcon,
    label: __('Rotate'),
    onClick: rotateClockwise,
    disabled: isInProgress
  });
}
//# sourceMappingURL=rotation-button.js.map