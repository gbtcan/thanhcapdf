import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { Palette, ArrowLeft, Info } from 'lucide-react';
import { Button } from '../../../../core/components/ui/button';
import LoadingIndicator from '../../../../core/components/LoadingIndicator';
import { Card, CardContent } from '../../../../core/components/ui/card';
import HymnsGrid from '../../../hymns/components/HymnsGrid';

interface Theme {
  id: string;
  name: string;
  description?: string;
}

interface Hymn {
  id: string;
  title: string;
  subtitle?: string;
  number?: number;
  slug?: string;
}

const fetchThemeHymns = async (themeId: string) => {
  const { data } = await supabase
    .from('hymn_themes')
    .select(`
      hymns:hymns_new!hymn_id(
        id, title, view_count
      )
    `)
    .eq('theme_id', themeId);
    
  return data?.map(item => item.hymns) || [];
};

const ThemeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function fetchThemeDetails() {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError('');
        
        // Query thông tin chủ đề - đơn giản hơn
        const { data: themeData, error: themeError } = await supabase
          .from('themes')
          .select('id, name, description')
          .eq('id', id)
          .single();
        
        if (themeError) throw themeError;
        if (!themeData) throw new Error('Không tìm thấy chủ đề');
        
        setTheme(themeData);
        
        // Tải thánh ca của chủ đề này với cách tiếp cận hai bước
        const hymnsData = await fetchThemeHymns(themeData.id);
        setHymns(hymnsData);
        
      } catch (err) {
        console.error('Error fetching theme details:', err);
        setError('Không thể tải thông tin chủ đề. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchThemeDetails();
  }, [id]);
  
  if (isLoading) {
    return <LoadingIndicator message="Đang tải thông tin chủ đề..." />;
  }
  
  if (error || !theme) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-lg text-center">
        <Info className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-semibold mb-2">{error || 'Không tìm thấy chủ đề'}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Chủ đề này có thể đã bị xóa hoặc không tồn tại.
        </p>
        <Button asChild>
          <Link to="/themes">
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
          <Link to="/themes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Link>
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Palette className="h-8 w-8 mr-3 text-indigo-600" />
            <h1 className="text-2xl font-bold">{theme.name}</h1>
          </div>
          
          {theme.description && (
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: theme.description }} />
            </div>
          )}
        </CardContent>
      </Card>
      
      <h2 className="text-xl font-semibold mb-4">
        Thánh ca theo chủ đề: {theme.name}
        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
          ({hymns.length})
        </span>
      </h2>
      
      {hymns.length > 0 ? (
        <HymnsGrid hymns={hymns} />
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Chưa có thánh ca nào thuộc chủ đề này.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ThemeDetail;
