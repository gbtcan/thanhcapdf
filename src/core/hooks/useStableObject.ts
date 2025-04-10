import { useRef, useEffect } from 'react';
import { isEqual } from 'lodash-es';

/**
 * Hook để giữ một tham chiếu ổn định đến một object
 * Chỉ cập nhật reference khi nội dung thực sự thay đổi
 * Hữu ích để ngăn re-render không cần thiết
 */
export function useStableObject<T>(value: T): T {
  const ref = useRef<T>(value);
  
  useEffect(() => {
    if (!isEqual(value, ref.current)) {
      ref.current = value;
    }
  }, [value]);
  
  return ref.current;
}
