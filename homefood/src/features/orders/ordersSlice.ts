import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Order {
  id: string;
  dishId: string;
  chefId: string;
  buyerId: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  note?: string;
  deliveryType: 'pickup' | 'delivery';
  status: string;
  createdAt: number;
  updatedAt: number;
  chatEnabled?: boolean;
}

interface OrdersState {
  myOrders: Order[];
  loading: boolean;
}

const initialState: OrdersState = {
  myOrders: [],
  loading: false,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setMyOrders(state, action: PayloadAction<Order[]>) {
      state.myOrders = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setMyOrders, setLoading } = ordersSlice.actions;
export default ordersSlice.reducer;
