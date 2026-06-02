export interface Tracker {
  id: number;
  targetBooksCount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface Book {
  id: number;
  title: string;
  authorName: string;
  genre: string;
}

export interface UserBook {
  id: number;
  status: string;
  bookId: number;
  book?: Book;
}

export interface TrackerItem {
  id: number;
  trackerId: number;
  userBookId: number;
  userBook?: UserBook;
}
