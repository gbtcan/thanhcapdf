import React from 'react';
import { EditorState, RichUtils } from 'draft-js';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code, Image, Link as LinkIcon, Heading1, Heading2, Undo, Redo
} from 'lucide-react';

interface TextEditorToolbarProps {
  editorState: EditorState;
  onEditorStateChange: (editorState: EditorState) => void;
  onImageClick: () => void;
  imagesEnabled: boolean;
}

const TextEditorToolbar: React.FC<TextEditorToolbarProps> = ({
  editorState,
  onEditorStateChange,
  onImageClick,
  imagesEnabled
}) => {
  // Toggle inline style
  const toggleInlineStyle = (style: string) => {
    onEditorStateChange(RichUtils.toggleInlineStyle(editorState, style));
  };
  
  // Toggle block type
  const toggleBlockType = (blockType: string) => {
    onEditorStateChange(RichUtils.toggleBlockType(editorState, blockType));
  };
  
  // Check if a style is active
  const hasInlineStyle = (style: string) => {
    const currentStyle = editorState.getCurrentInlineStyle();
    return currentStyle.has(style);
  };
  
  // Check if a block type is active
  const hasBlockType = (blockType: string) => {
    const selection = editorState.getSelection();
    const currentBlockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
    
    return currentBlockType === blockType;
  };
  
  // Handle undo/redo
  const handleUndo = () => {
    onEditorStateChange(EditorState.undo(editorState));
  };
  
  const handleRedo = () => {
    onEditorStateChange(EditorState.redo(editorState));
  };
  
  // Handle links
  const addLink = () => {
    const selection = editorState.getSelection();
    const link = window.prompt('Enter a URL:');
    
    if (!link) {
      onEditorStateChange(RichUtils.toggleLink(editorState, selection, null));
      return;
    }
    
    const content = editorState.getCurrentContent();
    const contentWithEntity = content.createEntity('LINK', 'MUTABLE', { url: link });
    const entityKey = contentWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, { currentContent: contentWithEntity });
    
    onEditorStateChange(RichUtils.toggleLink(newEditorState, selection, entityKey));
  };
  
  // Button style classes
  const getButtonClasses = (active: boolean) => {
    return `p-2 rounded-md ${
      active 
        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' 
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
    }`;
  };
  
  return (
    <div className="text-editor-toolbar flex flex-wrap items-center gap-1 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-t-lg">
      {/* Text formatting */}
      <div className="flex space-x-1 mr-2 border-r border-gray-200 dark:border-gray-700 pr-2">
        <button
          type="button"
          onClick={() => toggleInlineStyle('BOLD')}
          className={getButtonClasses(hasInlineStyle('BOLD'))}
          title="Bold (Ctrl+B)"
        >
          <Bold size={18} />
        </button>
        
        <button
          type="button"
          onClick={() => toggleInlineStyle('ITALIC')}
          className={getButtonClasses(hasInlineStyle('ITALIC'))}
          title="Italic (Ctrl+I)"
        >
          <Italic size={18} />
        </button>
        
        <button
          type="button"
          onClick={() => toggleInlineStyle('UNDERLINE')}
          className={getButtonClasses(hasInlineStyle('UNDERLINE'))}
          title="Underline (Ctrl+U)"
        >
          <Underline size={18} />
        </button>
        
        {/* Add inline code button */}
        <button
          type="button"
          onClick={() => toggleInlineStyle('CODE')}
          className={getButtonClasses(hasInlineStyle('CODE'))}
          title="Inline Code"
        >
          <Code size={18} />
        </button>
      </div>
      
      {/* Headings */}
      <div className="flex space-x-1 mr-2 border-r border-gray-200 dark:border-gray-700 pr-2">
        <button
          type="button"
          onClick={() => toggleBlockType('header-one')}
          className={getButtonClasses(hasBlockType('header-one'))}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        
        <button
          type="button"
          onClick={() => toggleBlockType('header-two')}
          className={getButtonClasses(hasBlockType('header-two'))}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
      </div>
      
      {/* Lists and alignment */}
      <div className="flex space-x-1 mr-2 border-r border-gray-200 dark:border-gray-700 pr-2">
        <button
          type="button"
          onClick={() => toggleBlockType('unordered-list-item')}
          className={getButtonClasses(hasBlockType('unordered-list-item'))}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        
        <button
          type="button"
          onClick={() => toggleBlockType('ordered-list-item')}
          className={getButtonClasses(hasBlockType('ordered-list-item'))}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>
      </div>
      
      {/* Block styling */}
      <div className="flex space-x-1 mr-2 border-r border-gray-200 dark:border-gray-700 pr-2">
        <button
          type="button"
          onClick={() => toggleBlockType('blockquote')}
          className={getButtonClasses(hasBlockType('blockquote'))}
          title="Quote"
        >
          <Quote size={18} />
        </button>
        
        <button
          type="button"
          onClick={() => toggleBlockType('code-block')}
          className={getButtonClasses(hasBlockType('code-block'))}
          title="Code Block"
        >
          <Code size={18} />
        </button>
      </div>
      
      {/* Links and media */}
      <div className="flex space-x-1 mr-2 border-r border-gray-200 dark:border-gray-700 pr-2">
        <button
          type="button"
          onClick={addLink}
          className={getButtonClasses(false)}
          title="Add Link"
        >
          <LinkIcon size={18} />
        </button>
        
        {imagesEnabled && (
          <button
            type="button"
            onClick={onImageClick}
            className={getButtonClasses(false)}
            title="Add Image"
          >
            <Image size={18} />
          </button>
        )}
      </div>
      
      {/* History */}
      <div className="flex space-x-1">
        <button
          type="button"
          onClick={handleUndo}
          className={getButtonClasses(false)}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={18} />
        </button>
        
        <button
          type="button"
          onClick={handleRedo}
          className={getButtonClasses(false)}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo size={18} />
        </button>
      </div>
    </div>
  );
};

export default TextEditorToolbar;
