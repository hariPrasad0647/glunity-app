export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export interface TokenReference {
  symbol: string;
  price: number;
  priceChange24h: number;
}

export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
}

export interface Post {
  id: string;
  author: User;
  text: string;
  media?: Media[];
  createdAt: string;
  likeCount: number;
  replyCount: number;
  repostCount: number;
  bookmarkCount?: number;
  likedByMe: boolean;
  repostedByMe: boolean;
  bookmarkedByMe: boolean;
  quotedPost?: Post;
  tokenReferences?: TokenReference[];
}
