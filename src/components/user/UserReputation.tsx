import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Award, ChevronDown, ChevronUp, Star, 
  Heart, MessageSquare, Calendar
} from 'lucide-react';
import { getUserReputationHistory } from '../../lib/reputationService';
import { formatDate } from '../../utils/dateUtils';
import ReputationBadge from '../forum/ReputationBadge';
import LoadingIndicator from '../LoadingIndicator';

interface UserReputationProps {
  userId: string;
  reputation: number;
}

const UserReputation: React.FC<UserReputationProps> = ({
  userId,
  reputation
}) => {
  const [showHistory, setShowHistory] = useState(false);
  
  // Fetch reputation history
  const { data: history, isLoading } = useQuery({
    queryKey: ['reputation-history', userId],
    queryFn: () => getUserReputationHistory(userId),
    enabled: !!userId && showHistory
  });
  
  // Get reputation tier label
  const getReputationTier = () => {
    if (reputation >= 1000) return 'Expert Contributor';
    if (reputation >= 500) return 'Advanced Contributor';
    if (reputation >= 250) return 'Active Contributor';
    if (reputation >= 100) return 'Regular Contributor';
    return 'New Contributor';
  };
  
  // Format reputation event reason with icons
  const formatReputationEvent = (event: any) => {
    const icons = {
      'Post created': <MessageSquare className="h-4 w-4 text-blue-500" />,
      'Comment added': <MessageSquare className="h-4 w-4 text-green-500" />,
      'Post liked by another user': <Heart className="h-4 w-4 text-red-500" />,
      'Comment liked': <Heart className="h-4 w-4 text-pink-500" />,
      'Featured post': <Star className="h-4 w-4 text-yellow-500" />,
    };
    
    const icon = icons[event.reason as keyof typeof icons] || <Award className="h-4 w-4 text-purple-500" />;
    
    return (
      <div className="flex items-center">
        <span className="mr-2">{icon}</span>
        <span>{event.reason}</span>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Award className="h-5 w-5 text-indigo-500 mr-2" />
            <h3 className="font-medium text-gray-900">Reputation</h3>
          </div>
          <ReputationBadge reputation={reputation} size="lg" />
        </div>
        <div className="mt-1 text-sm text-gray-600">
          {getReputationTier()}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-center text-sm">
          <p className="text-gray-600">
            Reputation is earned when you contribute quality content to the forum.
          </p>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <span>{showHistory ? 'Hide History' : 'Show History'}</span>
            {showHistory ? (
              <ChevronUp className="h-4 w-4 ml-1" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-1" />
            )}
          </button>
        </div>
        
        {showHistory && (
          <div className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <LoadingIndicator size="medium" message="Loading reputation history..." />
              </div>
            ) : history && history.length > 0 ? (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Event</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Points</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {history.map((event) => (
                      <tr key={event.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {formatReputationEvent(event)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`font-medium ${event.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {event.points > 0 ? `+${event.points}` : event.points}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{formatDate(new Date(event.created_at))}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No reputation events found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReputation;
