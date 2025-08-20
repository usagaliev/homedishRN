import { useSelector } from 'react-redux';
import { useRouter, Slot } from 'expo-router';
import { useEffect } from 'react';
import { RootState } from '../../src/store';

export default function PublicLayout() {
  const user = useSelector((s: RootState) => s.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user]);

  return <Slot />;
}
