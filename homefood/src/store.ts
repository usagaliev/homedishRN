import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import dishesReducer from './features/dishes/dishesSlice';
import ordersReducer from './features/orders/ordersSlice';
import userReducer from './features/user/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dishes: dishesReducer,
    orders: ordersReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
