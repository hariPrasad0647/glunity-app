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
  /** Client-only flag to identify optimistic messages */
  _isOptimistic?: boolean;
}

export interface Conversation {
  conversationId: string;
  otherUser: ChatUser;
  lastMessage: ChatMessage | null;
  lastReadAt: string;
}

export const useConversationsQuery = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Conversation[] }>('/api/chat/conversations');
      return data.data;
    },
    // Always refetch when the screen mounts so the list is never stale
    refetchOnMount: true,
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
    // Always refetch the first page when navigating back to the chat
    refetchOnMount: true,
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

/**
 * Helper: append a message to the last page of the infinite query cache.
 * New messages belong at the END of the last page (newest batch).
 */
export function appendMessageToCache(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  message: ChatMessage,
) {
  queryClient.setQueryData(['chatMessages', conversationId], (oldData: any) => {
    if (!oldData) {
      return { pages: [[message]], pageParams: [undefined] };
    }

    // Check for duplicates across all pages
    const exists = oldData.pages.some((page: ChatMessage[]) =>
      page.some((m: ChatMessage) => m.id === message.id)
    );
    if (exists) return oldData;

    const newPages = oldData.pages.map((page: ChatMessage[], index: number) => {
      if (index === oldData.pages.length - 1) {
        // Append to the last page (the most recent batch)
        return [...page, message];
      }
      return page;
    });
    return { ...oldData, pages: newPages };
  });
}

/**
 * Helper: remove a temporary (optimistic) message by its temp ID,
 * used when the real server message arrives or on send failure.
 */
export function removeTempMessageFromCache(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  tempId: string,
) {
  queryClient.setQueryData(['chatMessages', conversationId], (oldData: any) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      pages: oldData.pages.map((page: ChatMessage[]) =>
        page.filter((m: ChatMessage) => m.id !== tempId)
      ),
    };
  });
}
