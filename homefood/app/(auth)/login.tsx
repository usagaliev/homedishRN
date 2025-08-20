import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { signIn } from '../../src/services/auth';
import { useRouter } from 'expo-router';

const schema = yup.object().shape({
  email: yup.string().email('Некорректный email').required('Email обязателен'),
  password: yup.string().min(6, 'Минимум 6 символов').required('Пароль обязателен'),
});

export default function LoginScreen() {
  const router = useRouter();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      await signIn(data.email, data.password);
      router.replace('/');
    } catch (e: any) {
      alert(e.message || 'Ошибка входа');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Пароль"
            secureTextEntry
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
      <Button title={isSubmitting ? 'Вход...' : 'Войти'} onPress={handleSubmit(onSubmit)} disabled={isSubmitting} />
      <TouchableOpacity onPress={() => router.replace('/(auth)/register')} style={styles.linkContainer}>
        <Text style={styles.link}>Регистрация</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
  linkContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  link: {
    color: '#0a7ea4',
    fontWeight: 'bold',
  },
});
