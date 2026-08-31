import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '~/api/client';
import { useAuthStore } from '~/store/authStore';
import { Post } from '~/types';

export type FollowStatus = 'following' | 'pending' | 'none';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  bio?: string;
  profession?: string;
  profileImage: string | null;
  isPrivate: boolean;
  createdAt: string;
  postCount: number;
  reelCount: number;
  followerCount: number;
  followingCount: number;
  followStatus: FollowStatus;
  isMutual?: boolean;
  isOwnProfile: boolean;
  posts?: {
    items: Post[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface BasicUser {
  id: string;
  username: string;
  fullName: string;
  profileImage: string | null;
  followStatus?: FollowStatus;
}

// ==========================================
// QUERIES
// ==========================================

export const useMyProfileQuery = () => {
  return useQuery({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: UserProfile }>('/api/users/me', {
        params: { postLimit: 12, reelLimit: 12 }
      });
      return data.data;
    },
  });
};

export const useUserProfileQuery = (userId: string) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: UserProfile }>(`/api/users/${userId}`);
      return data.data;
    },
  });
};

export const useGetInterestsQuery = () => {
  return useQuery({
    queryKey: ['myInterests'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { interests: string[] } }>('/api/users/interests');
      return data.data.interests;
    },
  });
};

export const useFollowersQuery = (userId: string) => {
  return useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { followers: BasicUser[] } }>(`/api/users/${userId}/followers`);
      return data.data.followers;
    },
  });
};

export const useFollowingQuery = (userId: string) => {
  return useQuery({
    queryKey: ['following', userId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { following: BasicUser[] } }>(`/api/users/${userId}/following`);
      return data.data.following;
    },
  });
};

export const useFollowRequestsQuery = () => {
  return useQuery({
    queryKey: ['followRequests'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { requests: BasicUser[] } }>('/api/users/follow-requests');
      return data.data.requests;
    },
  });
};

export const useUserSearchQuery = (query: string) => {
  return useInfiniteQuery({
    queryKey: ['userSearch', query],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const { data } = await apiClient.get<{ data: { users: BasicUser[]; total: number; page: number; limit: number } }>(
        '/api/users/search',
        { params: { q: query, page: pageParam, limit: 20 } }
      );
      return data.data;
    },
    getNextPageParam: (lastPage) => {
      const maxPages = Math.ceil(lastPage.total / lastPage.limit);
      return lastPage.page < maxPages ? lastPage.page + 1 : undefined;
    },
    enabled: query.length > 0,
  });
};

// ==========================================
// MUTATIONS
// ==========================================

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const token = useAuthStore.getState().accessToken;
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://glunity.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || 'Failed to update profile');
      }
      return json.data;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['myProfile'], (old: any) => ({
        ...old,
        ...updatedProfile,
      }));
      // We might also want to invalidate to fetch fresh posts if needed, but the profile data is updated
    },
  });
};

export const useSaveInterestsMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (interests: string[]) => {
      const { data } = await apiClient.post<{ data: { interests: string[] } }>('/api/users/interests', { interests });
      return data.data.interests;
    },
    onSuccess: (updatedInterests) => {
      queryClient.setQueryData(['myInterests'], updatedInterests);
    },
  });
};

export const useFollowMutation = (userId: string, isPrivate: boolean) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`/api/users/${userId}/follow`);
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['userProfile', userId] });
      const previousProfile = queryClient.getQueryData(['userProfile', userId]);
      
      const newStatus: FollowStatus = isPrivate ? 'pending' : 'following';

      queryClient.setQueryData(['userProfile', userId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          followStatus: newStatus,
          // Optimistically bump follower count if public
          followerCount: !isPrivate ? old.followerCount + 1 : old.followerCount,
        };
      });

      return { previousProfile };
    },
    onError: (err, variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['userProfile', userId], context.previousProfile);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
    }
  });
};

export const useUnfollowMutation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete(`/api/users/${userId}/follow`);
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['userProfile', userId] });
      const previousProfile = queryClient.getQueryData<UserProfile>(['userProfile', userId]);
      
      queryClient.setQueryData(['userProfile', userId], (old: any) => {
        if (!old) return old;
        const wasFollowing = old.followStatus === 'following';
        return {
          ...old,
          followStatus: 'none',
          followerCount: wasFollowing ? Math.max(0, old.followerCount - 1) : old.followerCount,
        };
      });

      return { previousProfile };
    },
    onError: (err, variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['userProfile', userId], context.previousProfile);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
    }
  });
};

export const useAcceptRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requesterId: string) => {
      await apiClient.patch(`/api/users/follow-requests/${requesterId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followRequests'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

export const useRejectRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requesterId: string) => {
      await apiClient.patch(`/api/users/follow-requests/${requesterId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followRequests'] });
    },
  });
};
