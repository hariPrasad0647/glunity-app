import React, { useState } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Text, ActivityIndicator, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigation/RootNavigator';
import { X, Image as ImageIcon, Video as VideoIcon } from 'lucide-react-native';
import { useCreatePostMutation } from '~/queries/post/postQueries';
import { Button } from '~/components/common/Button';
import { typography } from '~/theme/typography';
import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'ComposePost'>;

export function ComposePostScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<string[]>([]);
  
  const createPost = useCreatePostMutation();

  const handlePickImages = async () => {
    if (media.length >= 10) {
      Alert.alert('Limit Reached', 'You can only upload up to 10 media files.');
      return;
    }
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      selectionLimit: 10 - media.length,
      quality: 0.7,
    });

    if (!result.canceled && result.assets) {
      const newUris = result.assets.map(asset => asset.uri);
      setMedia(prev => [...prev, ...newUris].slice(0, 10));
    }
  };

  const removeImage = (indexToRemove: number) => {
    setMedia(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handlePost = async () => {
    if (!content.trim() && media.length === 0) return;
    try {
      await createPost.mutateAsync({ content, media });
      navigation.goBack();
    } catch (error: any) {
      console.error('Failed to create post:', error);
      Alert.alert('Post Failed', error.message || 'Could not create post');
    }
  };

  const isPostDisabled = (!content.trim() && media.length === 0) || createPost.isPending;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.container}
      >
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <X size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Button 
            title="Post"
            onPress={handlePost}
            disabled={isPostDisabled}
            loading={createPost.isPending}
            style={styles.postButton}
          />
        </View>

        <ScrollView style={styles.content}>
          <TextInput
            style={[styles.input, { color: theme.textPrimary }]}
            placeholder="What's happening?"
            placeholderTextColor={theme.textSecondary}
            multiline
            autoFocus
            maxLength={10000}
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />

          {media.length > 0 && (
            <ScrollView horizontal style={styles.imageScroll} showsHorizontalScrollIndicator={false}>
              {media.map((uri, index) => {
                const isVideo = uri.toLowerCase().match(/\.(mp4|mov|mkv|webm)$/);
                return (
                  <View key={index} style={styles.imageContainer}>
                    {isVideo ? (
                      <View style={[styles.previewImage, styles.videoPlaceholder, { backgroundColor: theme.surfaceSecondary }]}>
                        <VideoIcon size={32} color={theme.textSecondary} />
                        <Text style={[styles.videoText, { color: theme.textSecondary }]}>Video</Text>
                      </View>
                    ) : (
                      <Image source={{ uri }} style={styles.previewImage} />
                    )}
                    <TouchableOpacity 
                      style={styles.removeImageBtn} 
                      onPress={() => removeImage(index)}
                    >
                      <X size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </ScrollView>
        
        <View style={[styles.toolbar, { borderTopColor: theme.border }]}>
          <TouchableOpacity onPress={handlePickImages} style={styles.toolbarBtn}>
            <ImageIcon size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    padding: 8,
    marginLeft: -8,
  },
  postButton: {
    height: 36,
    paddingVertical: 0,
    paddingHorizontal: 20,
    borderRadius: 18,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    fontSize: typography.sizes.lg,
    lineHeight: 28,
    minHeight: 120,
  },
  imageScroll: {
    marginTop: 16,
    marginBottom: 16,
  },
  imageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toolbarBtn: {
    padding: 8,
    marginRight: 16,
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  }
});
