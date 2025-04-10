import { Author, Theme, Tag, HymnWithRelations } from '../types';

/**
 * Mock data để sử dụng trong môi trường dev hoặc khi API chưa sẵn sàng
 */

// Danh sách tác giả mẫu
export const mockAuthors: Author[] = [
  {
    id: 1,
    name: 'Hải Linh',
    biography: 'Linh mục Hải Linh là một nhạc sĩ và nhà soạn nhạc thánh ca nổi tiếng tại Việt Nam.',
    birth_year: 1943,
    hymn_count: 156
  },
  {
    id: 2,
    name: 'Hoài Đức',
    biography: 'Nhạc sĩ Hoài Đức đã đóng góp nhiều tác phẩm thánh ca được yêu thích.',
    birth_year: 1950,
    death_year: 2015,
    hymn_count: 87
  },
  {
    id: 3,
    name: 'Kim Long',
    biography: 'Linh mục Kim Long là một trong những tác giả thánh ca tiêu biểu với nhiều tác phẩm nổi tiếng.',
    birth_year: 1938,
    hymn_count: 210
  },
  {
    id: 4,
    name: 'Mi Trầm',
    biography: 'Nhạc sĩ Mi Trầm có nhiều đóng góp cho âm nhạc thánh ca Công giáo Việt Nam.',
    hymn_count: 67
  },
  {
    id: 5,
    name: 'Đặng Tiến Dũng',
    biography: 'Đặng Tiến Dũng là tác giả của nhiều bài thánh ca hiện đại.',
    birth_year: 1962,
    hymn_count: 45
  },
  {
    id: 6,
    name: 'Nguyễn Duy',
    biography: 'Nhạc sĩ Nguyễn Duy đã sáng tác nhiều tác phẩm thánh ca được yêu thích.',
    hymn_count: 32
  },
];

// Danh sách chủ đề mẫu
export const mockThemes: Theme[] = [
  {
    id: 1,
    name: 'Mùa Vọng',
    description: 'Những bài thánh ca cho Mùa Vọng, thời gian chuẩn bị tâm hồn đón mừng Chúa Giáng Sinh.',
    is_seasonal: true,
    hymn_count: 45
  },
  {
    id: 2,
    name: 'Giáng Sinh',
    description: 'Các bài hát mừng Chúa Giáng Sinh, mừng Ngôi Hai Thiên Chúa xuống thế làm người.',
    is_seasonal: true,
    hymn_count: 78
  },
  {
    id: 3,
    name: 'Mùa Chay',
    description: 'Thánh ca cho Mùa Chay, thời gian sám hối và chuẩn bị tâm hồn đón mừng Chúa Phục Sinh.',
    is_seasonal: true,
    hymn_count: 62
  },
  {
    id: 4,
    name: 'Phục Sinh',
    description: 'Các bài thánh ca mừng Chúa Phục Sinh, chiến thắng tội lỗi và sự chết.',
    is_seasonal: true,
    hymn_count: 53
  },
  {
    id: 5,
    name: 'Thánh Thể',
    description: 'Thánh ca về Bí tích Thánh Thể và tình yêu của Chúa Giêsu trong phép Thánh Thể.',
    hymn_count: 94
  },
  {
    id: 6,
    name: 'Đức Mẹ',
    description: 'Các bài thánh ca dâng kính Đức Mẹ Maria, Mẹ Thiên Chúa và Mẹ Giáo Hội.',
    hymn_count: 120
  },
  {
    id: 7,
    name: 'Thánh Nhân',
    description: 'Thánh ca về các thánh, những người đã sống đời thánh thiện và nêu gương cho chúng ta.',
    hymn_count: 35
  },
  {
    id: 8,
    name: 'Tôn Vinh',
    description: 'Các bài thánh ca ngợi khen và tôn vinh Thiên Chúa.',
    hymn_count: 87
  },
];

