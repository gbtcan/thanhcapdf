import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { EditorState, ContentState, convertToRaw } from 'draft-js';

/**
 * Converts HTML string to Draft.js EditorState
 */
export const htmlToEditorState = (html: string): EditorState => {
  if (!html) {
    return EditorState.createEmpty();
  }
  
  try {
    const blocksFromHtml = htmlToDraft(html);
    const contentState = ContentState.createFromBlockArray(
      blocksFromHtml.contentBlocks,
      blocksFromHtml.entityMap
    );
    return EditorState.createWithContent(contentState);
  } catch (error) {
    console.error('Error converting HTML to editor state:', error);
    return EditorState.createEmpty();
  }
};

/**
 * Converts Draft.js EditorState to HTML string
 */
export const editorStateToHtml = (editorState: EditorState): string => {
  const contentState = editorState.getCurrentContent();
  const rawContentState = convertToRaw(contentState);
  return draftToHtml(rawContentState);
};

/**
 * Sanitizes HTML content to prevent XSS attacks
 * This is a basic implementation - consider using a library like DOMPurify for production
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Remove script tags and their contents
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove onclick, onload and other event handlers
  sanitized = sanitized.replace(/ on\w+="[^"]*"/gi, '');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:[^\s"'>/]+/gi, '');
  
  // Remove data: URLs (potential XSS vector)
  sanitized = sanitized.replace(/data:[^\s"'>/]+/gi, '');
  
  return sanitized;
};

/**
 * Check if editor content is empty
 */
export const isEditorEmpty = (editorState: EditorState): boolean => {
  const contentState = editorState.getCurrentContent();
  return !contentState.hasText() && contentState.getBlockMap().first().getType() === 'unstyled';
};

/**
 * Get plain text from editor state
 */
export const getPlainText = (editorState: EditorState): string => {
  const contentState = editorState.getCurrentContent();
  return contentState.getPlainText();
};
