import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '~/api/client';

export interface ChatUser {
  id: string;
  username: string;
  profileImage: string | null;
  fullName: string;
}

export interface ChatMedia {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  thumbnailUrl: string | null;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  messageType: 'text' | 'story_reaction';
  storyId: string | null;
  reactionEmoji: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: ChatUser;
  media: ChatMedia[];
  replyToId?: string | null;
  replyTo?: {
    id: string;
    content: string | null;
    isDeleted: boolean;
    sender: ChatUser;
    media: ChatMedia[];
  };
}

export interface Conversation {
  conversationId: string;
  otherUser: ChatUser;
  lastMessage: ChatMessage | null;
  lastReadAt: string;
}

// Force Metro rebuild
export const useConversationsQuery = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Conversation[] }>('/api/chat/conversations');
      return data.data;
    },
  });
};

export const useChatMessagesQuery = (conversationId: string) => {
  return useInfiniteQuery({
    queryKey: ['chatMessages', conversationId],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const params: any = { limit: 30 };
      if (pageParam) {
        params.before = pageParam;
      }
      const { data } = await apiClient.get<{ data: ChatMessage[] }>(`/api/chat/conversations/${conversationId}/messages`, {
        params,
      });
      return data.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 30) return undefined; // No more pages
      return lastPage[0]?.createdAt; // The oldest message in the batch
    },
    enabled: !!conversationId,
  });
};

export const useChatSearchQuery = (query: string) => {
  return useQuery({
    queryKey: ['chatSearch', query],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { conversations: Conversation[], friends: ChatUser[] } }>('/api/chat/search', {
        params: { q: query },
      });
      return data.data;
    },
    enabled: query.trim().length > 0,
  });
};

export const useDeleteMessageMutation = (conversationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      await apiClient.delete(`/api/chat/messages/${messageId}`);
      return messageId;
    },
    onSuccess: (deletedMessageId) => {
      // Optimistically update the message history to mark as deleted
      queryClient.setQueryData(['chatMessages', conversationId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: ChatMessage[]) => 
            page.map((msg) => 
              msg.id === deletedMessageId ? { ...msg, isDeleted: true, content: null, media: [] } : msg
            )
          ),
        };
      });
      // Also invalidate to fetch fresh state if needed, though optimistic update is better
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
