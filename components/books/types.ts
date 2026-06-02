export interface UserBook {
  id: number;
  status: 'wantToRead' | 'currentlyReading' | 'read';
  readPages: number;
}

export interface Book {
  id: number;
  title: string;
  authorName: string;
  genre: string;
  description: string;
  coverImageUrl: string;
  totalPages?: number;
}

export interface GoogleBookResult {
  googleBooksId: string;
  title: string;
  authorName: string;
  genre?: string;
  description: string;
  coverImageUrl: string;
  totalPages?: number;
}

export interface BookDetailsData {
  book: Book;
  reviewsCount: number;
  commentsCount: number;
  averageRating: number;
  currentUserBook: UserBook | null;
}

export interface Review {
  id: number;
  content: string;
  rating: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    surname: string;
  };
}

export interface Comment {
  id: number;
  content: string;
  parentId: number | null;
  createdAt: string;
  replies?: Comment[];
  user: {
    id: number;
    name: string;
    surname: string;
  };
}
