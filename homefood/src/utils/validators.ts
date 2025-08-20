import * as yup from 'yup';

export const dishSchema = yup.object().shape({
  title: yup.string().required('Название обязательно'),
  description: yup.string().required('Описание обязательно'),
  price: yup.number().min(1, 'Цена должна быть больше 0').required('Цена обязательна'),
  category: yup.string().oneOf(['soup', 'bakery', 'main', 'salad', 'vegan', 'other']).required('Категория обязательна'),
  photoURL: yup
    .string()
    .test('is-url-or-file', 'Некорректная ссылка на фото', value =>
      !!value && (value.startsWith('http') || value.startsWith('file:'))
    )
    .required('Фото обязательно'),
  availableQty: yup.number().min(1, 'Количество должно быть больше 0').required('Количество обязательно'),
});

export const orderSchema = yup.object().shape({
  qty: yup.number().min(1, 'Минимум 1 порция').required('Количество обязательно'),
  note: yup.string().max(200, 'Комментарий слишком длинный').optional(),
  deliveryType: yup.string().oneOf(['pickup', 'delivery']).required('Способ получения обязателен'),
});
