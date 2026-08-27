import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from '~/navigation/RootNavigator';
import { AppQueryProvider } from '~/api/QueryProvider';
import { useTheme } from '~/hooks/useTheme';

export default function App() {
  const { isDarkMode } = useTheme();

  return (
    <SafeAreaProvider>
      <AppQueryProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      </AppQueryProvider>
    </SafeAreaProvider>
  );
}
