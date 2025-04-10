import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, Music } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../../../core/components/ui/card';

interface ThemeCardProps {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  count?: number;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ id, name, description, slug, count = 0 }) => {
  return (
    <Link to={`/themes/${slug || id}`}>
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 mr-3">
              <Palette className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold text-lg">{name}</h3>
          </div>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
              {description}
            </p>
          )}
        </CardContent>
        <CardFooter className="pt-0 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Music className="h-4 w-4 mr-1" />
          <span>{count} bài hát</span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ThemeCard;
