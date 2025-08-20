import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Location {
  lat: number;
  lng: number;
}

interface UserState {
  location: Location | null;
}

const initialState: UserState = {
  location: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLocation(state, action: PayloadAction<Location>) {
      state.location = action.payload;
    },
  },
});

export const { setLocation } = userSlice.actions;
export default userSlice.reducer;
