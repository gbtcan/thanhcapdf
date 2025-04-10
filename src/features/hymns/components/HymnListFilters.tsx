import React from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '../../../core/components/ui/button';
import { Input } from '../../../core/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../core/components/ui/select';
import { HymnFilters } from '../types';

interface HymnListFiltersProps {
  filters: HymnFilters;
  themes: Array<{ id: string; name: string }>;
  authors: Array<{ id: string; name: string }>;
  onFilterChange: (filters: Partial<HymnFilters>) => void;
  onSearch: () => void;
  onReset: () => void;
}

const HymnListFilters: React.FC<HymnListFiltersProps> = ({
  filters,
  themes,
  authors,
  onFilterChange,
  onSearch,
  onReset
}) => {
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const hasActiveFilters = () => {
    return !!(filters.search || filters.authorId || filters.themeId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 shadow-sm">
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm thánh ca..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="pl-9"
            />
          </div>
          
          <Button type="submit">
            Tìm kiếm
          </Button>
          
          {hasActiveFilters() && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onReset}
              className="flex items-center gap-1"
            >
              <X size={16} />
              Xóa bộ lọc
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center">
            <span className="mr-2 text-sm whitespace-nowrap">Sắp xếp:</span>
            <Select
              value={filters.sortBy || 'title'}
              onValueChange={(value) => onFilterChange({ sortBy: value })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Tên thánh ca</SelectItem>
                <SelectItem value="view_count">Lượt xem</SelectItem>
                <SelectItem value="created_at">Ngày tạo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onFilterChange({ 
              sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
            })}
            className="h-9 w-9"
          >
            <Filter className={`h-4 w-4 ${filters.sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            <span className="sr-only">Thứ tự sắp xếp</span>
          </Button>
          
          <div className="flex-1 md:flex-none">
            <Select
              value={filters.themeId || ""}
              onValueChange={(value) => onFilterChange({ themeId: value || undefined })}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Chủ đề" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả chủ đề</SelectItem>
                {themes.map(theme => (
                  <SelectItem key={theme.id} value={theme.id}>{theme.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 md:flex-none">
            <Select
              value={filters.authorId || ""}
              onValueChange={(value) => onFilterChange({ authorId: value || undefined })}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Tác giả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả tác giả</SelectItem>
                {authors.map(author => (
                  <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HymnListFilters;
