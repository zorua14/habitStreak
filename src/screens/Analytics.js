import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import {
  addDateToHabit,
  removeDateFromHabit,
  selectHabitById,
} from "../redux/habitSlice";
import { differenceInDays, parseISO } from "date-fns";

const Analytics = ({ navigation, route }) => {
  const { id } = route.params;
  const habit = useSelector((state) => selectHabitById(state, id));
  const dispatch = useDispatch();
  const transformDates = (completedDates, primaryColor) => {
    let markedDates = {};
    completedDates.forEach((date) => {
      markedDates[date] = {
        selected: true,
        //marked: true,
        selectedColor: primaryColor,
      };
    });
    return markedDates;
  };
  const currentDate = new Date().toISOString().split("T")[0];
  const markedDates = transformDates(habit.completedDates, habit.primaryColor);
  if (markedDates[currentDate]) {
    markedDates[currentDate].selected = true;
    markedDates[currentDate].marked = true;
  } else {
    markedDates[currentDate] = { marked: true };
  }
  const calculateStreaks = (completedDates) => {
    if (completedDates.length === 0) {
      return { currentStreak: 0, maxStreak: 0 };
    }

    const sortedDates = completedDates
      .map((date) => parseISO(date))
      .sort((a, b) => a - b);

    let currentStreak = 1;
    let maxStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const diff = differenceInDays(sortedDates[i], sortedDates[i - 1]);
      if (diff === 1) {
        tempStreak += 1;
      } else {
        tempStreak = 1;
      }
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
    }

    const today = new Date();
    const lastCompletedDate = sortedDates[sortedDates.length - 1];
    const daysSinceLastCompleted = differenceInDays(today, lastCompletedDate);

    // If today is not completed, the streak breaks
    if (daysSinceLastCompleted > 0) {
      currentStreak = 0;
    } else {
      currentStreak = tempStreak;
    }

    return { currentStreak, maxStreak };
  };
  const { currentStreak, maxStreak } = calculateStreaks(habit.completedDates);
  const toggleDate = (habitId, dateString) => {
    if (habit.completedDates.includes(dateString)) {
      dispatch(removeDateFromHabit({ id: habitId, date: dateString }));
    } else {
      dispatch(addDateToHabit({ id: habitId, date: dateString }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Calendar
          onDayPress={(day) => {
            //day.dateString
            toggleDate(id, day.dateString);
          }}
          current={new Date().toISOString().split("T")[0]}
          hideArrows={false}
          hideExtraDays={true}
          disableMonthChange={false}
          enableSwipeMonths={true}
          onPressArrowLeft={(subtractMonth) => subtractMonth()}
          onPressArrowRight={(addMonth) => addMonth()}
          disableArrowLeft={false}
          disableArrowRight={false}
          disableAllTouchEventsForDisabledDays={true}
          markedDates={markedDates}
        />
        <Text>{habit.name}</Text>
        <View style={{ flexDirection: "row", margin: 10 }}>
          <Text>Maximum Streak:</Text>
          <Text>{maxStreak}</Text>
        </View>
        <View style={{ flexDirection: "row", marginLeft: 10 }}>
          <Text>Current Streak:</Text>
          <Text>{currentStreak}</Text>
        </View>
        <View style={{ flexDirection: "row", marginLeft: 10 }}>
          <Text>Total days completed:</Text>
          <Text>{habit.completedDates.length}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Analytics;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
