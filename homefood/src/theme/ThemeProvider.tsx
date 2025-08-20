import React, { ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeProvider as NavigationThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';

interface Props {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: Props) => {
  const colorScheme = useColorScheme();
  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {children}
    </NavigationThemeProvider>
  );
};
