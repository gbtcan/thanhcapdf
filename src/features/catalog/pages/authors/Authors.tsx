import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { User } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import LoadingIndicator from '../../../../core/components/LoadingIndicator';

interface Author {
  id: string;
  name: string;
  biography?: string; // Thay thế description bằng biography
  // Lưu ý: image_url và slug không tồn tại trong database
}

const Authors: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('authors')
          .select('id, name, biography') // Thay description bằng biography, bỏ image_url và slug
          .order('name', { ascending: true });
          
        if (error) throw error;
        
        setAuthors(data || []);
      } catch (err) {
        console.error('Error fetching authors:', err);
        setError('Không thể tải danh sách tác giả. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  // ... phần còn lại của component giữ nguyên ...
  
  // Đối với các đoạn code render hiển thị dữ liệu, thay thế:
  // author.description -> author.biography
  // Và xử lý trường hợp image_url không tồn tại
}

export default Authors;
