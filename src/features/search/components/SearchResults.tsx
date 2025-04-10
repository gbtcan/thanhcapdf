import React from 'react';
import { Link } from 'react-router-dom';
import { Music, User, Tag, FileText, Search } from 'lucide-react';
import { SearchResult } from '../types';
import { Badge } from '../../../core/components/ui/badge';
import { Card, CardContent } from '../../../core/components/ui/card';

interface SearchResultsProps {
  results: SearchResult[];
  totalResults: number;
  query: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, totalResults, query }) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
        <Search className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-lg font-medium">Không tìm thấy kết quả</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Không tìm thấy kết quả nào cho "{query}". Vui lòng thử tìm kiếm với từ khóa khác.
        </p>
      </div>
    );
  }
  
  // Group results by type
  const groupedResults: Record<string, SearchResult[]> = {
    hymn: [],
    author: [],
    theme: [],
    post: []
  };
  
  results.forEach(result => {
    if (groupedResults[result.type]) {
      groupedResults[result.type].push(result);
    }
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">
          {totalResults} kết quả tìm kiếm cho "{query}"
        </h2>
      </div>
      
      {/* Hymns */}
      {groupedResults.hymn.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium flex items-center">
            <Music className="h-4 w-4 mr-2 text-blue-500" />
            Thánh ca ({groupedResults.hymn.length})
          </h3>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            {groupedResults.hymn.map(hymn => (
              <Link 
                key={hymn.id} 
                to={`/hymns/${hymn.id}`}
                className="block p-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="font-medium">{hymn.title}</div>
                {hymn.excerpt && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{hymn.excerpt}</div>
                )}
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>Loại: </span>
                  <Badge variant="outline" className="ml-1">
                    {hymn.matchType === 'title' ? 'Tiêu đề' : 'Lời bài hát'}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Authors */}
      {groupedResults.author.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium flex items-center">
            <User className="h-4 w-4 mr-2 text-green-500" />
            Tác giả ({groupedResults.author.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedResults.author.map(author => (
              <Card key={author.id}>
                <CardContent className="p-4">
                  <Link to={`/authors/${author.id}`} className="block">
                    <div className="font-medium">{author.title}</div>
                    {author.excerpt && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {author.excerpt}
                      </div>
                    )}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Themes */}
      {groupedResults.theme.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium flex items-center">
            <Tag className="h-4 w-4 mr-2 text-purple-500" />
            Chủ đề ({groupedResults.theme.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedResults.theme.map(theme => (
              <Card key={theme.id}>
                <CardContent className="p-4">
                  <Link to={`/themes/${theme.id}`} className="block">
                    <div className="font-medium">{theme.title}</div>
                    {theme.excerpt && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {theme.excerpt}
                      </div>
                    )}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Posts */}
      {groupedResults.post.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium flex items-center">
            <FileText className="h-4 w-4 mr-2 text-amber-500" />
            Bài viết ({groupedResults.post.length})
          </h3>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            {groupedResults.post.map(post => (
              <Link 
                key={post.id} 
                to={`/forum/post/${post.id}`}
                className="block p-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="font-medium">{post.title}</div>
                {post.excerpt && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{post.excerpt}</div>
                )}
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>Loại: </span>
                  <Badge variant="outline" className="ml-1">
                    {post.matchType === 'title' ? 'Tiêu đề' : 'Nội dung'}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
