import React from 'react';
import { Award } from 'lucide-react';

interface ReputationBadgeProps {
  reputation: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ReputationBadge: React.FC<ReputationBadgeProps> = ({
  reputation,
  size = 'md',
  className = ''
}) => {
  // Determine badge color based on reputation
  let badgeColor: string;
  let textColor: string;
  
  if (reputation >= 1000) {
    badgeColor = 'bg-purple-100';
    textColor = 'text-purple-800';
  } else if (reputation >= 500) {
    badgeColor = 'bg-blue-100';
    textColor = 'text-blue-800';
  } else if (reputation >= 250) {
    badgeColor = 'bg-green-100';
    textColor = 'text-green-800';
  } else if (reputation >= 100) {
    badgeColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
  } else {
    badgeColor = 'bg-gray-100';
    textColor = 'text-gray-800';
  }
  
  // Determine size classes
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1.5'
  }[size];
  
  return (
    <div className={`inline-flex items-center rounded-full ${badgeColor} ${textColor} ${sizeClasses} ${className}`}>
      <Award className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} mr-1`} />
      <span>{reputation}</span>
    </div>
  );
};

export default ReputationBadge;
