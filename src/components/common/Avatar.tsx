import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle, Text, TouchableWithoutFeedback } from 'react-native';
import { User } from 'lucide-react-native';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';
import { useMediaStore } from '~/store/mediaStore';

interface AvatarProps {
  uri?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ uri, size = 48, style }: AvatarProps) {
  const { theme } = useTheme();
  const { openMedia } = useMediaStore();

  const handlePress = () => {
    if (uri) {
      openMedia(uri, 'image', 'avatar');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View 
        style={[
          styles.container, 
          { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.surfaceSecondary },
          style
        ]}
      >
        {uri ? (
          <Image 
            source={{ uri }} 
            style={{ width: size, height: size, borderRadius: size / 2 }} 
          />
        ) : (
          <User size={size * 0.6} color={theme.textSecondary} />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  }
});
