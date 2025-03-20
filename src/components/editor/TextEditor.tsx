import React, { useState, useRef, useEffect } from 'react';
import { EditorState, convertToRaw, ContentState, RichUtils, AtomicBlockUtils } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './TextEditor.css';

import TextEditorToolbar from './TextEditorToolbar';
import ImageUploader from './ImageUploader';
import MentionSuggestions from './MentionSuggestions';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface TextEditorProps {
  initialValue?: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  mentionsEnabled?: boolean;
  imagesEnabled?: boolean;
  autoSave?: boolean;
  autoSaveKey?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({
  initialValue = '',
  onChange,
  placeholder = 'Start writing...',
  minHeight = 200,
  maxHeight = 500,
  mentionsEnabled = true,
  imagesEnabled = true,
  autoSave = false,
  autoSaveKey = 'editor-content'
}) => {
  const [editorState, setEditorState] = useState(() => {
    if (initialValue) {
      const blocksFromHtml = htmlToDraft(initialValue);
      const contentState = ContentState.createFromBlockArray(
        blocksFromHtml.contentBlocks,
        blocksFromHtml.entityMap
      );
      return EditorState.createWithContent(contentState);
    }
    
    // Try to load from localStorage if autoSave is enabled
    if (autoSave) {
      const savedContent = localStorage.getItem(autoSaveKey);
      if (savedContent) {
        try {
          const blocksFromHtml = htmlToDraft(savedContent);
          const contentState = ContentState.createFromBlockArray(
            blocksFromHtml.contentBlocks,
            blocksFromHtml.entityMap
          );
          return EditorState.createWithContent(contentState);
        } catch (error) {
          console.error('Error loading saved content:', error);
        }
      }
    }
    
    return EditorState.createEmpty();
  });
  
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [mentionSearchText, setMentionSearchText] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  
  const { user } = useAuth();
  const editorRef = useRef<any>(null);
  
  // Handle editor state changes
  const handleEditorStateChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
    
    // Convert editor content to HTML and update parent
    const contentState = newEditorState.getCurrentContent();
    const rawContentState = convertToRaw(contentState);
    const htmlContent = draftToHtml(rawContentState);
    
    // Call the onChange prop with the HTML content
    onChange(htmlContent);
    
    // Save to localStorage if autoSave is enabled
    if (autoSave) {
      localStorage.setItem(autoSaveKey, htmlContent);
    }
  };
  
  // Handle keyboard commands
  const handleKeyCommand = (command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    
    if (newState) {
      handleEditorStateChange(newState);
      return 'handled';
    }
    
    return 'not-handled';
  };
  
  // Calculate mention position
  const calculateMentionPosition = () => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const editorRect = editorRef.current.editor.getBoundingClientRect();
        
        // Position the suggestions below the current caret position
        setMentionPosition({
          top: rect.bottom - editorRect.top + 5, // Add a small offset
          left: rect.left - editorRect.left
        });
      }
    }
  };
  
  // Upload image to storage
  const handleImageUpload = async (file: File) => {
    if (!imagesEnabled || !file) return;
    
    try {
      setIsUploading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `editor-uploads/${user?.id || 'anonymous'}/${fileName}`;
      
      // Check if user is authenticated for non-anonymous uploads
      if (!user && filePath.includes('anonymous')) {
        console.warn('User is uploading anonymously - consider limiting this functionality');
      }
      
      // Upload to Supabase storage
      const { data, error } = await supabase
        .storage
        .from('assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        if (error.message.includes('storage quota')) {
          throw new Error('Storage quota exceeded. Please contact administrator.');
        } else if (error.message.includes('permission')) {
          throw new Error('You do not have permission to upload files.');
        } else {
          throw error;
        }
      }
      
      // Get public URL
      const { data: urlData } = supabase
        .storage
        .from('assets')
        .getPublicUrl(filePath);
        
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }
        
      // Insert image into editor
      insertImage(urlData.publicUrl);
      
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setShowImageUploader(false);
    }
  };
  
  // Insert image into editor
  const insertImage = (url: string) => {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      'IMAGE',
      'IMMUTABLE',
      { src: url, alt: 'Uploaded image' }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
    
    setEditorState(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '));
  };
  
  // Handle mention selection
  const handleMentionSelect = (user: any) => {
    // Get the current selection
    const selection = editorState.getSelection();
    
    // Create an entity for the mention
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      'MENTION',
      'SEGMENTED',
      { 
        mention: user,
        url: `/users/${user.id}` 
      }
    );
    
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    
    // Get the current content state with the entity
    let newContentState = contentStateWithEntity;
    
    // Replace the current selection with the mention text
    let mentionText = `@${user.name}`;
    let newEditorState = EditorState.set(editorState, { currentContent: newContentState });
    
    // Insert the mention text at current selection
    newEditorState = RichUtils.toggleLink(
      newEditorState,
      newEditorState.getSelection(),
      entityKey
    );
    
    // Update editor state
    handleEditorStateChange(newEditorState);
    
    // Close mention suggestions
    setMentionSearchText('');
    setMentionSuggestions([]);
    
    // Focus back on the editor after selecting a mention
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }, 0);
  };
  
  // Search for mentions
  useEffect(() => {
    const searchMentions = async () => {
      if (!mentionsEnabled || !mentionSearchText) {
        setMentionSuggestions([]);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('custom_users') // Changed from 'users' to 'custom_users'
          .select('id, name, avatar_url')
          .ilike('name', `%${mentionSearchText}%`)
          .limit(5);
          
        if (error) throw error;
        setMentionSuggestions(data || []);
        
      } catch (error) {
        console.error('Error searching for mentions:', error);
        setMentionSuggestions([]);
      }
    };
    
    // Debounce the search
    const timerId = setTimeout(searchMentions, 300);
    return () => clearTimeout(timerId);
    
  }, [mentionSearchText, mentionsEnabled]);
  
  // Custom toolbar configuration
  const toolbarConfig = {
    options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'emoji', 'history'],
    inline: {
      options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
    },
    blockType: {
      options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
    },
    list: {
      options: ['unordered', 'ordered'],
    },
    textAlign: {
      options: ['left', 'center', 'right', 'justify'],
    },
  };
  
  return (
    <div className="text-editor-container">
      <TextEditorToolbar 
        editorState={editorState}
        onEditorStateChange={handleEditorStateChange}
        onImageClick={() => setShowImageUploader(true)}
        imagesEnabled={imagesEnabled}
      />
      
      <div 
        className="text-editor-content-container" 
        style={{ minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` }}
      >
        <Editor
          editorState={editorState}
          onEditorStateChange={handleEditorStateChange}
          handleKeyCommand={handleKeyCommand}
          toolbarHidden={true}
          placeholder={placeholder}
          ref={editorRef}
          editorClassName={`text-editor-content ${isFocused ? 'focused' : ''}`}
          wrapperClassName="text-editor-wrapper"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          preserveSelectionOnBlur={true}
          
          // Mention functionality
          mention={{
            separator: ' ',
            trigger: '@',
            suggestions: mentionSuggestions.map(user => ({
              text: user.name,
              value: user.id,
              url: `/users/${user.id}`,
            })),
            onChange: (mentionText: string) => {
              setMentionSearchText(mentionText);
              calculateMentionPosition();
            }
          }}
        />
        
        {/* Mention suggestions component */}
        {mentionsEnabled && mentionSearchText && mentionSuggestions.length > 0 && (
          <MentionSuggestions
            users={mentionSuggestions}
            onSelect={handleMentionSelect}
            onClose={() => {
              setMentionSearchText('');
              setMentionSuggestions([]);
            }}
            position={mentionPosition}
          />
        )}
      </div>
      
      {showImageUploader && (
        <ImageUploader 
          onUpload={handleImageUpload}
          onClose={() => setShowImageUploader(false)}
          isUploading={isUploading}
        />
      )}
    </div>
  );
};

export default TextEditor;
