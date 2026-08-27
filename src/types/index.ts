export interface User {
  id: string;
  username: string;
  fullName: string;
  profileImage: string | null;
  isVerified?: boolean;
}

export interface Post {
  id: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  author: User;
  media: string[];
  hashtags: string[];
  mentions: Array<{
    id: string;
    username: string;
    profileImage: string | null;
  }>;
  likeCount: number;
  bookmarkCount: number;
  repostCount: number;
  commentCount: number;
  hasLiked: boolean;
  hasBookmarked: boolean;
}

export interface Reply {
  id: string;
  text: string;
  author: User;
  createdAt: string;
  likeCount: number;
  hasLiked: boolean;
  replyCount: number;
}

