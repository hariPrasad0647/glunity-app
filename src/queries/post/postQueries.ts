import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { apiClient } from '~/api/client';
import { useAuthStore } from '~/store/authStore';
import { Post, Reply } from '~/types';

// ==========================================
// FEED QUERIES
// ==========================================

export interface FeedResponse {
  success: boolean;
  message: string;
  data: {
    feed: Post[];
    hasMore: boolean;
    page: number;
    limit: number;
  };
}

export const useFeedQuery = () => {
  return useInfiniteQuery({
    queryKey: ['feed'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      // The backend strictly separates user posts (Page 1) and friend posts (Page 2+)
      // To create a true chronological mixed feed on initial load, we fetch both concurrently.
      if (pageParam === 1) {
        const [res1, res2] = await Promise.all([
          apiClient.get<FeedResponse>('/api/feed/home', { params: { page: 1, limit: 10 } }),
          apiClient.get<FeedResponse>('/api/feed/home', { params: { page: 2, limit: 10 } })
        ]);
        
        const feed1 = res1.data.data.feed || [];
        const feed2 = res2.data.data.feed || [];
        
        return {
          success: true,
          message: "Combined initial feed",
          data: {
            feed: [...feed1, ...feed2],
            hasMore: res2.data.data.hasMore,
            page: 2, // We've effectively consumed page 2
            limit: res2.data.data.limit
          }
        } as FeedResponse;
      }
      
      const { data } = await apiClient.get<FeedResponse>('/api/feed/home', {
        params: { page: pageParam, limit: 10 },
      });
      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.data.hasMore ? lastPage.data.page + 1 : undefined;
    },
  });
};

export const useFollowingFeedQuery = () => {
  return useInfiniteQuery({
    queryKey: ['followingFeed'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const { data } = await apiClient.get<FeedResponse>('/api/feed/following', {
        params: { page: pageParam, limit: 10 },
      });
      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.data.hasMore ? lastPage.data.page + 1 : undefined;
    },
  });
};

export const useUserPostsQuery = (userId: string) => {
  return useInfiniteQuery({
    queryKey: ['userPosts', userId],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const { data } = await apiClient.get<{ data: { posts: Post[]; total: number; page: number; limit: number } }>(
        `/api/users/${userId}/posts`,
        { params: { page: pageParam, limit: 12 } }
      );
      return data;
    },
    getNextPageParam: (lastPage) => {
      const maxPages = Math.ceil(lastPage.data.total / lastPage.data.limit);
      return lastPage.data.page < maxPages ? lastPage.data.page + 1 : undefined;
    },
  });
};

export const useUserRepostsQuery = (userId: string) => {
  return useInfiniteQuery({
    queryKey: ['userReposts', userId],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const endpoint = userId === 'me' ? '/api/users/me/reposted/posts' : `/api/users/${userId}/reposted/posts`;
      const { data } = await apiClient.get<{ data: { posts: Post[]; total?: number; page?: number; limit?: number } }>(
        endpoint,
        { params: { page: pageParam, limit: 12 } }
      );
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.total && lastPage.data.limit && lastPage.data.page) {
        const maxPages = Math.ceil(lastPage.data.total / lastPage.data.limit);
        return lastPage.data.page < maxPages ? lastPage.data.page + 1 : undefined;
      }
      return lastPage.data.posts.length === 12 ? allPages.length + 1 : undefined;
    },
  });
};

// ==========================================
// SINGLE POST QUERIES
// ==========================================

export const usePostDetailQuery = (postId: string) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Post }>(`/api/posts/${postId}`);
      return data.data;
    },
  });
};

export const usePostRepliesQuery = (postId: string) => {
  return useInfiniteQuery({
    queryKey: ['postReplies', postId],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const { data } = await apiClient.get<{ data: { replies: Reply[]; total: number; page: number; limit: number } }>(
        `/api/posts/${postId}/replies`,
        { params: { page: pageParam, limit: 20 } }
      );
      return data;
    },
    getNextPageParam: (lastPage) => {
      const maxPages = Math.ceil(lastPage.data.total / lastPage.data.limit);
      return lastPage.data.page < maxPages ? lastPage.data.page + 1 : undefined;
    },
  });
};

// ==========================================
// MUTATIONS
// ==========================================

