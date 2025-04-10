import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search as SearchIcon, Music, Users, Tag, X, Command, RotateCcw, Loader 
} from 'lucide-react';
import { Button } from '../../../core/components/ui/button';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from '../../../core/components/ui/dialog';
import { supabase } from '../../../lib/supabase';
import { useDebounce } from '../../../core/hooks/useDebounce';
import { Tabs, TabsList, TabsTrigger } from '../../../core/components/ui/tabs';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'hymn' | 'author' | 'theme';
  url: string;
}

interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommandSearch: React.FC<CommandSearchProps> = ({ open, onOpenChange }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Perform search when query changes
  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);

      try {
        // Search hymns - Cập nhật để chỉ chọn các trường thực sự có trong cơ sở dữ liệu
        const hymnPromise = supabase
          .from('hymns_new')
          .select('id, title')
          .ilike('title', `%${debouncedQuery}%`)
          .limit(5);

        // Search authors
        const authorPromise = supabase
          .from('authors')
          .select('id, name')
          .ilike('name', `%${debouncedQuery}%`)
          .limit(3);

        // Search themes
        const themePromise = supabase
          .from('themes')
          .select('id, name')
          .ilike('name', `%${debouncedQuery}%`)
          .limit(3);

        // Execute all searches in parallel
        const [hymnRes, authorRes, themeRes] = await Promise.all([
          hymnPromise,
          authorPromise,
          themePromise
        ]);

        // Process hymns - Đã loại bỏ subtitle vì không có trong database
        const hymns: SearchResult[] = (hymnRes.data || []).map(hymn => ({
          id: hymn.id,
          title: hymn.title,
          type: 'hymn',
          url: `/hymns/${hymn.id}`  // Dùng ID thay vì slug
        }));

        // Process authors
        const authors: SearchResult[] = (authorRes.data || []).map(author => ({
          id: author.id,
          title: author.name,
          type: 'author',
          url: `/authors/${author.id}`  // Dùng ID thay vì slug
        }));

        // Process themes
        const themes: SearchResult[] = (themeRes.data || []).map(theme => ({
          id: theme.id,
          title: theme.name,
          type: 'theme',
          url: `/themes/${theme.id}`  // Dùng ID thay vì slug
        }));

        // Combine results
        let combinedResults: SearchResult[] = [];
        
        // Filter based on active tab
        if (activeTab === 'all') {
          combinedResults = [...hymns, ...authors, ...themes];
        } else if (activeTab === 'hymns') {
          combinedResults = hymns;
        } else if (activeTab === 'authors') {
          combinedResults = authors;
        } else if (activeTab === 'themes') {
          combinedResults = themes;
        }
        
        setResults(combinedResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    performSearch();
  }, [debouncedQuery, activeTab]);

  const handleResultSelect = (result: SearchResult) => {
    // Save query to recent searches
    if (query.trim()) {
      const updatedSearches = [
        query,
        ...recentSearches.filter(s => s !== query)
      ].slice(0, 5);
      
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    }
    
    // Navigate to result URL
    navigate(result.url);
    
    // Close the dialog
    onOpenChange(false);
  };

  const handleRecentSearchSelect = (search: string) => {
    setQuery(search);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-0">
          <div className="flex items-center border-b pb-4">
            <SearchIcon className="mr-2 h-5 w-5 shrink-0 opacity-50" />
            <input
              type="text"
              placeholder="Tìm kiếm thánh ca, tác giả, chủ đề..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              autoFocus
            />
            {query && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setQuery('')}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="h-10 w-full bg-transparent justify-start px-0">
              <TabsTrigger value="all" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800">
                Tất cả
              </TabsTrigger>
              <TabsTrigger value="hymns" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800">
                <Music className="h-4 w-4 mr-1" /> Thánh ca
              </TabsTrigger>
              <TabsTrigger value="authors" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800">
                <Users className="h-4 w-4 mr-1" /> Tác giả
              </TabsTrigger>
              <TabsTrigger value="themes" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800">
                <Tag className="h-4 w-4 mr-1" /> Chủ đề
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>
        
        <div className="max-h-[50vh] overflow-y-auto p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultSelect(result)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
                >
                  {result.type === 'hymn' && <Music className="h-4 w-4 text-indigo-500" />}
                  {result.type === 'author' && <Users className="h-4 w-4 text-green-500" />}
                  {result.type === 'theme' && <Tag className="h-4 w-4 text-amber-500" />}
                  
                  <div className="overflow-hidden">
                    <div className="font-medium truncate">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-sm text-gray-500 truncate">{result.subtitle}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <SearchIcon className="mb-2 h-8 w-8 text-gray-400" />
              <p className="mb-6 text-lg font-medium">Không tìm thấy kết quả nào</p>
              <p className="text-sm text-gray-500">Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả</p>
            </div>
          ) : recentSearches.length > 0 ? (
            <div className="py-4">
              <div className="flex items-center justify-between px-4 mb-2">
                <h3 className="text-sm font-medium text-gray-500">Tìm kiếm gần đây</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={clearRecentSearches}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Xóa
                </Button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={`recent-${index}`}
                  onClick={() => handleRecentSearchSelect(search)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
                >
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                  <span>{search}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <Command className="mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">Nhập từ khóa để tìm kiếm thánh ca, tác giả hoặc chủ đề</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500">
          <div className="flex">
            <span className="flex items-center mr-3">
              <kbd className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 mr-1">↑</kbd>
              <kbd className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">↓</kbd>
              <span className="ml-2">Di chuyển</span>
            </span>
            <span className="flex items-center">
              <kbd className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">Enter</kbd>
              <span className="ml-2">Chọn</span>
            </span>
          </div>
          <div className="flex items-center">
            <kbd className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 mr-1">Esc</kbd>
            <span>Đóng</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommandSearch;
