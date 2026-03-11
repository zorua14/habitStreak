import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../lib/supabase";

export const habitsApi = createApi({
  reducerPath: "habitsApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Habits"],

  endpoints: (builder) => ({
    fetchHabits: builder.query({
      async queryFn() {
        const { data, error } = await supabase
          .from("habits")
          .select("*")
          .order("created_at");

        if (error) return { error };
        return { data };
      },
      providesTags: ["Habits"],
    }),

    createHabit: builder.mutation({
      async queryFn({ name, primaryColor, secondaryColor }) {
        const { data, error } = await supabase.rpc("habit_create", {
          name,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
        });

        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Habits"],
    }),

    updateHabit: builder.mutation({
      async queryFn({ id, name, primaryColor, secondaryColor }) {
        const { data, error } = await supabase.rpc("habit_update", {
          habit_id: id,
          name,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
        });

        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Habits"],
    }),

    deleteHabit: builder.mutation({
      async queryFn(id) {
        const { error } = await supabase.rpc("habit_delete", {
          habit_id: id,
        });

        if (error) return { error };
        return { data: id };
      },
      invalidatesTags: ["Habits"],
    }),

    markHabitComplete: builder.mutation({
      async queryFn({ habitId, day }) {
        const { error } = await supabase.rpc("habit_add_completed_date", {
          habit_id: habitId,
          day_text: day,
        });

        if (error) return { error };
        return { data: true };
      },
      // No invalidatesTags — cache is patched directly in onQueryStarted
      async onQueryStarted({ habitId, day }, { dispatch, queryFulfilled }) {
        // Patch the fetchHabits cache immediately (optimistic)
        const patch = dispatch(
          habitsApi.util.updateQueryData("fetchHabits", undefined, (draft) => {
            const habit = draft.find((h) => h.id === habitId);
            if (habit && !habit.completed_dates.includes(day)) {
              habit.completed_dates.push(day);
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Server rejected — roll back the cache patch
          patch.undo();
        }
      },
    }),

    unmarkHabitComplete: builder.mutation({
      async queryFn({ habitId, day }) {
        const { error } = await supabase.rpc("habit_remove_completed_date", {
          habit_id: habitId,
          day_text: day,
        });

        if (error) return { error };
        return { data: true };
      },
      // No invalidatesTags — cache is patched directly in onQueryStarted
      async onQueryStarted({ habitId, day }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          habitsApi.util.updateQueryData("fetchHabits", undefined, (draft) => {
            const habit = draft.find((h) => h.id === habitId);
            if (habit) {
              habit.completed_dates = habit.completed_dates.filter(
                (d) => d !== day
              );
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useFetchHabitsQuery,
  useCreateHabitMutation,
  useUpdateHabitMutation,
  useDeleteHabitMutation,
  useMarkHabitCompleteMutation,
  useUnmarkHabitCompleteMutation,
} = habitsApi;