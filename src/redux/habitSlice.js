import { createSlice } from "@reduxjs/toolkit";

const habitSlice = createSlice({
  name: "habits",
  initialState: [],
  reducers: {
    addHabit: (state, action) => {
      const habitExists = state.some((habit) => habit.id === action.payload.id);
      if (!habitExists) {
        state.push({
          ...action.payload,
          completedDates: [],
        });
      }
    },
    deleteHabit: (state, action) => {
      return state.filter((habit) => habit.id !== action.payload);
    },
    addDateToHabit: (state, action) => {
      const { id, date } = action.payload;
      const habit = state.find((habit) => habit.id === id);
      if (habit && !habit.completedDates.includes(date)) {
        habit.completedDates.push(date);
      }
    },
    removeDateFromHabit: (state, action) => {
      const { id, date } = action.payload;
      const habit = state.find((habit) => habit.id === id);
      if (habit) {
        habit.completedDates = habit.completedDates.filter((d) => d !== date);
      }
    },
  },
});

export const { addHabit, deleteHabit, addDateToHabit, removeDateFromHabit } =
  habitSlice.actions;
export const selectHabitById = (state, habitId) =>
  state.habits.find((habit) => habit.id === habitId);
export default habitSlice.reducer;
