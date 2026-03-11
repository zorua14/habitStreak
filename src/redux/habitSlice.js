import { createSlice } from "@reduxjs/toolkit";

const habitSlice = createSlice({
  name: "habits",
  initialState: [],
  reducers: {},
});

export const selectHabitById = (state, habitId) =>
  state.habits.find((habit) => habit.id === habitId);

export default habitSlice.reducer;