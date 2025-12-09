import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  className?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  className = '',
  onChange,
  placeholder = 'Start typing...',
  value,
}) => {
  const modules = useMemo(
    () => ({
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean'],
      ],
    }),
    []
  );

  const formats = [
    'bold',
    'italic',
    'underline',
    'list',
    'bullet',
    'link',
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        formats={formats}
        modules={modules}
        onChange={onChange}
        placeholder={placeholder}
        theme="snow"
        value={value}
      />
      <style>{`
        .rich-text-editor .ql-container {
          min-height: 150px;
          font-family: inherit;
        }
        .rich-text-editor .ql-editor {
          min-height: 150px;
          font-size: 14px;
          line-height: 1.5;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        .rich-text-editor .ql-toolbar {
          border: 1px solid #e5e7eb;
          border-bottom: none;
          border-radius: 6px 6px 0 0;
          background: #f9fafb;
        }
        .rich-text-editor .ql-container {
          border: 1px solid #e5e7eb;
          border-radius: 0 0 6px 6px;
        }
        .rich-text-editor .ql-editor:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};
