import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from '~/navigation/RootNavigator';
import { AppQueryProvider } from '~/api/QueryProvider';
import { useTheme } from '~/hooks/useTheme';
import { GlobalMediaViewer } from '~/components/common/GlobalMediaViewer';

export default function App() {
  const { isDarkMode } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppQueryProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          <GlobalMediaViewer />
          <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        </AppQueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
