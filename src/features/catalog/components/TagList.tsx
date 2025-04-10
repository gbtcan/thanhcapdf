import React from 'react';
import { Link } from 'react-router-dom';
import { Tag as TagIcon } from 'lucide-react';
import { Tag } from '../types';

interface TagListProps {
  tags: Tag[];
  onTagClick?: (tagId: string) => void;
  limit?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TagList: React.FC<TagListProps> = ({
  tags,
  onTagClick,
  limit,
  showCount = false,
  size = 'md',
  className = ''
}) => {
  if (!tags || tags.length === 0) {
    return null;
  }
  
  const displayTags = limit && tags.length > limit ? tags.slice(0, limit) : tags;
  const remainingCount = limit && tags.length > limit ? tags.length - limit : 0;
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 rounded',
    md: 'text-sm px-2.5 py-0.5 rounded-md',
    lg: 'px-3 py-1 rounded-md'
  };
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayTags.map((tag) => (
        <TagItem
          key={tag.id}
          tag={tag}
          sizeClass={sizeClasses[size]}
          showCount={showCount}
          onClick={onTagClick ? () => onTagClick(tag.id.toString()) : undefined}
        />
      ))}
      
      {remainingCount > 0 && (
        <span className={`inline-flex items-center font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 ${sizeClasses[size]}`}>
          +{remainingCount}
        </span>
      )}
    </div>
  );
};

interface TagItemProps {
  tag: Tag;
  sizeClass: string;
  showCount: boolean;
  onClick?: () => void;
}

const TagItem: React.FC<TagItemProps> = ({ tag, sizeClass, showCount, onClick }) => {
  const content = (
    <span className={`inline-flex items-center font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ${sizeClass}`}>
      <TagIcon className="h-3.5 w-3.5 mr-1" />
      {tag.name}
      {showCount && tag.hymn_count !== undefined && tag.hymn_count > 0 && (
        <span className="ml-1 text-indigo-500 dark:text-indigo-400">
          ({tag.hymn_count})
        </span>
      )}
    </span>
  );
  
  if (onClick) {
    return (
      <button onClick={onClick} className="focus:outline-none">
        {content}
      </button>
    );
  }
  
  return (
    <Link to={`/tags/${tag.id}`}>
      {content}
    </Link>
  );
};

export default TagList;
