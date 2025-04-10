import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../../core/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../core/components/ui/tabs';
import { Music } from 'lucide-react';

interface Hymn {
  id: string;
  title: string;
  subtitle?: string;
  number?: number;
  slug?: string;
}

interface HymnAuthorData {
  hymn: Hymn;
}

interface HymnThemeData {
  hymn: Hymn;
}

interface RelatedHymnsProps {
  currentHymnId: string;
  themeIds?: string[];
  authorIds?: string[];
}

const RelatedHymns: React.FC<RelatedHymnsProps> = ({
  currentHymnId,
  themeIds = [],
  authorIds = []
}) => {
  const [relatedByTheme, setRelatedByTheme] = useState<Hymn[]>([]);
  const [relatedByAuthor, setRelatedByAuthor] = useState<Hymn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchRelatedHymns = async () => {
      try {
        setIsLoading(true);
        
        const fetchPromises = [];
        
        // Nếu có themeIds, tìm thánh ca có cùng chủ đề
        if (Array.isArray(themeIds) && themeIds.length > 0) {
          // Tối ưu: sử dụng JOIN trong một truy vấn duy nhất
          const themePromise = supabase
            .from('hymn_themes')
            .select(`
              hymn:hymn_id(
                id, title, subtitle, number, slug
              )
            `)
            .in('theme_id', themeIds)
            .neq('hymn_id', currentHymnId)
            .limit(5)
            .then(({ data, error }: { data: HymnThemeData[] | null; error: any }) => {
              if (error) throw error;
              
              const formattedData = (data || [])
                .map((item: HymnThemeData) => item.hymn)
                .filter(Boolean);
              
              // Loại bỏ các kết quả trùng lặp
              const uniqueHymns = Array.from(
                new Map(formattedData.map((item: Hymn) => [item.id, item])).values()
              );
              
              return uniqueHymns.slice(0, 5);
            });
          
          fetchPromises.push(themePromise);
        } else {
          fetchPromises.push(Promise.resolve([]));
        }
        
        // Nếu có authorIds, tìm thánh ca của cùng tác giả
        if (Array.isArray(authorIds) && authorIds.length > 0) {
          // Tối ưu: sử dụng JOIN trong một truy vấn duy nhất
          const authorPromise = supabase
            .from('hymn_authors')
            .select(`
              hymn:hymn_id(
                id, title, subtitle, number, slug
              )
            `)
            .in('author_id', authorIds)
            .neq('hymn_id', currentHymnId)
            .limit(5)
            .then(({ data, error }: { data: HymnAuthorData[] | null; error: any }) => {
              if (error) throw error;
              
              const formattedData = (data || [])
                .map((item: HymnAuthorData) => item.hymn)
                .filter(Boolean);
              
              // Loại bỏ các kết quả trùng lặp
              const uniqueHymns = Array.from(
                new Map(formattedData.map((item: Hymn) => [item.id, item])).values()
              );
              
              return uniqueHymns.slice(0, 5);
            });
          
          fetchPromises.push(authorPromise);
        } else {
          fetchPromises.push(Promise.resolve([]));
        }
        
        // Đợi tất cả các truy vấn hoàn thành cùng lúc
        const [themeResults, authorResults] = await Promise.all(fetchPromises);
        
        setRelatedByTheme(themeResults);
        setRelatedByAuthor(authorResults);
      } catch (error) {
        console.error('Error fetching related hymns:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Chỉ fetch khi có themeIds hoặc authorIds
    if (
      (Array.isArray(themeIds) && themeIds.length > 0) || 
      (Array.isArray(authorIds) && authorIds.length > 0)
    ) {
      fetchRelatedHymns();
    } else {
      setIsLoading(false);
    }
  }, [currentHymnId, JSON.stringify(themeIds), JSON.stringify(authorIds)]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thánh ca liên quan</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (relatedByTheme.length === 0 && relatedByAuthor.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Thánh ca liên quan</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="theme">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="theme" disabled={relatedByTheme.length === 0}>
              Theo chủ đề
            </TabsTrigger>
            <TabsTrigger value="author" disabled={relatedByAuthor.length === 0}>
              Cùng tác giả
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="theme">
            {relatedByTheme.length > 0 ? (
              <ul className="space-y-1">
                {relatedByTheme.map(hymn => (
                  <li key={hymn.id}>
                    <Link 
                      to={`/hymns/${hymn.slug || hymn.id}`}
                      className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Music className="h-4 w-4 mr-2 text-indigo-500" />
                      <div>
                        <span className="text-gray-900 dark:text-gray-100">
                          {hymn.title}
                        </span>
                        {hymn.number && (
                          <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">
                            #{hymn.number}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-4">
                Không tìm thấy thánh ca liên quan
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="author">
            {relatedByAuthor.length > 0 ? (
              <ul className="space-y-1">
                {relatedByAuthor.map(hymn => (
                  <li key={hymn.id}>
                    <Link 
                      to={`/hymns/${hymn.slug || hymn.id}`}
                      className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Music className="h-4 w-4 mr-2 text-indigo-500" />
                      <div>
                        <span className="text-gray-900 dark:text-gray-100">
                          {hymn.title}
                        </span>
                        {hymn.number && (
                          <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">
                            #{hymn.number}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-4">
                Không tìm thấy thánh ca cùng tác giả
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RelatedHymns;
