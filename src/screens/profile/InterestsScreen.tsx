import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigation/RootNavigator';
import { useTheme } from '~/hooks/useTheme';
import { typography } from '~/theme/typography';
import { spacing } from '~/theme/spacing';
import { ChevronLeft } from 'lucide-react-native';
import { useGetInterestsQuery, useSaveInterestsMutation } from '~/queries/profile/profileQueries';
import { Button } from '~/components/common/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Interests'>;

const AVAILABLE_INTERESTS = [
  "Technology", "Sports", "Music", "Art", "Travel", 
  "Gaming", "Photography", "Fashion", "Food", "Fitness", 
  "Reading", "Movies", "Science", "History", "Nature", 
  "Business", "Finance", "Politics", "DIY", "Pets"
];

export function InterestsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  
  const { data: currentInterests, isLoading } = useGetInterestsQuery();
  const saveMutation = useSaveInterestsMutation();
  
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  useEffect(() => {
    if (currentInterests) {
      setSelectedInterests(currentInterests);
    }
  }, [currentInterests]);
  
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else {
      setSelectedInterests(prev => [...prev, interest]);
    }
  };
  
  const handleSave = async () => {
    if (selectedInterests.length < 5) {
      Alert.alert('Selection Required', 'Please select at least 5 interests.');
      return;
    }
    
    try {
      await saveMutation.mutateAsync(selectedInterests);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to save interests');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Your Interests</Text>
        <View style={styles.placeholderBtn} />
      </View>
      
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Select at least 5 interests to help us personalize your feed. You have selected {selectedInterests.length}.
        </Text>
        
        <View style={styles.chipsContainer}>
          {AVAILABLE_INTERESTS.map(interest => {
            const isSelected = selectedInterests.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.chip,
                  { 
                    backgroundColor: isSelected ? theme.primary : theme.surfaceSecondary,
                    borderColor: isSelected ? theme.primary : theme.border,
                  }
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text 
                  style={[
                    styles.chipText, 
                    { color: isSelected ? '#fff' : theme.textPrimary }
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Button 
          title="Save Interests"
          onPress={handleSave}
          loading={saveMutation.isPending}
          disabled={selectedInterests.length < 5 || saveMutation.isPending}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: { padding: 8, width: 40 },
  placeholderBtn: { width: 40 },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: spacing.xl,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
  },
  footer: {
    padding: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
  }
});
