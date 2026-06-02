export interface Book {
  id: number;
  title: string;
  authorName: string;
  genre: string;
  coverImageUrl: string;
  totalPages?: number;
}

export interface UserBook {
  id: number;
  status: 'currentlyReading' | 'wantToRead' | 'read';
  readPages: number;
  createdAt: string;
  bookId: number;
  book?: Book;
}

export type ShelfTab = 'reading' | 'want' | 'completed';
