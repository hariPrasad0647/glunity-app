import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SectionList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigation/RootNavigator';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { ChevronLeft, Search } from 'lucide-react-native';
import { useConversationsQuery, useChatSearchQuery, Conversation, ChatUser } from '~/queries/chat/chatQueries';
import { Avatar } from '~/components/common/Avatar';
import { useAuthStore } from '~/store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatList'>;

export function ChatListScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const currentUserId = useAuthStore(state => state.user?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = searchQuery.trim(); // In a real app, debounce this

  const { data: conversations = [], isLoading: isLoadingConversations } = useConversationsQuery();
  const { data: searchResults, isLoading: isSearching } = useChatSearchQuery(debouncedQuery);

  const renderConversation = ({ item }: { item: Conversation }) => {
    // Check if there are unread messages. 
    // If the last message is from the other user and newer than lastReadAt
    const isUnread = item.lastMessage && 
                     item.lastMessage.senderId !== currentUserId && 
                     (!item.lastReadAt || new Date(item.lastMessage.createdAt) > new Date(item.lastReadAt));

    const subtitle = item.lastMessage 
      ? (item.lastMessage.isDeleted ? 'Message deleted' : item.lastMessage.content || (item.lastMessage.media.length > 0 ? 'Sent an attachment' : 'New message'))
      : 'Start a conversation';

    return (
      <TouchableOpacity 
        style={[styles.row, { borderBottomColor: theme.border }]}
        onPress={() => navigation.push('ChatRoom', { 
          conversationId: item.conversationId, 
          recipientId: item.otherUser.id,
          recipientUsername: item.otherUser.username
        })}
      >
        <Avatar uri={item.otherUser.profileImage} size={48} />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={[styles.fullName, { color: theme.textPrimary }]} numberOfLines={1}>
              {item.otherUser.fullName}
            </Text>
            {item.lastMessage && (
              <Text style={[styles.time, { color: theme.textSecondary }]}>
                {new Date(item.lastMessage.createdAt).toLocaleDateString()}
              </Text>
            )}
          </View>
          <View style={styles.subtitleRow}>
            <Text 
              style={[
                styles.subtitle, 
                { color: isUnread ? theme.textPrimary : theme.textSecondary },
                isUnread && { fontWeight: '700' }
              ]} 
              numberOfLines={1}
            >
              {subtitle}
            </Text>
            {isUnread && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSearchFriend = ({ item }: { item: ChatUser }) => (
    <TouchableOpacity 
      style={[styles.row, { borderBottomColor: theme.border }]}
      onPress={() => navigation.push('ChatRoom', { 
        conversationId: item.conversationId, // Passing conversationId if one exists
        recipientId: item.id,
        recipientUsername: item.username
      })}
    >
      <Avatar uri={item.profileImage} size={48} />
      <View style={styles.content}>
        <Text style={[styles.fullName, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.fullName}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
          @{item.username}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const searchSections = [];
  if (searchResults) {
    if (searchResults.conversations && searchResults.conversations.length > 0) {
      searchSections.push({
        title: 'Recent Conversations',
        data: searchResults.conversations,
        isConversation: true
      });
    }

    const filteredFriends = searchResults.friends?.filter(f => !searchResults.conversations?.some(c => c.otherUser?.id === f.id)) || [];
    if (filteredFriends.length > 0) {
      searchSections.push({
        title: 'Mutual Friends',
        data: filteredFriends,
        isConversation: false
      });
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Messages</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchInputWrapper, { backgroundColor: theme.surfaceSecondary }]}>
          <Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search messages or friends..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {debouncedQuery ? (
        isSearching ? (
          <ActivityIndicator style={styles.loader} color={theme.primary} />
        ) : searchSections.length > 0 ? (
          <SectionList
            sections={searchSections}
            keyExtractor={item => item.id || item.conversationId}
            renderItem={({ item, section }) => section.isConversation ? renderConversation({ item }) : renderSearchFriend({ item })}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={[styles.sectionHeader, { color: theme.textSecondary, backgroundColor: theme.surfaceSecondary }]}>
                {title}
              </Text>
            )}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No matching conversations or friends found.</Text>
        )
      ) : (
        isLoadingConversations ? (
          <ActivityIndicator style={styles.loader} color={theme.primary} />
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={item => item.conversationId}
            renderItem={renderConversation}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No messages yet. Start a conversation!</Text>
            }
          />
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
  },
  searchContainer: {
    padding: 12,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
  },
  loader: {
    marginTop: 24,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: typography.sizes.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fullName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: typography.sizes.sm,
  },
  subtitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.md,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  }
});
