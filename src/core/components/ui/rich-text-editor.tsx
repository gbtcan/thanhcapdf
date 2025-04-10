import React, { useState, useCallback, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { cn } from '../../../lib/utils';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Quote, 
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Separator,
  X
} from 'lucide-react';
import { Button } from './button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import { Input } from './input';
import { Toggle } from './toggle';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung của bạn tại đây...',
  className = ''
}) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageForm, setShowImageForm] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer hover:text-blue-700'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-md mx-auto my-4'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });
  
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);
  
  // Handle link form submission
  const handleLinkSubmit = useCallback(() => {
    if (!editor || !linkUrl) return;
    
    // If text is selected, convert it to a link
    if (editor.state.selection.empty) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    
    setLinkUrl('');
    setShowLinkForm(false);
  }, [editor, linkUrl]);
  
  // Handle image form submission
  const handleImageSubmit = useCallback(() => {
    if (!editor || !imageUrl) return;
    
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl('');
    setShowImageForm(false);
  }, [editor, imageUrl]);
  
  if (!editor) {
    return null;
  }
  
  return (
    <div className={cn('border border-input rounded-md', className)}>
      <div className="border-b border-input bg-muted/50 p-1 flex flex-wrap gap-1">
        {/* Text formatting */}
        <Toggle 
          size="sm" 
          pressed={editor.isActive('bold')} 
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        
        <Toggle 
          size="sm" 
          pressed={editor.isActive('italic')} 
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        
        <Toggle 
          size="sm" 
          pressed={editor.isActive('underline')} 
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>
        
        <Toggle 
          size="sm" 
          pressed={editor.isActive('code')} 
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          aria-label="Code"
        >
          <Code className="h-4 w-4" />
        </Toggle>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Headings */}
        <Toggle 
          size="sm" 
          pressed={editor.isActive('heading', { level: 1 })} 
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          aria-label="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        
        <Toggle 
          size="sm" 
          pressed={editor.isActive('heading', { level: 2 })} 
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        
        <Toggle 
          size="sm" 
          pressed={editor.isActive('heading', { level: 3 })} 
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          aria-label="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Lists */}
        <Toggle 
          size="sm" 
          pressed={editor.isActive('bulletList')} 
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet List"
        >
          <List className="h-4 w-4" />
        </Toggle>
        
        <Toggle 
          size="sm" 
          pressed={editor.isActive('orderedList')} 
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        
        <Toggle 
          size="sm" 
          pressed={editor.isActive('blockquote')} 
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Quote"
        >
          <Quote className="h-4 w-4" />
        </Toggle>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Link */}
        <Popover open={showLinkForm} onOpenChange={setShowLinkForm}>
          <PopoverTrigger asChild>
            <Toggle 
              size="sm" 
              pressed={editor.isActive('link')} 
              aria-label="Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Thêm đường dẫn</h4>
              <div className="flex gap-2">
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleLinkSubmit()}
                />
                <Button size="sm" onClick={handleLinkSubmit}>
                  Áp dụng
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Image */}
        <Popover open={showImageForm} onOpenChange={setShowImageForm}>
          <PopoverTrigger asChild>
            <Toggle 
              size="sm"
              aria-label="Image"
            >
              <ImageIcon className="h-4 w-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Thêm hình ảnh</h4>
              <div className="flex gap-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleImageSubmit()}
                />
                <Button size="sm" onClick={handleImageSubmit}>
                  Thêm
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Undo/Redo */}
        <Button 
          variant="ghost" 
          size="icon-sm" 
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          aria-label="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon-sm" 
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          aria-label="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      
      <EditorContent 
        editor={editor} 
        className="prose dark:prose-invert max-w-none p-4 focus:outline-none min-h-[200px]" 
      />
    </div>
  );
};
