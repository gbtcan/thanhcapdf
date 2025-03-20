import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { AtSign } from 'lucide-react';
import './MentionsInput.css';

interface MentionsInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface UserMention {
  id: string;
  name: string;
  email: string;
}

const MentionsInput: React.FC<MentionsInputProps> = ({
  value,
  onChange,
  placeholder = 'Write something...',
  className = ''
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Fetch users for mention suggestions
  const { data: users } = useQuery<UserMention[]>({
    queryKey: ['mention-users', mentionQuery],
    queryFn: async () => {
      if (!mentionQuery || mentionQuery.length < 2) return [];
      const { data } = await supabase
        .from('users')
        .select('id, name, email')
        .ilike('name', `%${mentionQuery}%`)
        .limit(5);
      return data || [];
    },
    enabled: mentionQuery.length >= 2
  });

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    
    const curPos = e.target.selectionStart || 0;
    setCursorPosition(curPos);
    
    // Check for mention trigger
    const textBeforeCursor = newValue.substring(0, curPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setMentionStart(mentionMatch.index!);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectMention = (user: UserMention) => {
    if (mentionStart >= 0 && inputRef.current) {
      const beforeMention = inputValue.substring(0, mentionStart);
      const afterMention = inputValue.substring(cursorPosition);
      const newText = `${beforeMention}@${user.name} ${afterMention}`;
      
      setInputValue(newText);
      onChange(newText);
      setShowSuggestions(false);
      
      // Set cursor position after the inserted mention
      const newPosition = mentionStart + user.name.length + 2; // +2 for @ and space
      inputRef.current.focus();
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = newPosition;
          inputRef.current.selectionEnd = newPosition;
        }
      }, 0);
    }
  };

  return (
    <div className={`mentions-input-container ${className}`}>
      <textarea
        ref={inputRef}
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="mentions-input"
      />
      
      {showSuggestions && users && users.length > 0 && (
        <div className="mentions-suggestions">
          {users.map(user => (
            <div 
              key={user.id} 
              className="mentions-suggestion-item"
              onClick={() => selectMention(user)}
            >
              <div className="user-avatar">
                <AtSign size={14} />
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentionsInput;
