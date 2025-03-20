import React, { useEffect, useRef, useState } from 'react';
import { User } from 'lucide-react';

interface MentionUser {
  id: string;
  name: string;
  avatar_url?: string;
}

interface MentionSuggestionsProps {
  users: MentionUser[];
  onSelect: (user: MentionUser) => void;
  onClose: () => void;
  position?: { top: number; left: number };
}

const MentionSuggestions: React.FC<MentionSuggestionsProps> = ({
  users,
  onSelect,
  onClose,
  position = { top: 0, left: 0 }
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // If no users, don't render anything
  if (users.length === 0) {
    return null;
  }

  // Calculate adjusted position to ensure it stays in viewport
  const adjustedPosition = () => {
    const style: React.CSSProperties = {
      top: `${position.top}px`,
      left: `${position.left}px`,
    };
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Adjust for right edge overflow
      if (rect.right > viewportWidth) {
        style.left = `${Math.max(0, position.left - (rect.right - viewportWidth) - 10)}px`;
      }
      
      // Adjust for bottom edge overflow
      if (rect.bottom > viewportHeight) {
        style.top = `${Math.max(0, position.top - rect.height - 10)}px`;
      }
    }
    
    return style;
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % users.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + users.length) % users.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (users[selectedIndex]) {
            onSelect(users[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [users, selectedIndex, onSelect, onClose]);
  
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Reset selected index when users change
  useEffect(() => {
    setSelectedIndex(0);
  }, [users]);

  return (
    <div 
      ref={containerRef}
      className="absolute bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700 max-w-xs w-full"
      style={adjustedPosition()}
    >
      <ul className="py-1 max-h-60 overflow-auto">
        {users.map((user, index) => (
          <li 
            key={user.id}
            className={`px-3 py-2 cursor-pointer ${
              index === selectedIndex 
                ? 'bg-indigo-50 dark:bg-indigo-900/30' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => onSelect(user)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="flex items-center">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url}
                  alt={user.name}
                  className="h-6 w-6 rounded-full mr-2"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 mr-2 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              )}
              <span className={`text-sm font-medium ${
                index === selectedIndex
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-900 dark:text-gray-100'
              }`}>
                {user.name}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MentionSuggestions;
