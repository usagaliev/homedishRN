import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import dishesReducer from './features/dishes/dishesSlice';
import ordersReducer from './features/orders/ordersSlice';
import userReducer from './features/user/userSlice';
import chatReducer from './features/chat/chatSlice';
import reviewsReducer from './features/reviews/reviewsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dishes: dishesReducer,
    orders: ordersReducer,
    user: userReducer,
    chat: chatReducer,
    reviews: reviewsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
