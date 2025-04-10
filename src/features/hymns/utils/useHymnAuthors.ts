import { useState, useEffect } from 'react';
import { fetchHymnAuthors } from './authorFetcher';
import { supabase } from '../../../lib/supabase';

// Interface cho thông tin tác giả
interface Author {
  id: string;
  name: string;
}

// Cache lưu trữ thông tin chi tiết của tác giả
const authorDetailsCache = new Map<string, Author>();

/**
 * Hook để tải thông tin tác giả cho một hoặc nhiều bài hát
 * @param hymnIds Mảng các ID bài hát cần lấy thông tin tác giả
 * @returns Đối tượng Map: hymnId -> danh sách tác giả
 */
export function useHymnAuthors(hymnIds: string[] | string) {
  const [authorMap, setAuthorMap] = useState<Record<string, Author[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Chuẩn hóa hymnIds thành mảng
  const normalizedIds = Array.isArray(hymnIds) ? hymnIds : [hymnIds];
  
  // Lọc bỏ các ID không hợp lệ
  const validIds = normalizedIds.filter(id => id && id !== 'undefined');

  useEffect(() => {
    if (validIds.length === 0) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const loadAuthors = async () => {
      try {
        // Lấy map các ID bài hát đến danh sách ID tác giả sử dụng utility đã tối ưu
        const authorsIdMap = await fetchHymnAuthors(validIds);
        
        // Tập hợp tất cả ID tác giả cần tải thông tin chi tiết
        const allAuthorIds: string[] = [];
        Object.values(authorsIdMap).forEach(authorIds => {
          authorIds.forEach(id => {
            if (!authorDetailsCache.has(id)) {
              allAuthorIds.push(id);
            }
          });
        });
        
        // Nếu có tác giả cần tải thông tin chi tiết
        if (allAuthorIds.length > 0) {
          // Tải thông tin chi tiết của tác giả trong một lần gọi duy nhất
          const { data: authorsData, error: authorsError } = await supabase
            .from('authors')
            .select('id, name')
            .in('id', allAuthorIds);
            
          if (authorsError) throw authorsError;
          
          // Lưu thông tin tác giả vào cache
          authorsData?.forEach((author: Author) => {
            authorDetailsCache.set(author.id, author);
          });
        }
        
        // Xây dựng kết quả cuối cùng từ cache
        const result: Record<string, Author[]> = {};
        Object.entries(authorsIdMap).forEach(([hymnId, authorIds]) => {
          result[hymnId] = authorIds
            .map(id => authorDetailsCache.get(id))
            .filter(author => author !== undefined) as Author[];
        });
        
        if (isMounted) {
          setAuthorMap(result);
        }
      } catch (err) {
        console.error('Error fetching authors:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error fetching authors'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAuthors();

    return () => {
      isMounted = false;
    };
  }, [validIds.join(',')]);

  return { authorMap, isLoading, error };
}