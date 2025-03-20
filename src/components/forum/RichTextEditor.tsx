import React, { useState } from 'react';
import { Bold, Italic, List, ListOrdered, Quote, ImageIcon, Link as LinkIcon } from 'lucide-react';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write something...',
  minHeight = '200px',
  className = ''
}) => {
  const [editor, setEditor] = useState<HTMLDivElement | null>(null);

  // Format handlers
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editor) {
      const content = editor.innerHTML;
      onChange(content);
      editor.focus();
    }
  };

  const handleBold = () => formatText('bold');
  const handleItalic = () => formatText('italic');
  const handleUnorderedList = () => formatText('insertUnorderedList');
  const handleOrderedList = () => formatText('insertOrderedList');
  const handleBlockquote = () => formatText('formatBlock', '<blockquote>');

  const handleLink = () => {
    const url = prompt('Enter link URL:');
    if (url) formatText('createLink', url);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Update parent component when content changes
  const handleContentChange = () => {
    if (editor) {
      onChange(editor.innerHTML);
    }
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      <div className="rich-text-toolbar">
        <button type="button" onClick={handleBold} title="Bold">
          <Bold size={16} />
        </button>
        <button type="button" onClick={handleItalic} title="Italic">
          <Italic size={16} />
        </button>
        <button type="button" onClick={handleUnorderedList} title="Bullet List">
          <List size={16} />
        </button>
        <button type="button" onClick={handleOrderedList} title="Numbered List">
          <ListOrdered size={16} />
        </button>
        <button type="button" onClick={handleBlockquote} title="Quote">
          <Quote size={16} />
        </button>
        <button type="button" onClick={handleLink} title="Insert Link">
          <LinkIcon size={16} />
        </button>
      </div>
      <div
        className="rich-text-content"
        ref={(el) => setEditor(el)}
        contentEditable
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={handleContentChange}
        onPaste={handlePaste}
        placeholder={placeholder}
        style={{ minHeight }}
      />
    </div>
  );
};

export default RichTextEditor;
