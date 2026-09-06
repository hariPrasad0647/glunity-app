import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, Text, Switch, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigation/RootNavigator';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { ChevronLeft, Camera } from 'lucide-react-native';
import { useUpdateProfileMutation, UserProfile, useGetInterestsQuery } from '~/queries/profile/profileQueries';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '~/components/common/Button';
import { Avatar } from '~/components/common/Avatar';
import { useVideoPlayer, VideoView } from 'expo-video';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export function EditProfileScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const initialProfile = route.params.profile;

  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [username, setUsername] = useState(initialProfile.username);
  const [bio, setBio] = useState(initialProfile.bio || '');
  const [profession, setProfession] = useState(initialProfile.profession || '');
  const [isPrivate, setIsPrivate] = useState(initialProfile.isPrivate);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [localBannerUri, setLocalBannerUri] = useState<string | null>(null);
  const [localBannerType, setLocalBannerType] = useState<'image' | 'video' | null>(null);

  const updateMutation = useUpdateProfileMutation();
  const { data: interestsData, isLoading: interestsLoading } = useGetInterestsQuery();

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to update your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setLocalImageUri(result.assets[0].uri);
    }
  };

  const handlePickBanner = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to update your banner.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.type === 'video' && asset.duration && asset.duration > 15000) {
        Alert.alert('Invalid Video', 'Banner video must be 15 seconds or less.');
        return;
      }
      setLocalBannerUri(asset.uri);
      setLocalBannerType(asset.type === 'video' ? 'video' : 'image');
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      let hasChanges = false;
      
      if (fullName !== initialProfile.fullName) { formData.append('fullName', fullName); hasChanges = true; }
      if (username !== initialProfile.username) { formData.append('username', username); hasChanges = true; }
      if (bio !== initialProfile.bio && bio !== '') { formData.append('bio', bio); hasChanges = true; }
      if (profession !== initialProfile.profession && profession !== '') { formData.append('profession', profession); hasChanges = true; }
      if (isPrivate !== initialProfile.isPrivate) { formData.append('isPrivate', String(isPrivate)); hasChanges = true; }

      if (localImageUri) {
        hasChanges = true;
        // Simple filename extraction for RN FormData
        const filename = localImageUri.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('profileImage', {
          uri: Platform.OS === 'ios' ? localImageUri.replace('file://', '') : localImageUri,
          name: filename,
          type,
        } as any);
      }

      if (localBannerUri) {
        hasChanges = true;
        const filename = localBannerUri.split('/').pop() || (localBannerType === 'video' ? 'banner.mp4' : 'banner.jpg');
        const match = /\.(\w+)$/.exec(filename);
        let type = match ? `${localBannerType}/${match[1]}` : `${localBannerType}/jpeg`;
        if (localBannerType === 'video' && !match) type = 'video/mp4';

        formData.append('banner', {
          uri: Platform.OS === 'ios' ? localBannerUri.replace('file://', '') : localBannerUri,
          name: filename,
          type,
        } as any);
      }

      if (!hasChanges) {
        navigation.goBack();
        return;
      }

      await updateMutation.mutateAsync(formData);
      navigation.goBack();
    } catch (e: any) {
      console.error(e);
      Alert.alert('Update Failed', e?.response?.data?.message || e?.message || 'Could not update profile');
    }
  };

  const displayImage = localImageUri || initialProfile.profileImage;
  const displayBannerImage = localBannerType === 'image' ? localBannerUri : (!localBannerUri ? initialProfile.bannerImage : null);
  const displayBannerVideo = localBannerType === 'video' ? localBannerUri : (!localBannerUri ? initialProfile.bannerVideo : null);

  const player = useVideoPlayer(displayBannerVideo || '', (player) => {
    player.loop = true;
    player.muted = true;
    if (displayBannerVideo) player.play();
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      >
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <ChevronLeft size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Edit Profile</Text>
          <Button 
            title="Save"
            onPress={handleSave}
            loading={updateMutation.isPending}
            disabled={updateMutation.isPending || !username || !fullName}
            style={styles.saveBtn}
          />
        </View>

        <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.bannerSection}>
            <TouchableOpacity onPress={handlePickBanner} style={styles.bannerWrapper}>
              {displayBannerVideo ? (
                <VideoView 
                  player={player} 
                  style={styles.banner} 
                  nativeControls={false}
                  contentFit="cover"
                />
              ) : displayBannerImage ? (
                <Image source={{ uri: displayBannerImage }} style={styles.banner} />
              ) : (
                <View style={[styles.banner, styles.bannerPlaceholder, { backgroundColor: theme.surfaceSecondary }]} />
              )}
              <View style={[styles.bannerCameraBadge, { backgroundColor: theme.primary }]}>
                <Camera size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrapper}>
              <Avatar uri={displayImage} size={96} style={{ borderColor: theme.border, borderWidth: 1 }} />
              <View style={[styles.cameraBadge, { backgroundColor: theme.primary }]}>
                <Camera size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Name</Text>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderBottomColor: theme.border }]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Username</Text>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderBottomColor: theme.border }]}
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              autoCapitalize="none"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Bio</Text>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderBottomColor: theme.border }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Write a little about yourself"
              multiline
              maxLength={160}
              placeholderTextColor={theme.textSecondary}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Profession</Text>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, borderBottomColor: theme.border }]}
              value={profession}
              onChangeText={setProfession}
              placeholder="e.g. Web Developer"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <TouchableOpacity 
            style={[styles.interestsGroup, { borderTopColor: theme.border, borderBottomColor: theme.border }]}
            onPress={() => navigation.navigate('Interests')}
          >
            <View>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Interests</Text>
              <Text style={[styles.input, { color: theme.textPrimary, borderBottomWidth: 0, paddingVertical: 4 }]}>
                {interestsLoading ? 'Loading...' : (interestsData?.length ? `${interestsData.length} selected` : 'Select interests')}
              </Text>
            </View>
            <ChevronLeft size={20} color={theme.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>

          <View style={[styles.switchGroup, { borderTopColor: theme.border }]}>
            <View>
              <Text style={[styles.switchTitle, { color: theme.textPrimary }]}>Private Account</Text>
              <Text style={[styles.switchDesc, { color: theme.textSecondary }]}>
                When your account is private, only people you approve can see your photos and videos.
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: theme.surfaceSecondary, true: theme.primary }}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: { padding: 8, width: 40 },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  saveBtn: {
    height: 32,
    paddingVertical: 0,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  scrollContent: {
    flex: 1,
  },
  bannerSection: {
    width: '100%',
  },
  bannerWrapper: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: 120,
  },
  bannerPlaceholder: {
    width: '100%',
    height: 120,
  },
  bannerCameraBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -48,
    marginBottom: spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  formGroup: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    fontSize: typography.sizes.md,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  interestsGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.lg,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  switchTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  switchDesc: {
    fontSize: typography.sizes.sm,
    maxWidth: '85%',
    lineHeight: 18,
  },
});
