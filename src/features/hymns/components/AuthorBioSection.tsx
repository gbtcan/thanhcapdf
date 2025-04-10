import React from 'react';
import { Link } from 'react-router-dom';
import { User, ChevronRight } from 'lucide-react';

interface AuthorBioSectionProps {
  authors: Array<{
    author?: {
      id: string;
      name: string;
      biography?: string;
    }
  }>;
}

/**
 * Component to display author biographies at bottom of hymn detail page
 */
const AuthorBioSection: React.FC<AuthorBioSectionProps> = ({ authors }) => {
  // Filter out any authors without biographies
  const authorsWithBio = authors.filter(a => a?.author?.biography);
  
  if (authorsWithBio.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mt-6 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <User className="h-5 w-5 mr-2 text-gray-500" />
        Về tác giả
      </h2>
      
      {authorsWithBio.map((item, index) => {
        const author = item.author;
        if (!author) return null;
        
        return (
          <div key={author.id} className={index > 0 ? 'mt-6' : ''}>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">{author.name}</h3>
            <div className="prose dark:prose-invert text-gray-700 dark:text-gray-300">
              <p>{author.biography}</p>
            </div>
            
            <Link 
              to={`/authors/${author.id}`} 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-500 mt-2 text-sm"
            >
              Xem tất cả bài hát của tác giả
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default AuthorBioSection;
