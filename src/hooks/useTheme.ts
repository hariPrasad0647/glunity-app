import { useThemeStore } from '~/store/themeStore';
import { colors } from '~/theme/colors';

export function useTheme() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;

  return {
    isDarkMode,
    theme,
  };
}
