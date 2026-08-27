import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const IS_WEB = Platform.OS === 'web';

export async function saveSecureItem(key: string, value: string): Promise<void> {
  if (IS_WEB) {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export async function getSecureItem(key: string): Promise<string | null> {
  if (IS_WEB) {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

export async function deleteSecureItem(key: string): Promise<void> {
  if (IS_WEB) {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}
