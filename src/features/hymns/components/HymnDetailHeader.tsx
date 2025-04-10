import React from 'react';
import { Link } from 'react-router-dom';
import { User, Tag, Heart } from 'lucide-react';
import { Badge } from '../../../core/components/ui/badge';
import { FavoriteButton } from '../../favorites/components/FavoriteButton';

interface Author {
  id: string;
  name: string;
}

interface Theme {
  id: string;
  name: string;
}

interface HymnDetailHeaderProps {
  title: string;
  subtitle?: string;
  number?: number;
  authors?: Author[];
  themes?: Theme[];
}

const HymnDetailHeader: React.FC<HymnDetailHeaderProps> = ({
  title,
  subtitle,
  number,
  authors = [], // Provide default empty array
  themes = []   // Provide default empty array
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        
        {number && (
          <div className="px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xl font-bold">
            #{number}
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {authors && authors.length > 0 && (
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300 mr-2">Tác giả:</span>
            <div className="flex flex-wrap gap-2">
              {authors.map(author => (
                <Link
                  key={author.id}
                  to={`/authors/${author.id}`}
                  className="text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {author.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {themes && themes.length > 0 && (
          <div className="flex flex-wrap items-center">
            <Tag className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300 mr-2">Chủ đề:</span>
            <div className="flex flex-wrap gap-1">
              {themes.map(theme => (
                <Link
                  key={theme.id}
                  to={`/themes/${theme.id}`}
                >
                  <Badge variant="outline" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    {theme.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HymnDetailHeader;
