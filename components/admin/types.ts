export interface AdminBook {
  id: number;
  title: string;
  authorName: string;
  genre: string;
  description: string;
  coverImageUrl: string;
  totalPages?: number;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  surname: string;
  role: string;
  avatarUrl?: string;
  language?: string;
  createdAt: string;
}

export interface AdminReview {
  id: number;
  userId: number;
  bookId: number;
  rating: number;
  content: string;
  likesCount: number;
  dislikesCount: number;
  createdAt: string;
  book?: {
    id: number;
    title: string;
    authorName: string;
  };
  user?: {
    id: number;
    name: string;
    surname: string;
  };
}

export interface AdminComment {
  id: number;
  userId: number;
  bookId: number;
  content: string;
  createdAt: string;
  replies: AdminComment[];
  book?: {
    id: number;
    title: string;
    authorName: string;
  };
  user?: {
    id: number;
    name: string;
    surname: string;
  };
}

export interface PaginationMeta {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}
