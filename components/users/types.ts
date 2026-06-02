export interface UserProfileData {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: string;
}

export interface UserStats {
  readCount: number;
  booksReadCount?: number;
  currentlyReadingCount: number;
  wantToReadCount: number;
}

export type SocialTab = 'followers' | 'following' | 'books' | 'trackers';
