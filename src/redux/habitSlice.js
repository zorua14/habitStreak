import { createSlice } from "@reduxjs/toolkit";
//MARK: TODO - edit name
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
    editHabit: (state, action) => {
      const { id, name, primaryColor, secondaryColor } = action.payload;
      const habitIndex = state.findIndex((habit) => habit.id === id);
      if (habitIndex !== -1) {
        state[habitIndex] = {
          id,
          name,
          primaryColor,
          secondaryColor,
          completedDates: state[habitIndex].completedDates,
        };
      }
    },
  },
});

export const {
  addHabit,
  deleteHabit,
  addDateToHabit,
  removeDateFromHabit,
  editHabit,
} = habitSlice.actions;
export const selectHabitById = (state, habitId) =>
  state.habits.find((habit) => habit.id === habitId);
export default habitSlice.reducer;
