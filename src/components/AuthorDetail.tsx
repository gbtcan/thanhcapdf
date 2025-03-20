import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Music, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Author, Hymn } from '../types';

const AuthorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<Author>();
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorAndHymns = async () => {
      if (!id) return;

      try {
        const [authorResponse, hymnsResponse] = await Promise.all([
          supabase
            .from('authors')
            .select('*')
            .eq('id', id)
            .single(),
          supabase
            .from('hymns')
            .select('*')
            .eq('author_id', id)
            .order('title')
        ]);

        if (authorResponse.error) throw authorResponse.error;
        if (hymnsResponse.error) throw hymnsResponse.error;

        setAuthor(authorResponse.data);
        setHymns(hymnsResponse.data || []);
      } catch (error) {
        console.error('Error fetching author details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorAndHymns();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Author not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center space-x-4 mb-6">
          <User className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">{author.name}</h1>
        </div>

        {author.biography && (
          <div className="prose max-w-none mb-8">
            <p className="text-gray-700">{author.biography}</p>
          </div>
        )}

        <div className="border-t pt-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Hymns by {author.name}</h2>
          
          <div className="space-y-4">
            {hymns.map((hymn) => (
              <Link
                key={hymn.id}
                to={`/hymns/${hymn.id}`}
                className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Music className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-lg font-medium text-gray-900">{hymn.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(hymn.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}

            {hymns.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hymns found for this author.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorDetail;