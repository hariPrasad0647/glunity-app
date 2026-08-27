import React, { useState } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigation/RootNavigator';
import { X } from 'lucide-react-native';
import { useCreatePostMutation } from '~/queries/post/postQueries';
import { Button } from '~/components/common/Button';
import { typography } from '~/theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ComposePost'>;

export function ComposePostScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  
  const createPost = useCreatePostMutation();

  const handlePost = async () => {
    if (!content.trim()) return;
    try {
      await createPost.mutateAsync(content);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create post:', error);
      // In a real app, show a toast or alert here
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <X size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Button 
            title="Post"
            onPress={handlePost}
            disabled={!content.trim() || createPost.isPending}
            loading={createPost.isPending}
            style={styles.postButton}
          />
        </View>

        <View style={styles.content}>
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
    paddingHorizontal: 20,
    borderRadius: 18,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.lg,
    lineHeight: 28,
  },
});
