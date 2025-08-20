import { useSelector } from 'react-redux';
import { useRouter, Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { RootState } from '../../src/store';

export default function ChefLayout() {
  const user = useSelector((s: RootState) => s.auth.user);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.replace('/(auth)/login');
    }
  }, [mounted, user]);

  return <Slot />;
}