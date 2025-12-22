/**
 * External dependencies
 */
import { TextInput } from 'react-native';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { jsx as _jsx } from "react/jsx-runtime";
export default function URLInput({
  value = '',
  autoFocus = true,
  onChange,
  ...extraProps
}) {
  /* eslint-disable jsx-a11y/no-autofocus */
  return /*#__PURE__*/_jsx(TextInput, {
    autoFocus: autoFocus,
    editable: true,
    selectTextOnFocus: true,
    autoCapitalize: "none",
    autoCorrect: false,
    textContentType: "URL",
    value: value,
    onChangeText: onChange,
    placeholder: __('Paste URL'),
    ...extraProps
  });
  /* eslint-enable jsx-a11y/no-autofocus */
}
//# sourceMappingURL=index.native.js.map