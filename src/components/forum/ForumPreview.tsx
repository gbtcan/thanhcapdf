import { Link } from 'react-router-dom';
import { MessageSquare, Clock } from 'lucide-react';

interface Thread {
  id: number;
  title: string;
  replies: number;
  lastActive: Date;
}

interface ForumPreviewProps {
  threads: Thread[];
}

const ForumPreview: React.FC<ForumPreviewProps> = ({ threads }) => {
  // Function to format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };
  
  return (
    <ul className="space-y-3">
      {threads.length === 0 ? (
        <li className="text-gray-500 text-sm">No recent activity</li>
      ) : (
        threads.map(thread => (
          <li key={thread.id} className="border-b border-gray-100 pb-2 last:border-0">
            <Link to={`/forum/thread/${thread.id}`} className="block hover:bg-gray-50 p-1 -m-1 rounded">
              <p className="text-gray-800 hover:text-indigo-600 line-clamp-1">{thread.title}</p>
              <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                <span className="flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {thread.replies}
                </span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatRelativeTime(thread.lastActive)}
                </span>
              </div>
            </Link>
          </li>
        ))
      )}
    </ul>
  );
};

export default ForumPreview;
