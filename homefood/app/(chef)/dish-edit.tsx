import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { dishSchema } from '../../src/utils/validators';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageAsync } from '../../src/services/storage';
import { addDocument, getDocument, setDocument } from '../../src/services/db';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';

const categories = [
  { label: 'Супы', value: 'soup' },
  { label: 'Выпечка', value: 'bakery' },
  { label: 'Основные', value: 'main' },
  { label: 'Салаты', value: 'salad' },
  { label: 'Веган', value: 'vegan' },
  { label: 'Другое', value: 'other' },
];

export default function DishEditScreen() {
  const { dishId } = useLocalSearchParams();
  const isEdit = !!dishId;
  const user = useSelector((s: RootState) => s.auth.user);
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(dishSchema),
    defaultValues: { title: '', description: '', price: '', category: 'soup', photoURL: '', availableQty: '' },
  });

  useEffect(() => {
    if (isEdit && dishId) {
      (async () => {
        const data = await getDocument(`dishes/${dishId}`);
        if (data) {
          setValue('title', data.title);
          setValue('description', data.description);
          setValue('price', String(data.price));
          setValue('category', data.category);
          setValue('photoURL', data.photoURL);
          setValue('availableQty', String(data.availableQty));
          setImage(data.photoURL);
        }
      })();
    }
  }, [isEdit, dishId, setValue]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      setValue('photoURL', result.assets[0].uri, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: any) => {
    if (!user) {
      Alert.alert('Ошибка', 'Войдите в аккаунт');
      return;
    }
    try {
      setUploading(true);
      let photoURL = values.photoURL;
      if (image && image !== values.photoURL) {
        photoURL = await uploadImageAsync(image, `dishes/${user.id}_${Date.now()}.jpg`);
      }
      const dish = {
        chefId: user.id,
        title: values.title,
        description: values.description,
        price: Number(values.price),
        category: values.category,
        photoURL,
        availableQty: Number(values.availableQty),
        status: 'active',
        location: user.location || null,
        updatedAt: Date.now(),
        createdAt: isEdit ? undefined : Date.now(),
      };
      if (isEdit && dishId) {
        await setDocument(`dishes/${dishId}`, { ...dish, createdAt: undefined });
        Alert.alert('Успех', 'Блюдо обновлено');
      } else {
        await addDocument('dishes', dish);
        Alert.alert('Успех', 'Блюдо добавлено');
      }
      router.replace('/(chef)/dishes');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Не удалось сохранить блюдо');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isEdit ? 'Редактировать блюдо' : 'Новое блюдо'}</Text>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Название" value={value} onChangeText={onChange} />
        )}
      />
      {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Описание" value={value} onChangeText={onChange} multiline />
        )}
      />
      {errors.description && <Text style={styles.error}>{errors.description.message}</Text>}
      <Controller
        control={control}
        name="price"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Цена" value={String(value)} onChangeText={onChange} keyboardType="numeric" />
        )}
      />
      {errors.price && <Text style={styles.error}>{errors.price.message}</Text>}
      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => (
          <View style={styles.pickerWrap}>
            <Text style={styles.label}>Категория:</Text>
            <View style={styles.pickerRow}>
              {categories.map(c => (
                <Button key={c.value} title={c.label} color={value === c.value ? '#0a7ea4' : '#ccc'} onPress={() => onChange(c.value)} />
              ))}
            </View>
          </View>
        )}
      />
      {errors.category && <Text style={styles.error}>{errors.category.message}</Text>}
      <View style={styles.imageWrap}>
        {image ? <Image source={{ uri: image }} style={styles.image} /> : null}
        <Button title={image ? 'Заменить фото' : 'Загрузить фото'} onPress={pickImage} />
      </View>
      {errors.photoURL && <Text style={styles.error}>{errors.photoURL.message}</Text>}
      <Controller
        control={control}
        name="availableQty"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Доступно порций" value={String(value)} onChangeText={onChange} keyboardType="numeric" />
        )}
      />
      {errors.availableQty && <Text style={styles.error}>{errors.availableQty.message}</Text>}
      <Button title={uploading || isSubmitting ? 'Сохраняем...' : isEdit ? 'Сохранить' : 'Добавить'} onPress={handleSubmit(onSubmit)} disabled={uploading || isSubmitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
  pickerWrap: {
    marginBottom: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  imageWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
});