// Danh sách tag mẫu
export const mockTags: Tag[] = [
  { id: 1, name: 'Ca đoàn thiếu nhi', hymn_count: 45 },
  { id: 2, name: 'Dễ hát', hymn_count: 78 },
  { id: 3, name: 'Nhạc hiện đại', hymn_count: 32 },
  { id: 4, name: 'Bè 4', hymn_count: 28 },
  { id: 5, name: 'Nhạc truyền thống', hymn_count: 64 },
  { id: 6, name: 'Thánh lễ', hymn_count: 120 },
  { id: 7, name: 'Rước lễ', hymn_count: 56 },
  { id: 8, name: 'Dâng lễ', hymn_count: 48 },
  { id: 9, name: 'Kết lễ', hymn_count: 45 },
  { id: 10, name: 'Nhập lễ', hymn_count: 52 },
  { id: 11, name: 'Thầm lặng', hymn_count: 24 },
  { id: 12, name: 'Sôi động', hymn_count: 36 },
];

// Dữ liệu thánh ca mẫu
export const mockHymns: HymnWithRelations[] = [
  {
    id: 1,
    title: 'Thánh Vịnh 23',
    subtitle: 'Chúa Là Mục Tử',
    lyrics: 'Chúa là mục tử chăn dắt tôi, tôi chẳng thiếu thốn chi...',
    view_count: 1250,
    authors: [mockAuthors[0], mockAuthors[2]],
    themes: [mockThemes[7]],
    tags: [mockTags[5], mockTags[6]]
  },
  {
    id: 2,
    title: 'Kinh Hòa Bình',
    subtitle: 'Lấy yêu thương xóa bỏ hận thù',
    lyrics: 'Lạy Chúa từ nhân, xin cho con biết mến yêu...',
    view_count: 2340,
    authors: [mockAuthors[1]],
    themes: [mockThemes[5]],
    tags: [mockTags[1], mockTags[5], mockTags[11]]
  },
  {
    id: 3,
    title: 'Con Đường Chúa Đã Đi Qua',
    subtitle: 'Mùa Chay',
    lyrics: 'Lạy Chúa con đường nào Chúa đã đi qua...',
    view_count: 1870,
    authors: [mockAuthors[2]],
    themes: [mockThemes[2]],
    tags: [mockTags[4], mockTags[5]]
  },
  {
    id: 4,
    title: 'Về Nơi Đây',
    subtitle: 'Thánh Ca Tôn Vinh',
    lyrics: 'Về nơi đây chúng con hân hoan, về nơi đây con hòa tiếng ca...',
    view_count: 1560,
    authors: [mockAuthors[3]],
    themes: [mockThemes[7]],
    tags: [mockTags[2], mockTags[5], mockTags[12]]
  },
  {
    id: 5,
    title: 'Ave Maria',
    subtitle: 'Kính Đức Mẹ',
    lyrics: 'Ave Maria, gratia plena...',
    view_count: 2780,
    authors: [mockAuthors[4]],
    themes: [mockThemes[5]],
    tags: [mockTags[4], mockTags[5], mockTags[11]]
  },
  {
    id: 6,
    title: 'Alleluia, Con Cảm Tạ Chúa',
    subtitle: 'Mùa Phục Sinh',
    lyrics: 'Alleluia, alleluia, con cảm tạ Chúa...',
    view_count: 1980,
    authors: [mockAuthors[5]],
    themes: [mockThemes[3]],
    tags: [mockTags[1], mockTags[5], mockTags[12]]
  }
];

// Danh sách thánh ca cho một tác giả cụ thể
export function getMockHymnsForAuthor(authorId: string | number): HymnWithRelations[] {
  return mockHymns.filter(hymn => 
    hymn.authors?.some(author => author.id.toString() === authorId.toString())
  );
}

// Danh sách thánh ca cho một chủ đề cụ thể
export function getMockHymnsForTheme(themeId: string | number): HymnWithRelations[] {
  return mockHymns.filter(hymn => 
    hymn.themes?.some(theme => theme.id.toString() === themeId.toString())
  );
}

// Danh sách thánh ca cho một tag cụ thể
export function getMockHymnsForTag(tagId: string | number): HymnWithRelations[] {
  return mockHymns.filter(hymn => 
    hymn.tags?.some(tag => tag.id.toString() === tagId.toString())
  );
}
