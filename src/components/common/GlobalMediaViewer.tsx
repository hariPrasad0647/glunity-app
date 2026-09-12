import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, Image, View, SafeAreaView, Dimensions, Text, Share, Alert } from 'react-native';
import { X, UserCheck, UserPlus, CircleUser, Link as LinkIcon, QrCode } from 'lucide-react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useMediaStore } from '~/store/mediaStore';
import * as Clipboard from 'expo-clipboard';
import { useFollowMutation, useUnfollowMutation } from '~/queries/profile/profileQueries';
import { typography } from '~/theme/typography';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const VideoContent = ({ url }: { url: string }) => {
  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
    p.play();
  });

  return (
    <VideoView 
      player={player} 
      style={styles.postMedia} 
      nativeControls={true}
      contentFit="contain"
    />
  );
};

const AvatarActions = ({ metadata }: { metadata: any }) => {
  const followMutation = useFollowMutation(metadata?.userId, metadata?.isPrivate || false);
  const unfollowMutation = useUnfollowMutation(metadata?.userId);
  
  const isFollowing = metadata?.followStatus === 'following';
  const isPending = metadata?.followStatus === 'pending';
  
  const handleFollowToggle = () => {
    if (isFollowing || isPending) {
      unfollowMutation.mutate();
      // Optimistically update the metadata status to reflect immediately in the UI if possible
      metadata.followStatus = 'none';
    } else {
      followMutation.mutate();
      metadata.followStatus = metadata.isPrivate ? 'pending' : 'following';
    }
  };

  const handleShare = async () => {
    try {
      const url = `https://glunity.com/${metadata?.username}`;
      await Share.share({
        message: `Check out ${metadata?.username}'s profile on Glunity: ${url}`,
        url: url,
      });
    } catch (error) {
      console.log('Error sharing profile', error);
    }
  };

  const handleCopyLink = async () => {
    const url = `https://glunity.com/${metadata?.username}`;
    await Clipboard.setStringAsync(url);
    Alert.alert('Link Copied', 'Profile link copied to clipboard.');
  };

  const handleQRCode = () => {
    Alert.alert('QR Code', 'QR Code feature coming soon!');
  };

  if (!metadata?.userId) return null;

  return (
    <View style={styles.actionsContainer}>
      <View style={styles.actionItem}>
        <TouchableOpacity style={styles.actionCircle} onPress={handleFollowToggle}>
          {isFollowing ? (
            <UserCheck size={24} color="#FFFFFF" />
          ) : (
            <UserPlus size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
        <Text style={styles.actionLabel}>{isFollowing ? 'Following' : 'Follow'}</Text>
      </View>

      <View style={styles.actionItem}>
        <TouchableOpacity style={styles.actionCircle} onPress={handleShare}>
          <CircleUser size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.actionLabel}>Share profile</Text>
      </View>

      <View style={styles.actionItem}>
        <TouchableOpacity style={styles.actionCircle} onPress={handleCopyLink}>
          <LinkIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.actionLabel}>Copy link</Text>
      </View>

      <View style={styles.actionItem}>
        <TouchableOpacity style={styles.actionCircle} onPress={handleQRCode}>
          <QrCode size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.actionLabel}>QR code</Text>
      </View>
    </View>
  );
};

export function GlobalMediaViewer() {
  const { isVisible, mediaUrl, mediaType, variant, metadata, closeMedia } = useMediaStore();

  if (!mediaUrl) return null;

  const isAvatar = variant === 'avatar';
  const mediaStyle = isAvatar ? styles.avatarMedia : styles.postMedia;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeMedia}
    >
      <BlurView intensity={80} tint="dark" style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={closeMedia} style={styles.closeBtn} hitSlop={{top: 20, right: 20, bottom: 20, left: 20}}>
              <X size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.contentContainer}>
            {mediaType === 'video' ? (
              <VideoContent url={mediaUrl} />
            ) : (
              <Image 
                source={{ uri: mediaUrl }} 
                style={mediaStyle} 
                resizeMode={isAvatar ? 'cover' : 'contain'} 
              />
            )}

            {isAvatar && <AvatarActions metadata={metadata} />}
          </View>
        </SafeAreaView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    zIndex: 10,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  postMedia: {
    width: width,
    height: height * 0.8,
  },
  avatarMedia: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: (width * 0.65) / 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    bottom: 60,
    paddingHorizontal: 20,
  },
  actionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  actionCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    fontWeight: '500',
  },
});
