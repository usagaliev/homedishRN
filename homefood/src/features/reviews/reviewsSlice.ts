import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Review } from '../../utils/types';

interface ReviewsState {
  reviews: Review[];
  chefRatings: { [chefId: string]: { average: number; count: number } };
  dishRatings: { [dishId: string]: { average: number; count: number } };
  loading: boolean;
  error: string | null;
  userReviews: Review[];
}

const initialState: ReviewsState = {
  reviews: [],
  chefRatings: {},
  dishRatings: {},
  loading: false,
  error: null,
  userReviews: [],
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setReviews(state, action: PayloadAction<Review[]>) {
      state.reviews = action.payload;
    },
    addReview(state, action: PayloadAction<Review>) {
      state.reviews.push(action.payload);
      state.userReviews.push(action.payload);
    },
    updateReview(state, action: PayloadAction<Review>) {
      const index = state.reviews.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.reviews[index] = action.payload;
      }
      const userIndex = state.userReviews.findIndex(r => r.id === action.payload.id);
      if (userIndex !== -1) {
        state.userReviews[userIndex] = action.payload;
      }
    },
    setChefRatings(state, action: PayloadAction<{ [chefId: string]: { average: number; count: number } }>) {
      state.chefRatings = action.payload;
    },
    updateChefRating(state, action: PayloadAction<{ chefId: string; rating: number; count: number }>) {
      const { chefId, rating, count } = action.payload;
      state.chefRatings[chefId] = { average: rating, count };
    },
    setDishRatings(state, action: PayloadAction<{ [dishId: string]: { average: number; count: number } }>) {
      state.dishRatings = action.payload;
    },
    updateDishRating(state, action: PayloadAction<{ dishId: string; rating: number; count: number }>) {
      const { dishId, rating, count } = action.payload;
      state.dishRatings[dishId] = { average: rating, count };
    },
    setUserReviews(state, action: PayloadAction<Review[]>) {
      state.userReviews = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setReviews,
  addReview,
  updateReview,
  setChefRatings,
  updateChefRating,
  setDishRatings,
  updateDishRating,
  setUserReviews,
  setLoading,
  setError,
} = reviewsSlice.actions;

export default reviewsSlice.reducer;


