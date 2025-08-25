import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TextInput, Button, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDocument, addDocument } from '../../src/services/db';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { orderSchema } from '../../src/utils/validators';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';

const deliveryTypes = [
  { label: 'Самовывоз', value: 'pickup' },
  { label: 'Доставка', value: 'delivery' },
];

export default function DishDetailScreen() {
  const { dishId } = useLocalSearchParams();
  const [dish, setDish] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const user = useSelector((s: RootState) => s.auth.user);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(orderSchema),
    defaultValues: { qty: 1, deliveryType: 'pickup', note: '' },
  });

  useEffect(() => {
    const fetchDish = async () => {
      setLoading(true);
      const data = await getDocument(`dishes/${dishId}`);
      setDish(data);
      setLoading(false);
    };
    fetchDish();
  }, [dishId]);

  const onSubmit = async (values: any) => {
    if (!user) {
      Alert.alert('Ошибка', 'Войдите в аккаунт');
      return;
    }
    try {
      const order = {
        dishId,
        chefId: dish.chefId,
        buyerId: user.id,
        qty: values.qty,
        unitPrice: dish.price,
        totalPrice: dish.price * values.qty,
        note: values.note,
        deliveryType: values.deliveryType,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const orderId = await addDocument('orders', order);
      router.replace(`/order/${orderId}`);
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Не удалось создать заказ');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#0a7ea4" />;
  if (!dish) return <Text style={styles.error}>Блюдо не найдено</Text>;
  if (dish.status !== 'active') {
    return (
      <View style={styles.container}>
        <Image source={{ uri: dish.photoURL }} style={styles.image} />
        <Text style={styles.title}>{dish.title}</Text>
        <Text style={styles.error}>Это блюдо временно недоступно для заказа</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Image source={{ uri: dish.photoURL }} style={styles.image} />
        <Text style={styles.title}>{dish.title}</Text>
        <Text style={styles.price}>{dish.price} ₽</Text>
        <Text style={styles.category}>{dish.category}</Text>
        <Text style={styles.desc}>{dish.description}</Text>
        <Text style={styles.label}>Заказать</Text>
        <Controller
          control={control}
          name="qty"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Количество"
              keyboardType="numeric"
              value={String(value)}
              onChangeText={v => onChange(Number(v.replace(/[^0-9]/g, '')))}
            />
          )}
        />
        {errors.qty && <Text style={styles.error}>{errors.qty.message}</Text>}
        <Controller
          control={control}
          name="deliveryType"
          render={({ field: { onChange, value } }) => (
            <View style={styles.row}>
              {deliveryTypes.map(dt => (
                <Button
                  key={dt.value}
                  title={dt.label}
                  color={value === dt.value ? '#0a7ea4' : '#ccc'}
                  onPress={() => onChange(dt.value)}
                />
              ))}
            </View>
          )}
        />
        {errors.deliveryType && <Text style={styles.error}>{errors.deliveryType.message}</Text>}
        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Комментарий к заказу (необязательно)"
              value={value}
              onChangeText={onChange}
              multiline
            />
          )}
        />
        {errors.note && <Text style={styles.error}>{errors.note.message}</Text>}
        <Button title={isSubmitting ? 'Оформляем...' : 'Оформить заказ'} onPress={handleSubmit(onSubmit)} disabled={isSubmitting} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    color: '#0a7ea4',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  desc: {
    fontSize: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
});