export const useDeletePostMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const { data } = await apiClient.delete(`/api/posts/${postId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['myPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userReposts'] });
    },
  });
};

export const useCreatePostMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ content, media }: { content: string, media?: string[] }) => {
      const formData = new FormData();
      formData.append('content', content);
      
      if (media && media.length > 0) {
        media.forEach((uri, index) => {
          const filename = uri.split('/').pop() || `media_${index}.jpg`;
          const ext = /\.(\w+)$/.exec(filename)?.[1]?.toLowerCase();
          
          let type = 'application/octet-stream';
          if (ext) {
            if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
              type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
            } else if (['mp4', 'mov', 'mkv', 'webm'].includes(ext)) {
              type = `video/${ext === 'mov' ? 'quicktime' : ext}`;
            }
          }
          
          formData.append('media', {
            uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
            name: filename,
            type,
          } as any);
        });
      }
      
      const token = useAuthStore.getState().accessToken;
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://glunity.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || 'Failed to create post');
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['myPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userReposts'] });
    },
  });
};

export const useReplyMutation = (postId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (text: string) => {
      const { data } = await apiClient.post(`/api/posts/${postId}/replies`, { text });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postReplies', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['myPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userReposts'] });
      
      const updater = (post: Post) => {
        const currentCount = post.commentCount !== undefined ? post.commentCount : (post as any).replyCount || 0;
        return {
          ...post,
          commentCount: currentCount + 1,
          replyCount: currentCount + 1,
        };
      };
      updatePostInFeedCache(queryClient, postId, updater);
    },
  });
};

// ==========================================
// OPTIMISTIC INTERACTIONS
// ==========================================

// Helper to optimistically update a post within the feed cache and profile caches
const updatePostInFeedCache = (queryClient: any, postId: string, updater: (post: Post) => Post) => {
  const queryKeys = [['feed'], ['userPosts'], ['myPosts'], ['userReposts']];
  
  queryKeys.forEach(key => {
    queryClient.setQueriesData({ queryKey: key }, (oldData: any) => {
      if (!oldData || !oldData.pages) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          data: {
            ...page.data,
            ...(page.data.feed ? {
              feed: page.data.feed.map((item: Post) => 
                item.id === postId ? updater(item) : item
              )
            } : {}),
            ...(page.data.posts ? {
              posts: page.data.posts.map((item: Post) => 
                item.id === postId ? updater(item) : item
              )
            } : {}),
          }
        })),
      };
    });
  });
};

export const useLikeMutation = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<{ data: { liked: boolean; likeCount: number } }>(`/api/posts/${postId}/like`);
      return data.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      await queryClient.cancelQueries({ queryKey: ['post', postId] });

      // Optimistic update
      const updater = (post: Post) => ({
        ...post,
        hasLiked: !post.hasLiked,
        likeCount: post.hasLiked ? Math.max(0, post.likeCount - 1) : post.likeCount + 1,
      });

      updatePostInFeedCache(queryClient, postId, updater);
      
      const previousPost = queryClient.getQueryData(['post', postId]);
      if (previousPost) {
        queryClient.setQueryData(['post', postId], updater(previousPost as Post));
      }

      return { previousPost };
    },
    onSuccess: (result) => {
      // Reconcile with exact server values
      const updater = (post: Post) => ({
        ...post,
        hasLiked: result.liked,
        likeCount: result.likeCount,
      });
      updatePostInFeedCache(queryClient, postId, updater);
      queryClient.setQueryData(['post', postId], (old: any) => old ? updater(old) : old);
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};

export const useBookmarkMutation = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<{ data: { bookmarked: boolean; bookmarkCount: number } }>(`/api/posts/${postId}/bookmark`);
      return data.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      
      const updater = (post: Post) => ({
        ...post,
        hasBookmarked: !post.hasBookmarked,
        bookmarkCount: post.hasBookmarked ? Math.max(0, post.bookmarkCount - 1) : post.bookmarkCount + 1,
      });

      updatePostInFeedCache(queryClient, postId, updater);
    },
    onSuccess: (result) => {
      const updater = (post: Post) => ({
        ...post,
        hasBookmarked: result.bookmarked,
        bookmarkCount: result.bookmarkCount,
      });
      updatePostInFeedCache(queryClient, postId, updater);
    },
  });
};

export const useRepostMutation = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<{ data: { reposted: boolean; repostCount: number } }>(`/api/posts/${postId}/repost`);
      return data.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      
      const updater = (post: Post) => ({
        ...post,
        hasReposted: !post.hasReposted,
        repostCount: post.hasReposted ? Math.max(0, post.repostCount - 1) : post.repostCount + 1, 
      });

      updatePostInFeedCache(queryClient, postId, updater);
      
      const previousPost = queryClient.getQueryData(['post', postId]);
      if (previousPost) {
        queryClient.setQueryData(['post', postId], updater(previousPost as Post));
      }

      return { previousPost };
    },
    onSuccess: (result) => {
      const updater = (post: Post) => ({
        ...post,
        hasReposted: result.reposted,
        repostCount: result.repostCount,
      });
      updatePostInFeedCache(queryClient, postId, updater);
      queryClient.setQueryData(['post', postId], (old: any) => old ? updater(old) : old);
    },
    onError: (err, variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};

export const useDeleteReplyMutation = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (replyId: string) => {
      const { data } = await apiClient.delete(`/api/posts/${postId}/replies/${replyId}`);
      return data;
    },
    onMutate: async (replyId) => {
      await queryClient.cancelQueries({ queryKey: ['postReplies', postId] });
      
      const previousReplies = queryClient.getQueryData(['postReplies', postId]);
      
      // Optimistically remove the reply from infinite query pages
      queryClient.setQueryData(['postReplies', postId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              replies: page.data.replies.filter((r: Reply) => r.id !== replyId),
            }
          })),
        };
      });
      
      return { previousReplies };
    },
    onError: (err, replyId, context) => {
      if (context?.previousReplies) {
        queryClient.setQueryData(['postReplies', postId], context.previousReplies);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['myPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userReposts'] });
      
      const updater = (post: Post) => {
        const currentCount = post.commentCount !== undefined ? post.commentCount : (post as any).replyCount || 0;
        return {
          ...post,
          commentCount: Math.max(0, currentCount - 1),
          replyCount: Math.max(0, currentCount - 1),
        };
      };
      updatePostInFeedCache(queryClient, postId, updater);
    },
  });
};

export const useLikeReplyMutation = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (replyId: string) => {
      const { data } = await apiClient.post<{ data: { liked: boolean; likeCount: number } }>(`/api/posts/${postId}/replies/${replyId}/like`);
      return data.data;
    },
    onMutate: async (replyId) => {
      await queryClient.cancelQueries({ queryKey: ['postReplies', postId] });
      
      const previousReplies = queryClient.getQueryData(['postReplies', postId]);
      
      const updater = (reply: Reply) => ({
        ...reply,
        hasLiked: !reply.hasLiked,
        likeCount: reply.hasLiked ? Math.max(0, reply.likeCount - 1) : reply.likeCount + 1,
      });

      queryClient.setQueryData(['postReplies', postId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              replies: page.data.replies.map((r: Reply) => 
                r.id === replyId ? updater(r) : r
              ),
            }
          })),
        };
      });
      
      return { previousReplies };
    },
    onError: (err, replyId, context) => {
      if (context?.previousReplies) {
        queryClient.setQueryData(['postReplies', postId], context.previousReplies);
      }
    },
    onSuccess: (result, replyId) => {
      const updater = (reply: Reply) => ({
        ...reply,
        hasLiked: result.liked,
        likeCount: result.likeCount,
      });

      queryClient.setQueryData(['postReplies', postId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              replies: page.data.replies.map((r: Reply) => 
                r.id === replyId ? updater(r) : r
              ),
            }
          })),
        };
      });
    },
  });
};

export const useNestedRepliesQuery = (postId: string, replyId: string) => {
  return useInfiniteQuery({
    queryKey: ['nestedReplies', postId, replyId],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const { data } = await apiClient.get<{ data: { replies: Reply[]; total: number; page: number; limit: number } }>(
        `/api/posts/${postId}/replies/${replyId}/replies`,
        { params: { page: pageParam, limit: 10 } }
      );
      return data;
    },
    getNextPageParam: (lastPage) => {
      const maxPages = Math.ceil(lastPage.data.total / lastPage.data.limit);
      return lastPage.data.page < maxPages ? lastPage.data.page + 1 : undefined;
    },
  });
};

export const useNestedReplyMutation = (postId: string, replyId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (text: string) => {
      const { data } = await apiClient.post(`/api/posts/${postId}/replies/${replyId}/replies`, { text });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nestedReplies', postId, replyId] });
      queryClient.invalidateQueries({ queryKey: ['postReplies', postId] });
    },
  });
};
