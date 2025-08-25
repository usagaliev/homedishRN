import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dish } from '../../utils/types';

interface DishesState {
  list: Dish[];
  filters: {
    category?: string;
    status?: string;
    chefId?: string;
  };
  loading: boolean;
}

const initialState: DishesState = {
  list: [],
  filters: {},
  loading: false,
};

const dishesSlice = createSlice({
  name: 'dishes',
  initialState,
  reducers: {
    setDishes(state, action: PayloadAction<Dish[]>) {
      state.list = action.payload;
    },
    setFilters(state, action: PayloadAction<DishesState['filters']>) {
      state.filters = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setDishes, setFilters, setLoading } = dishesSlice.actions;
export default dishesSlice.reducer;
