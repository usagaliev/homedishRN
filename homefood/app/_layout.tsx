import { Stack } from 'expo-router';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { store } from '../src/store';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { usePushNotifications } from '../src/hooks/usePushNotifications';
import { useAuthListener } from '../src/hooks/useAuthListener';

function Providers({ children }: { children: React.ReactNode }) {
  useAuthListener();
  usePushNotifications();
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <Providers>
        <ThemeProvider>
          <SafeAreaProvider>
            <Stack />
            <Toast />
          </SafeAreaProvider>
        </ThemeProvider>
      </Providers>
    </ReduxProvider>
  );
}
