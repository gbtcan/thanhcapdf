#!/bin/bash

# This script helps clean up unnecessary files

# List of files to check if we should remove
echo "Files that may be redundant and should be checked:"

echo "Checking for duplicate PDF utilities..."
find src/utils -name "pdf*.ts" -type f -not -path "src/utils/pdf/*" | while read file; do
  echo "- $file (may be duplicate of src/utils/pdf/$(basename $file))"
done

echo "Checking for duplicate script versions..."
find scripts -name "*.cjs" | while read file; do
  jsfile="${file%.cjs}.js"
  if [ -f "$jsfile" ]; then
    echo "- $file (duplicate of $jsfile)"
  fi
done

echo -e "\nPlease manually review and remove redundant files."
