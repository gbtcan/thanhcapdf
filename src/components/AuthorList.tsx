import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Author } from '../types';

const AuthorList = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const { data, error } = await supabase
          .from('authors')
          .select('*')
          .order('name');

        if (error) throw error;
        setAuthors(data || []);
      } catch (error) {
        console.error('Error fetching authors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Authors</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {authors.map((author) => (
          <Link
            key={author.id}
            to={`/authors/${author.id}`}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <User className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">{author.name}</h2>
            </div>

            {author.biography && (
              <p className="text-gray-600 line-clamp-3">{author.biography}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AuthorList;