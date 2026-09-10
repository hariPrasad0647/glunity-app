import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, Image, View, SafeAreaView, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useMediaStore } from '~/store/mediaStore';

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

export function GlobalMediaViewer() {
  const { isVisible, mediaUrl, mediaType, variant, closeMedia } = useMediaStore();

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
      <View style={styles.overlay}>
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
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
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
  },
  postMedia: {
    width: width,
    height: height * 0.8,
  },
  avatarMedia: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: 24,
  }
});
