import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { User, ArrowLeft, Info, Music } from 'lucide-react';
import { Button } from '../../../../core/components/ui/button';
import LoadingIndicator from '../../../../core/components/LoadingIndicator';
import { Card, CardContent } from '../../../../core/components/ui/card';
import { formatDate } from '../../../../lib/utils';
import HymnsGrid from '../../../hymns/components/HymnsGrid';

interface Author {
  id: string;
  name: string;
  biography?: string;
  image_url?: string;
  birth_date?: string;
  death_date?: string;
}

interface Hymn {
  id: string;
  title: string;
  view_count?: number;
  number?: number;
  slug?: string;
}

const fetchAuthorHymns = async (authorId: string) => {
  const { data } = await supabase
    .from('hymn_authors')
    .select(`
      hymns:hymns_new!hymn_id(
        id, title, view_count
      )
    `)
    .eq('author_id', authorId);
    
  return data?.map(item => item.hymns) || [];
};

const AuthorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<Author | null>(null);
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function fetchAuthorDetails() {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError('');
        
        // Query thông tin tác giả - đơn giản hơn
        const { data: authorData, error: authorError } = await supabase
          .from('authors')
          .select('id, name, biography')
          .eq('id', id)
          .single();
        
        if (authorError) throw authorError;
        if (!authorData) throw new Error('Không tìm thấy tác giả');
        
        setAuthor(authorData);
        
        // Tìm tất cả hymn_id liên kết với author này - cách tiếp cận hai bước
        const hymnsData = await fetchAuthorHymns(authorData.id);
        setHymns(hymnsData);
        
      } catch (err) {
        console.error('Error fetching author details:', err);
        setError('Không thể tải thông tin tác giả. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAuthorDetails();
  }, [id]);
  
  if (isLoading) {
    return <LoadingIndicator message="Đang tải thông tin tác giả..." />;
  }
  
  if (error || !author) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-lg text-center">
        <Info className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-semibold mb-2">{error || 'Không tìm thấy tác giả'}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Tác giả này có thể đã bị xóa hoặc không tồn tại.
        </p>
        <Button asChild>
          <Link to="/authors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link to="/authors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="md:flex items-start">
            <div className="md:flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              {author.image_url ? (
                <img 
                  src={author.image_url} 
                  alt={author.name}
                  className="w-32 h-32 object-cover rounded-full"
                />
              ) : (
                <div className="w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-indigo-500" />
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-2xl font-bold mb-2">{author.name}</h1>
              
              {(author.birth_date || author.death_date) && (
                <p className="text-gray-500 dark:text-gray-400 mb-3">
                  {author.birth_date && formatDate(author.birth_date)}
                  {author.birth_date && author.death_date && ' - '}
                  {author.death_date && formatDate(author.death_date)}
                </p>
              )}
              
              {author.biography && (
                <div className="prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: author.biography }} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <h2 className="text-xl font-semibold flex items-center mb-4">
        <Music className="h-5 w-5 mr-2 text-indigo-500" />
        Thánh ca của {author.name}
        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
          ({hymns.length})
        </span>
      </h2>
      
      {hymns.length > 0 ? (
        <HymnsGrid hymns={hymns} />
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Chưa có thánh ca nào của tác giả này.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuthorDetail;
