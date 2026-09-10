import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://glunity.onrender.com';

export interface NotificationActor {
  id: string;
  username: string;
  fullName: string;
  profileImage: string | null;
}

export interface Notification {
  id: string;
  recipientId: string;
  actorId: string;
  type: 'FOLLOW' | 'LIKE' | 'COMMENT' | 'REPOST' | 'REPLY';
  message: string;
  entityId: string;
  entityType: 'USER' | 'POST' | 'REEL' | 'REPLY';
  postId: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  actor: NotificationActor;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useNotificationsQuery = () => {
  const token = useAuthStore(state => state.accessToken);

  return useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`${API_BASE_URL}/api/notifications?page=${pageParam}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const json = await response.json();
      return json.data as NotificationsResponse;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!token,
  });
};

export const useUnreadNotificationCountQuery = () => {
  const token = useAuthStore(state => state.accessToken);

  return useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch unread count');
      const json = await response.json();
      return json.data.count as number;
    },
    enabled: !!token,
    refetchInterval: 30000, // Refetch every 30s
  });
};

export const useMarkNotificationReadMutation = () => {
  const token = useAuthStore(state => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};

export const useMarkAllNotificationsReadMutation = () => {
  const token = useAuthStore(state => state.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};
