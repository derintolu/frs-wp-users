/**
 * WordPress dependencies
 */
import { forwardRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import RichText from '../rich-text';
import { jsx as _jsx } from "react/jsx-runtime";
const EditableText = forwardRef((props, ref) => {
  return /*#__PURE__*/_jsx(RichText, {
    ref: ref,
    ...props,
    __unstableDisableFormats: true
  });
});
EditableText.Content = ({
  value = '',
  tagName: Tag = 'div',
  ...props
}) => {
  return /*#__PURE__*/_jsx(Tag, {
    ...props,
    children: value
  });
};

/**
 * Renders an editable text input in which text formatting is not allowed.
 */
export default EditableText;
//# sourceMappingURL=index.js.map