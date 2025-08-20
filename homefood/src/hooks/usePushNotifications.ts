import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { getAuth } from 'firebase/auth';
import { setDocument } from '../services/db';

export function usePushNotifications() {
  useEffect(() => {
    (async () => {
      if (!Device.isDevice) return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const pushToken = tokenData.data;
      const user = getAuth().currentUser;
      if (user && pushToken) {
        await setDocument(`users/${user.uid}`, { pushToken }, { merge: true });
      }
    })();
  }, []);
}
