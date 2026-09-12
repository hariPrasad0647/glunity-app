import { useInfiniteQuery } from '@tanstack/react-query';
import { getLikedPosts, getLikedReels, getUserComments, getSavedPosts, getSavedReels } from '../../api/activity';

export const useLikedPostsQuery = () => {
  return useInfiniteQuery({
    queryKey: ['likedPosts'],
    queryFn: ({ pageParam = 1 }) => getLikedPosts(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const { page, total, limit } = lastPage.data;
      if (page && total && limit) {
        return page * limit < total ? page + 1 : undefined;
      }
      return lastPage.data.posts?.length > 0 ? allPages.length + 1 : undefined;
    },
  });
};

export const useLikedReelsQuery = () => {
  return useInfiniteQuery({
    queryKey: ['likedReels'],
    queryFn: ({ pageParam = 1 }) => getLikedReels(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const { page, total, limit } = lastPage.data;
      if (page && total && limit) {
        return page * limit < total ? page + 1 : undefined;
      }
      return lastPage.data.reels?.length > 0 ? allPages.length + 1 : undefined;
    },
  });
};

export const useUserCommentsQuery = () => {
  return useInfiniteQuery({
    queryKey: ['userComments'],
    queryFn: ({ pageParam = 1 }) => getUserComments(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const { page, total, limit } = lastPage.data;
      if (page && total && limit) {
        return page * limit < total ? page + 1 : undefined;
      }
      return lastPage.data.replies?.length > 0 ? allPages.length + 1 : undefined;
    },
  });
};

export const useSavedPostsQuery = () => {
  return useInfiniteQuery({
    queryKey: ['savedPosts'],
    queryFn: ({ pageParam = 1 }) => getSavedPosts(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const { page, total, limit } = lastPage.data;
      if (page && total && limit) {
        return page * limit < total ? page + 1 : undefined;
      }
      return lastPage.data.posts?.length > 0 ? allPages.length + 1 : undefined;
    },
  });
};

export const useSavedReelsQuery = () => {
  return useInfiniteQuery({
    queryKey: ['savedReels'],
    queryFn: ({ pageParam = 1 }) => getSavedReels(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const { page, total, limit } = lastPage.data;
      if (page && total && limit) {
        return page * limit < total ? page + 1 : undefined;
      }
      return lastPage.data.reels?.length > 0 ? allPages.length + 1 : undefined;
    },
  });
};
