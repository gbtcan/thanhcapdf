import React, { useState } from 'react';
import TextEditor from './TextEditor';

interface TextEditorExampleProps {
  initialValue?: string;
  onSave?: (content: string) => void;
  readOnly?: boolean;
  minHeight?: number;
}

const TextEditorExample: React.FC<TextEditorExampleProps> = ({
  initialValue = '',
  onSave,
  readOnly = false,
  minHeight = 250,
}) => {
  const [content, setContent] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      setIsSaving(true);
      await onSave(content);
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save your content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <TextEditor
        initialValue={initialValue}
        onChange={setContent}
        placeholder="Write your content here..."
        minHeight={minHeight}
        maxHeight={600}
        mentionsEnabled={true}
        imagesEnabled={true}
        autoSave={true}
        autoSaveKey="forum-post-draft"
      />
      
      {onSave && !readOnly && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Content'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TextEditorExample;
