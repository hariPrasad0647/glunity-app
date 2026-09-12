import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, FlatList, TouchableOpacity, RefreshControl, Dimensions, Modal, LayoutAnimation, UIManager, Platform, ScrollView } from 'react-native';
import Animated, { SlideInRight, SlideInLeft, FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { FlingGestureHandler, Directions, State } from 'react-native-gesture-handler';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigation/RootNavigator';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { ChevronLeft, MoreHorizontal, Settings, Link2, Lock, Shield, X, UserPlus, Grid, Repeat } from 'lucide-react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { PostCard } from '~/components/feed/PostCard';
import { 
  useMyProfileQuery, 
  useUserProfileQuery, 
  useFollowMutation, 
  useUnfollowMutation 
} from '~/queries/profile/profileQueries';
import { useUserPostsQuery, useUserRepostsQuery, usePostDetailQuery } from '~/queries/post/postQueries';
import { Avatar } from '~/components/common/Avatar';
import { ProfileHeaderSkeleton, PostSkeleton } from '~/components/common/Skeletons';
import { Button } from '~/components/common/Button';
import { useAuthStore } from '~/store/authStore';
import { getTierColor } from '~/theme/trustScoreTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const { width } = Dimensions.get('window');

const PostItem = React.memo(({ post, index, navigation, slideDirection }: any) => {
  const entering = slideDirection === 'left' 
    ? SlideInRight.duration(250)
    : SlideInLeft.duration(250);
    
  return (
    <Animated.View entering={entering}>
      <PostCard 
        post={post} 
        onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
        onReply={() => navigation.navigate('PostDetail', { postId: post.id })}
      />
    </Animated.View>
  );
});

const RepostItem = React.memo(({ post, index, navigation, slideDirection }: any) => {
  const { data: fullPost } = usePostDetailQuery(post.id);
  // Merge list data and detail data to prevent losing context (like hasReposted)
  const displayPost = fullPost ? { ...post, ...fullPost, hasReposted: post.hasReposted } : post;

  const entering = slideDirection === 'left' 
    ? SlideInRight.duration(250)
    : SlideInLeft.duration(250);

  return (
    <Animated.View entering={entering}>
      <PostCard 
        post={displayPost} 
        onPress={() => navigation.navigate('PostDetail', { postId: displayPost.id })}
        onReply={() => navigation.navigate('PostDetail', { postId: displayPost.id })}
      />
    </Animated.View>
  );
});


export function ProfileScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const currentUserId = useAuthStore(state => state.user?.id);
  const [isBannerModalVisible, setIsBannerModalVisible] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'posts' | 'reposts'>('posts');
  const [slideDirection, setSlideDirection] = React.useState<'left' | 'right'>('left');
  
  const tabIndicatorPosition = useSharedValue(0);

  React.useEffect(() => {
    tabIndicatorPosition.value = withSpring(activeTab === 'posts' ? 0 : width / 2, {
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    });
  }, [activeTab]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabIndicatorPosition.value }],
    };
  });
  
  // If no userId is passed, or if it matches the current user's ID
  const userId = route.params?.userId;
  const isOwnProfile = !userId || userId === currentUserId;

  const myProfileQuery = useMyProfileQuery();
  const userProfileQuery = useUserProfileQuery(userId as string);
  
  const query = isOwnProfile ? myProfileQuery : userProfileQuery;
  const { data: profile, isLoading, isError, refetch } = query;

  // We only fetch posts explicitly if it's NOT our own profile, 
  // or if we want to rely on the dedicated post query. 
  // Let's rely on the dedicated `useUserPostsQuery` for infinite scrolling for both.
  const targetId = isOwnProfile ? profile?.id : userId;
  const { 
    data: postsData, 
    fetchNextPage: fetchNextPostsPage, 
    hasNextPage: hasNextPostsPage, 
    isFetchingNextPage: isFetchingNextPostsPage,
    refetch: refetchPosts,
    isRefetching: isRefetchingPosts
  } = useUserPostsQuery(targetId || '');

  const {
    data: repostsData,
    fetchNextPage: fetchNextRepostsPage,
    hasNextPage: hasNextRepostsPage,
    isFetchingNextPage: isFetchingNextRepostsPage,
    refetch: refetchReposts,
    isRefetching: isRefetchingReposts
  } = useUserRepostsQuery(targetId || '');

  const followMutation = useFollowMutation(userId as string, profile?.isPrivate || false);
  const unfollowMutation = useUnfollowMutation(userId as string);

  const handleRefresh = useCallback(() => {
    refetch();
    refetchPosts();
    refetchReposts();
  }, [refetch, refetchPosts, refetchReposts]);

  const player = useVideoPlayer(profile?.bannerVideo || '', (player) => {
    player.loop = true;
    player.muted = true;
    if (profile?.bannerVideo) {
      player.play();
    }
  });

  useFocusEffect(
    useCallback(() => {
      // Refetch profile data to ensure it's fresh after navigating back from EditProfile
      refetch();
      
      // Ensure video plays when screen comes into focus
      if (profile?.bannerVideo) {
        player.play();
      }
    }, [refetch, player, profile?.bannerVideo])
  );

  const handleFollowAction = () => {
    if (!profile) return;
    
    if (profile.followStatus === 'none') {
      followMutation.mutate();
    } else {
      // both 'following' and 'pending' are cancelled by unfollow endpoint
      unfollowMutation.mutate();
    }
  };

  const renderHeader = () => {
    if (!profile) return null;

    const canViewContent = isOwnProfile || !profile.isPrivate || profile.followStatus === 'following';

    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => {
            if (profile.bannerVideo || profile.bannerImage) {
              setIsBannerModalVisible(true);
            }
          }}
        >
          {profile.bannerVideo ? (
            <VideoView 
              player={player} 
              style={styles.coverPhoto} 
              nativeControls={false}
              contentFit="cover"
            />
          ) : profile.bannerImage ? (
            <Image source={{ uri: profile.bannerImage }} style={styles.coverPhoto} />
          ) : (
            <View style={[styles.coverPhoto, { backgroundColor: theme.surfaceSecondary }]} />
          )}
        </TouchableOpacity>
        
        <View style={styles.profileInfoContainer}>
          <View style={styles.topRow}>
            <Avatar 
              uri={profile.profileImage} 
              size={72} 
              style={{ borderWidth: 3, borderColor: theme.background }} 
            />
            
            <View style={styles.actionRow}>
              {isOwnProfile ? (
                <Button 
                  title="Edit Profile" 
                  variant="outline"
                  onPress={() => navigation.navigate('EditProfile', { profile })}
                  style={styles.editButton}
                />
              ) : (
                <>
                  <Button 
                    title={profile.followStatus === 'following' ? 'Following' : profile.followStatus === 'pending' ? 'Requested' : 'Follow'} 
                    variant={profile.followStatus === 'none' ? 'primary' : 'outline'}
                    onPress={handleFollowAction}
                    loading={followMutation.isPending || unfollowMutation.isPending}
                    style={[styles.editButton, { flex: 1, marginRight: 8 }]}
                  />
                  <Button 
                    title="Message" 
                    variant="outline"
                    onPress={() => navigation.navigate('ChatRoom', { 
                      recipientId: profile.id, 
                      recipientUsername: profile.username 
                    })}
                    style={[styles.editButton, { flex: 1 }]}
                  />
                </>
              )}
            </View>
          </View>

          <View style={styles.nameBlock}>
            <Text style={[styles.fullName, { color: theme.textPrimary }]}>
              {profile.fullName}
              {profile.isPrivate && <Lock size={16} color={theme.textSecondary} style={{ marginLeft: 4 }} />}
            </Text>
            <Text style={[styles.username, { color: theme.textSecondary }]}>@{profile.username}</Text>
          </View>

          {!!profile.bio && (
            <Text style={[styles.bio, { color: theme.textPrimary }]}>{profile.bio}</Text>
          )}
          
          {!!profile.profession && (
            <Text style={[styles.profession, { color: theme.textSecondary }]}>{profile.profession}</Text>
          )}

          <View style={styles.statsRow}>
            <TouchableOpacity 
              style={styles.stat}
              onPress={() => canViewContent && navigation.navigate('FollowList', { userId: profile.id, initialTab: 'Following' })}
              disabled={!canViewContent}
            >
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{profile.followingCount}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Following</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.stat}
              onPress={() => canViewContent && navigation.navigate('FollowList', { userId: profile.id, initialTab: 'Followers' })}
              disabled={!canViewContent}
            >
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>{profile.followerCount}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Followers</Text>
            </TouchableOpacity>
          </View>

          {profile.trustScore !== undefined && (
            <TouchableOpacity 
              style={[styles.trustScoreBadge, { borderColor: getTierColor(profile.trustTier), backgroundColor: getTierColor(profile.trustTier) + '15' }]}
              onPress={() => navigation.navigate('TrustScore')}
            >
              <Shield size={16} color={getTierColor(profile.trustTier)} style={{ marginRight: 6 }} />
              <Text style={[styles.trustScoreValue, { color: theme.textPrimary }]}>{profile.trustScore}</Text>
              <Text style={[styles.trustScoreTier, { color: getTierColor(profile.trustTier) }]}>
                {profile.trustTier?.replace('_', ' ') || 'UNVERIFIED'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {!canViewContent && (
          <View style={[styles.privateContainer, { borderTopColor: theme.border }]}>
            <View style={[styles.lockCircle, { backgroundColor: theme.surfaceSecondary }]}>
              <Lock size={32} color={theme.textPrimary} />
            </View>
            <Text style={[styles.privateTitle, { color: theme.textPrimary }]}>This account is private</Text>
            <Text style={[styles.privateDesc, { color: theme.textSecondary }]}>Follow this account to see their posts and reels.</Text>
          </View>
        )}

        {canViewContent && (
          <View style={[styles.tabContainer, { borderBottomColor: theme.border }]}>
            <Animated.View 
              style={[
                styles.tabIndicator, 
                { backgroundColor: theme.primary },
                indicatorStyle
              ]} 
            />
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => {
                if (activeTab !== 'posts') {
                  setSlideDirection('right');
                  setActiveTab('posts');
                }
              }}
            >
              <Grid size={24} color={activeTab === 'posts' ? theme.textPrimary : theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => {
                if (activeTab !== 'reposts') {
                  setSlideDirection('left');
                  setActiveTab('reposts');
                }
              }}
            >
              <Repeat size={24} color={activeTab === 'reposts' ? theme.textPrimary : theme.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        <View style={[styles.navBar, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <ChevronLeft size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ProfileHeaderSkeleton />
          {Array.from({ length: 2 }).map((_, index) => (
            <PostSkeleton key={index} />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.danger }}>User not found.</Text>
      </View>
    );
  }

  const posts = postsData?.pages.flatMap(page => page.data.posts) || [];
  const reposts = repostsData?.pages.flatMap(page => page.data.posts) || [];
  
  const canViewContent = isOwnProfile || !profile.isPrivate || profile.followStatus === 'following';

  const activeData = activeTab === 'posts' ? posts : reposts;
  const isFetchingNext = activeTab === 'posts' ? isFetchingNextPostsPage : isFetchingNextRepostsPage;
  const hasNext = activeTab === 'posts' ? hasNextPostsPage : hasNextRepostsPage;
  const fetchNext = activeTab === 'posts' ? fetchNextPostsPage : fetchNextRepostsPage;
  const isRefetchingList = activeTab === 'posts' ? isRefetchingPosts : isRefetchingReposts;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <View style={[styles.navBar, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.textPrimary }]}>{profile.fullName}</Text>
        <View style={styles.headerActions}>
          {isOwnProfile ? (
            <>
              <TouchableOpacity onPress={() => navigation.navigate('FriendSuggestions')} style={styles.actionIcon}>
                <UserPlus size={20} color={theme.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.actionIcon}>
                <Settings size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.actionIcon}>
              <MoreHorizontal size={20} color={theme.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlingGestureHandler
        direction={Directions.LEFT}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.ACTIVE && activeTab === 'posts') {
            setSlideDirection('left');
            setActiveTab('reposts');
          }
        }}
      >
        <FlingGestureHandler
          direction={Directions.RIGHT}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE && activeTab === 'reposts') {
              setSlideDirection('right');
              setActiveTab('posts');
            }
          }}
        >
          <FlatList
            data={canViewContent ? activeData : []}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            ListHeaderComponent={renderHeader}
            renderItem={({ item, index }) => (
              activeTab === 'reposts' ? (
                <RepostItem post={item} index={index} navigation={navigation} slideDirection={slideDirection} />
              ) : (
                <PostItem post={item} index={index} navigation={navigation} slideDirection={slideDirection} />
              )
            )}
            refreshControl={
              <RefreshControl
                refreshing={query.isRefetching || isRefetchingList}
                onRefresh={handleRefresh}
                tintColor={theme.primary}
              />
            }
            onEndReached={() => {
              if (canViewContent && hasNext && !isFetchingNext) {
                fetchNext();
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNext ? (
                <ActivityIndicator style={{ margin: 16 }} color={theme.primary} />
              ) : null
            }
          />
        </FlingGestureHandler>
      </FlingGestureHandler>

      <Modal
        visible={isBannerModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsBannerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalCloseButton} 
            onPress={() => setIsBannerModalVisible(false)}
          >
            <X size={28} color="#FFF" />
          </TouchableOpacity>
          {profile.bannerVideo ? (
            <VideoView 
              player={player} 
              style={styles.modalMedia} 
              nativeControls={true}
              contentFit="contain"
            />
          ) : profile.bannerImage ? (
            <Image 
              source={{ uri: profile.bannerImage }} 
              style={styles.modalMedia} 
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
  iconBtn: { padding: 8, width: 40 },
  navTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    padding: 8,
  },
  headerContainer: {
    paddingBottom: spacing.md,
  },
  coverPhoto: {
    width: '100%',
    height: 120,
  },
  profileInfoContainer: {
    paddingHorizontal: spacing.md,
    marginTop: -36,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#000', // Need dynamic theme border color later
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#000',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 44,
  },
  editButton: {
    height: 32,
    paddingVertical: 0,
    paddingHorizontal: 16,
    borderRadius: 16,
    minWidth: 100,
  },
  nameBlock: {
    marginBottom: spacing.sm,
  },
  fullName: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    alignItems: 'center',
  },
  username: {
    fontSize: typography.sizes.md,
    marginTop: 2,
  },
  bio: {
    fontSize: typography.sizes.md,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  profession: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: spacing.lg,
  },
  statValue: {
    fontSize: typography.sizes.md,
    fontWeight: 'bold',
    marginRight: 4,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
  },
  privateContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xl,
  },
  lockCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  privateTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  privateDesc: {
    fontSize: typography.sizes.md,
  },
  trustScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  trustScoreValue: {
    fontSize: typography.sizes.md,
    fontWeight: 'bold',
    marginRight: 6,
  },
  trustScoreTier: {
    fontSize: typography.sizes.sm,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -StyleSheet.hairlineWidth,
    left: 0,
    width: '50%',
    height: 2,
    zIndex: 1,
  },
  tabText: {
    fontSize: typography.sizes.md,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  modalMedia: {
    width: '100%',
    height: '100%',
  }
});
