import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { Card, CardContent } from '../../../core/components/ui/card';

interface Author {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  slug?: string;
}

interface AuthorCardProps {
  author: Author;
}

const AuthorCard: React.FC<AuthorCardProps> = ({ author }) => {
  return (
    <Link to={`/authors/${author.slug || author.id}`}>
      <Card className="hover:shadow-md transition-shadow overflow-hidden h-full">
        <CardContent className="p-0">
          <div className="flex flex-col items-center p-6 text-center">
            {author.image_url ? (
              <img 
                src={author.image_url} 
                alt={author.name}
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
            ) : (
              <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                <User className="h-10 w-10 text-indigo-500" />
              </div>
            )}
            
            <h3 className="font-semibold text-lg mb-1">{author.name}</h3>
            
            {author.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                {author.description.replace(/<[^>]+>/g, ' ')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default AuthorCard;
