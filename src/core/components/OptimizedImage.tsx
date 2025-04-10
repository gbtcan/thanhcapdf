import React, { memo } from 'react';
import { cn } from '../../lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number; 
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

/**
 * Tối ưu hóa hình ảnh với lazy loading và srcset
 * - Sử dụng loading="lazy" để tải hình ảnh chỉ khi nó gần hiển thị
 * - Sử dụng srcset để tải hình ảnh kích thước phù hợp với thiết bị
 * - Sử dụng sizes để định nghĩa kích thước hiển thị hình ảnh
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  sizes = '100vw',
  className,
  priority,
  ...props
}) => {
  // Tạo srcSet nếu path chứa .jpg, .png hoặc .webp
  let srcSet = undefined;
  
  if (/\.(jpe?g|png|webp)$/i.test(src)) {
    // Generate srcsets for responsive images if the image is from our own domain
    if (src.startsWith('/') || src.startsWith('.')) {
      // Trích xuất đường dẫn cơ sở và phần mở rộng
      const basePath = src.substring(0, src.lastIndexOf('.'));
      const extension = src.substring(src.lastIndexOf('.'));
      
      // Tạo các kích thước khác nhau
      srcSet = [
        `${basePath}-300w${extension} 300w`,
        `${basePath}-600w${extension} 600w`,
        `${basePath}-900w${extension} 900w`,
        `${basePath}-1200w${extension} 1200w`,
      ].join(', ');
    }
  }
  
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      srcSet={srcSet}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      className={cn('', className)}
      {...props}
    />
  );
};

export default memo(OptimizedImage);
