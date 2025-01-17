import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import {
  addDateToHabit,
  removeDateFromHabit,
  selectHabitById,
} from "../redux/habitSlice";
import { differenceInDays, parseISO } from "date-fns";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { useTheme } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
const Analytics = ({ navigation, route }) => {
  const { colors, dark } = useTheme();
  const [themeChanged, setThemeChanged] = useState(false);
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
  useEffect(() => {
    setThemeChanged((prev) => !prev);
  }, [colors]);
  const currentDate = new Date().toISOString().split("T")[0];
  const markedDates = transformDates(
    habit.completedDates,
    habit.secondaryColor
  );
  if (markedDates[currentDate]) {
    markedDates[currentDate].selected = true;
    markedDates[currentDate].marked = true;
  } else {
    markedDates[currentDate] = { marked: true };
  }
  // MARK: - STREAK CALC
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
    const daysBetweenTodayAndStart =
      differenceInDays(today, sortedDates[0]) + 1;
    const completionPercentage = Math.round(
      (sortedDates.length / daysBetweenTodayAndStart) * 100
    );

    // If today is not completed, the streak breaks
    if (daysSinceLastCompleted > 0) {
      currentStreak = 0;
    } else {
      currentStreak = tempStreak;
    }

    return { currentStreak, maxStreak, completionPercentage };
  };
  const { currentStreak, maxStreak, completionPercentage } = calculateStreaks(
    habit.completedDates
  );
  //MARK: - TOGGLE DATE
  const toggleDate = (habitId, dateString) => {
    if (habit.completedDates.includes(dateString)) {
      dispatch(removeDateFromHabit({ id: habitId, date: dateString }));
    } else {
      dispatch(addDateToHabit({ id: habitId, date: dateString }));
    }
  };
  //MARK: - VIEW
  return (
    <>
      <StatusBar
        barStyle={dark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <Calendar
            onDayPress={(day) => {
              //day.dateString
              toggleDate(id, day.dateString);
            }}
            style={{
              borderRadius: 5,
              margin: 12,
              elevation: 5,
              borderWidth: 4,
              borderColor: colors.title,
            }}
            theme={{
              calendarBackground: colors.background,
              dayTextColor: colors.title,
              monthTextColor: "#32C2FF",
              textDisabledColor: "gray",
            }}
            key={themeChanged}
            current={new Date().toISOString().split("T")[0]}
            maxDate={new Date().toISOString().split("T")[0]}
            hideArrows={false}
            hideExtraDays={true}
            disableMonthChange={false}
            enableSwipeMonths={false}
            onPressArrowLeft={(subtractMonth) => subtractMonth()}
            onPressArrowRight={(addMonth) => addMonth()}
            disableArrowLeft={false}
            disableArrowRight={false}
            disableAllTouchEventsForDisabledDays={true}
            markedDates={markedDates}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                alignSelf: "center",
                fontWeight: "bold",
                fontSize: 28,
                marginTop: 15,
                color: colors.title,
              }}
            >
              {habit.name}
            </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("AddHabit", { id: habit.id });
              }}
            >
              <Feather
                name="edit-2"
                size={24}
                color={colors.title}
                style={{ marginTop: 15, marginLeft: 10 }}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: "row",
              margin: 10,
              height: 80,
            }}
          >
            <View
              style={{
                backgroundColor: habit.secondaryColor,
                borderRadius: 10,
                flex: 1,
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <Text style={styles.titleStyle}>Maximum Streak</Text>
              <Text style={styles.titleStyle}>{maxStreak}</Text>
            </View>
            <View
              style={{
                backgroundColor: habit.secondaryColor,
                borderRadius: 10,
                flex: 1,
                justifyContent: "center",
              }}
            >
              <Text style={styles.titleStyle}>Current Streak</Text>
              <Text style={styles.titleStyle}>{currentStreak}</Text>
            </View>
          </View>

          <AnimatedCircularProgress
            size={120}
            width={15}
            duration={1000}
            fill={completionPercentage ? completionPercentage : 0}
            tintColor={habit.secondaryColor}
            backgroundColor="#d3d3d3"
            rotation={0}
            lineCap="round"
            style={{ alignSelf: "center", marginTop: 20 }}
          >
            {(fill) => (
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: colors.title,
                }}
              >
                {Math.round(completionPercentage ? completionPercentage : 0)}%
              </Text>
            )}
          </AnimatedCircularProgress>
          <Text
            style={{ alignSelf: "center", fontSize: 24, color: colors.title }}
          >
            Completion Rate
          </Text>
          <Text
            style={{
              alignSelf: "center",
              fontSize: 20,
              marginTop: 20,
              color: colors.title,
            }}
          >
            {" "}
            Total Days Perfromed {habit.completedDates.length}
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
};

export default Analytics;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  titleStyle: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "500",
  },
  subtitleStyle: {
    fontSize: 16,
    textAlign: "center",
  },
});
