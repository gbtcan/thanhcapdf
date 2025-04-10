#!/bin/bash

# Kiểm tra cấu trúc thư mục mới
echo "Kiểm tra cấu trúc thư mục..."

required_dirs=(
  "src/core/components/ui"
  "src/core/contexts"
  "src/core/hooks"
  "src/core/types"
  "src/core/utils"
  "src/features/hymns/api"
  "src/features/hymns/components"
  "src/features/hymns/pages"
  "src/features/catalog/api"
  "src/features/catalog/components"
  "src/features/catalog/pages"
  "src/features/users/auth"
  "src/features/users/profile"
  "src/features/admin/content"
  "src/features/community/components"
  "src/layouts/admin"
  "src/layouts/public"
  "src/lib"
  "src/config"
  "src/styles"
)

# Kiểm tra thư mục
echo "Kiểm tra thư mục..."
for dir in "${required_dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "✓ $dir tồn tại"
  else
    echo "✗ Thiếu thư mục: $dir"
    mkdir -p "$dir"
    echo "  Đã tạo thư mục: $dir"
  fi
done

# Check files
echo "Checking files..."
for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file exists"
  else
    echo "✗ Missing file: $file"
    echo "  Please create the file: $file"
  fi
done
