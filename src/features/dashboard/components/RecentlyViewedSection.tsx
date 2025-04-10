import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Card, CardContent } from '../../../core/components/ui/card';
import { Skeleton } from '../../../core/components/ui/skeleton';
import { Button } from '../../../core/components/ui/button';
import { Music, Clock, ArrowRight } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

interface RecentlyViewedHymn {
  id: string;
  title: string;
  viewed_at: string;
  author_name?: string;
}

const RecentlyViewedSection: React.FC<{ userId: string; limit?: number }> = ({ 
  userId, 
  limit = 5 
}) => {
  const [hymns, setHymns] = useState<RecentlyViewedHymn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        
        // Fetch recently viewed hymns
        const { data: viewData, error: viewError } = await supabase
          .from('hymn_views')
          .select(`
            viewed_at,
            hymn_id,
            hymns:hymn_id!hymn_id(id, title)
          `)
          .eq('user_id', userId)
          .order('viewed_at', { ascending: false })
          .limit(limit);
          
        if (viewError) throw viewError;
        
        // Process and add author information
        const processedHymns = await Promise.all((viewData || [])
          .filter(item => item.hymns) // Ensure the hymn exists
          .map(async (item) => {
            const hymn = item.hymns as any;
            
            // Get author info for this hymn
            const { data: authorRel } = await supabase
              .from('hymn_authors')
              .select('author_id')
              .eq('hymn_id', hymn.id)
              .limit(1);
              
            let authorName;
            if (authorRel && authorRel.length > 0) {
              const { data: author } = await supabase
                .from('authors')
                .select('name')
                .eq('id', authorRel[0].author_id)
                .single();
                
              if (author) {
                authorName = author.name;
              }
            }
            
            return {
              id: hymn.id,
              title: hymn.title,
              viewed_at: item.viewed_at,
              author_name: authorName
            };
          }));
          
        setHymns(processedHymns);
      } catch (err) {
        console.error('Error fetching recently viewed hymns:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentlyViewed();
  }, [userId, limit]);
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="h-8 w-8 rounded-full mr-2" />
                  <div>
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (hymns.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-lg font-medium mb-1">Chưa có thánh ca nào được xem gần đây</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Khi bạn xem các bài thánh ca, chúng sẽ xuất hiện ở đây
          </p>
          <Button asChild>
            <Link to="/hymns">
              <Music className="mr-1 h-4 w-4" />
              Khám phá thánh ca
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Đã xem gần đây</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/history">
              Xem tất cả
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="space-y-3">
          {hymns.map((hymn) => (
            <div key={hymn.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
                  <Music className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <Link to={`/hymns/${hymn.id}`} className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400">
                    {hymn.title}
                  </Link>
                  {hymn.author_name && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {hymn.author_name}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                {formatDate(hymn.viewed_at, 'dd MMM')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentlyViewedSection;
