import { 
  mockAuthors, 
  mockThemes, 
  mockTags, 
  mockHymns, 
  getMockHymnsForAuthor,
  getMockHymnsForTheme,
  getMockHymnsForTag
} from './mockData';
import { Author, Theme, Tag, HymnWithRelations } from '../types';

interface PaginationParams {
  page: number;
  pageSize: number;
}

interface SortParams {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

interface AuthorsParams extends PaginationParams, SortParams {
  search?: string;
}

interface ThemesParams extends PaginationParams, SortParams {
  search?: string;
}

interface HymnsParams extends PaginationParams, SortParams {}

// Mock API implementation that returns mock data
// This can be used for development or when the real API is not available

// Fetch all authors with pagination and filtering
export async function mockFetchAuthors({
  search = '',
  sortBy = 'name',
  sortDirection = 'asc',
  page = 0,
  pageSize = 12
}: AuthorsParams): Promise<{ authors: Author[], total: number }> {
  // Simulate API delay
  await delay(300);
  
  // Filter by search term if provided
  let filteredAuthors = [...mockAuthors];
  if (search) {
    filteredAuthors = filteredAuthors.filter(author =>
      author.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Sort authors
  filteredAuthors = sortItems(filteredAuthors, sortBy, sortDirection);
  
  // Total count before pagination
  const total = filteredAuthors.length;
  
  // Apply pagination
  const start = page * pageSize;
  const end = start + pageSize;
  filteredAuthors = filteredAuthors.slice(start, end);
  
  return {
    authors: filteredAuthors,
    total
  };
}

// Fetch single author details
export async function mockFetchAuthorDetail(authorId: string | number): Promise<Author | null> {
  // Simulate API delay
  await delay(200);
  
  const author = mockAuthors.find(author => author.id.toString() === authorId.toString());
  return author || null;
}

// Fetch hymns by a specific author
export async function mockFetchAuthorHymns(authorId: string | number): Promise<{ hymns: HymnWithRelations[], total: number }> {
  // Simulate API delay
  await delay(400);
  
  const hymns = getMockHymnsForAuthor(authorId);
  return {
    hymns,
    total: hymns.length
  };
}

// Fetch all themes with pagination and filtering
export async function mockFetchThemes({
  search = '',
  sortBy = 'name',
  sortDirection = 'asc',
  page = 0,
  pageSize = 12
}: ThemesParams): Promise<{ themes: Theme[], total: number }> {
  // Simulate API delay
  await delay(300);
  
  // Filter by search term if provided
  let filteredThemes = [...mockThemes];
  if (search) {
    filteredThemes = filteredThemes.filter(theme =>
      theme.name.toLowerCase().includes(search.toLowerCase()) ||
      (theme.description && theme.description.toLowerCase().includes(search.toLowerCase()))
    );
  }
  
  // Sort themes
  filteredThemes = sortItems(filteredThemes, sortBy, sortDirection);
  
  // Total count before pagination
  const total = filteredThemes.length;
  
  // Apply pagination
  const start = page * pageSize;
  const end = start + pageSize;
  filteredThemes = filteredThemes.slice(start, end);
  
  return {
    themes: filteredThemes,
    total
  };
}

// Fetch single theme details
export async function mockFetchThemeDetail(themeId: string | number): Promise<Theme | null> {
  // Simulate API delay
  await delay(200);
  
  const theme = mockThemes.find(theme => theme.id.toString() === themeId.toString());
  return theme || null;
}

// Fetch hymns by a specific theme
export async function mockFetchThemeHymns(
  themeId: string | number,
  {
    page = 0,
    pageSize = 9,
    sortBy = 'title',
    sortDirection = 'asc'
  }: HymnsParams
): Promise<{ hymns: HymnWithRelations[], total: number }> {
  // Simulate API delay
  await delay(400);
  
  let hymns = getMockHymnsForTheme(themeId);
  
  // Sort hymns
  hymns = sortItems(hymns, sortBy, sortDirection);
  
  // Total count before pagination
  const total = hymns.length;
  
  // Apply pagination
  const start = page * pageSize;
  const end = start + pageSize;
  hymns = hymns.slice(start, end);
  
  return {
    hymns,
    total
  };
}

// Fetch all tags with search capability
export async function mockFetchTags(search: string = ''): Promise<Tag[]> {
  // Simulate API delay
  await delay(200);
  
  if (!search) {
    return mockTags;
  }
  
  // Filter tags by search term
  const filteredTags = mockTags.filter(tag =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  );
  
  return filteredTags;
}

// Fetch single tag details
export async function mockFetchTagDetail(tagId: string | number): Promise<Tag | null> {
  // Simulate API delay
  await delay(200);
  
  const tag = mockTags.find(tag => tag.id.toString() === tagId.toString());
  return tag || null;
}

// Fetch hymns by a specific tag
export async function mockFetchTagHymns(
  tagId: string | number,
  {
    page = 0,
    pageSize = 9,
    sortBy = 'title',
    sortDirection = 'asc'
  }: HymnsParams
): Promise<{ hymns: HymnWithRelations[], total: number }> {
  // Simulate API delay
  await delay(400);
  
  let hymns = getMockHymnsForTag(tagId);
  
  // Sort hymns
  hymns = sortItems(hymns, sortBy, sortDirection);
  
  // Total count before pagination
  const total = hymns.length;
  
  // Apply pagination
  const start = page * pageSize;
  const end = start + pageSize;
  hymns = hymns.slice(start, end);
  
  return {
    hymns,
    total
  };
}

// Fetch popular themes (for homepage and other places)
export async function mockFetchPopularThemes(limit: number = 6): Promise<Theme[]> {
  // Simulate API delay
  await delay(300);
  
  // Sort themes by hymn_count and take the top ones
  const popularThemes = [...mockThemes]
    .sort((a, b) => (b.hymn_count || 0) - (a.hymn_count || 0))
    .slice(0, limit);
  
  return popularThemes;
}

// Helper function to simulate API delay
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to sort items
function sortItems<T>(items: T[], sortBy: string, sortDirection: 'asc' | 'desc'): T[] {
  return [...items].sort((a, b) => {
    // @ts-ignore - Dynamic property access
    const aValue = a[sortBy];
    // @ts-ignore - Dynamic property access
    const bValue = b[sortBy];
    
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
    if (bValue === undefined) return sortDirection === 'asc' ? -1 : 1;
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });
}
