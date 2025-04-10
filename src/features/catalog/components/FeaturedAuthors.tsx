import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { User } from 'lucide-react';

interface Author {
  id: string;
  name: string;
  image_url?: string;
  slug?: string;
  hymn_count?: number;
}

interface FeaturedAuthorsProps {
  limit?: number;
}

const FeaturedAuthors: React.FC<FeaturedAuthorsProps> = ({ limit = 5 }) => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAuthors() {
      try {
        setIsLoading(true);
        
        // Fetch authors with hymn count
        const { data, error } = await supabase
          .from('authors')
          .select(`
            id, name, image_url, slug,
            hymn_authors!inner(author_id)
          `)
          .order('name')
          .limit(limit);
        
        if (error) throw error;
        
        const processedAuthors = (data || []).map(author => ({
          ...author,
          hymn_count: Array.isArray(author.hymn_authors) ? author.hymn_authors.length : 0
        }));
        
        setAuthors(processedAuthors);
      } catch (err) {
        console.error('Error fetching authors:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAuthors();
  }, [limit]);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-16 w-16 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
      {authors.map((author) => (
        <Link 
          key={author.id} 
          to={`/authors/${author.slug || author.id}`}
          className="flex flex-col items-center group"
        >
          <div className="mb-3 relative">
            {author.image_url ? (
              <img 
                src={author.image_url} 
                alt={author.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-transparent group-hover:border-indigo-500 transition-all"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-2 border-transparent group-hover:border-indigo-500 flex items-center justify-center transition-all">
                <User className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
          </div>
          <h3 className="font-medium text-center group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {author.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {author.hymn_count} thánh ca
          </p>
        </Link>
      ))}
    </div>
  );
};

export default FeaturedAuthors;
