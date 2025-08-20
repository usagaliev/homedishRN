import * as Notifications from 'expo-notifications';

export async function sendLocal(type: string, payload: any) {
  let title = '';
  let body = '';
  switch (type) {
    case 'new_order':
      title = 'Новый заказ';
      body = `Поступил новый заказ на блюдо: ${payload.dishTitle}`;
      break;
    case 'status_change':
      title = 'Статус заказа';
      body = `Статус заказа обновлён: ${payload.status}`;
      break;
    default:
      title = 'Уведомление';
      body = JSON.stringify(payload);
  }
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}
