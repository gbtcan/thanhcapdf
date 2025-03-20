import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Calendar, Award } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import ReputationBadge from './ReputationBadge';
import Avatar from '../Avatar';
import type { User } from '../../types/users';

interface UserCardProps {
  user: User;
  postCount?: number;
  commentCount?: number;
  joinedDate?: string;
  className?: string;
  compact?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  postCount, 
  commentCount,
  joinedDate,
  className = '',
  compact = false
}) => {
  // Format join date if provided
  const formattedJoinDate = joinedDate ? formatDate(new Date(joinedDate)) : null;
  
  // Determine reputation level title
  const getReputationTitle = (reputation: number = 0) => {
    if (reputation >= 1000) return 'Expert Contributor';
    if (reputation >= 500) return 'Advanced Contributor';
    if (reputation >= 250) return 'Active Contributor';
    if (reputation >= 100) return 'Regular Contributor';
    return 'New Member';
  };
  
  if (compact) {
    return (
      <Link 
        to={`/users/${user.id}`} 
        className={`inline-flex items-center hover:bg-gray-50 p-1 rounded ${className}`}
      >
        <Avatar 
          src={user.avatar_url} 
          name={user.name} 
          size="sm" 
          className="mr-2" 
        />
        <div>
          <div className="font-medium text-sm text-gray-900">{user.name}</div>
          {user.reputation !== undefined && (
            <ReputationBadge reputation={user.reputation} size="sm" />
          )}
        </div>
      </Link>
    );
  }
  
  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-start">
        {/* Avatar */}
        <Avatar 
          src={user.avatar_url} 
          name={user.name} 
          size="md" 
          className="mr-3" 
        />
        
        {/* User details */}
        <div>
          <Link 
            to={`/users/${user.id}`}
            className="font-medium text-gray-900 hover:text-indigo-600"
          >
            {user.name}
          </Link>
          
          {user.reputation !== undefined && (
            <div className="mt-1 flex items-center">
              <ReputationBadge reputation={user.reputation} size="sm" />
              <span className="text-xs text-gray-500 ml-2">
                {getReputationTitle(user.reputation)}
              </span>
            </div>
          )}
          
          {/* User stats */}
          <div className="mt-2 flex flex-wrap gap-y-1 gap-x-3 text-xs text-gray-500">
            {postCount !== undefined && (
              <div className="flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span>{postCount} posts</span>
              </div>
            )}
            
            {commentCount !== undefined && (
              <div className="flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span>{commentCount} comments</span>
              </div>
            )}
            
            {formattedJoinDate && (
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Joined {formattedJoinDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
