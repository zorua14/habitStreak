import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Calendar, CalendarList } from "react-native-calendars";
import RNPickerSelect from "react-native-picker-select";
const Home = () => {
  const navigation = useNavigation();
  const [showMonth, setShowMonth] = useState(false);

  // Dummy data

  const dummyHabits = [
    {
      id: "1",
      name: "Exercise",
      dates: ["2024-06-01", "2024-06-03", "2024-06-05"],
    },
    { id: "2", name: "Read", dates: ["2024-06-22", "2024-06-04"] },
  ];

  const [selectedHabitId, setSelectedHabitId] = useState(dummyHabits[0].id);

  const selectedHabit = dummyHabits.find(
    (habit) => habit.id === selectedHabitId
  );
  const markedDates = {};
  selectedHabit.dates.forEach((date) => {
    markedDates[date] = { marked: true, dotColor: "green" };
  });

  const toggleDate = (day) => {
    const dateIndex = selectedHabit.dates.indexOf(day.dateString);
    if (dateIndex > -1) {
      selectedHabit.dates.splice(dateIndex, 1);
    } else {
      selectedHabit.dates.push(day.dateString);
    }
  };
  const getWeekDates = () => {
    const today = new Date();
    const firstDayOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay() + 1)
    );
    const weekDates = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(firstDayOfWeek);
      date.setDate(firstDayOfWeek.getDate() + i);
      return date.toISOString().split("T")[0];
    });
    return weekDates;
  };
  const renderWeekView = () => {
    const weekDates = getWeekDates();
    return (
      <ScrollView horizontal contentContainerStyle={styles.weekContainer}>
        {weekDates.map((date) => (
          <View key={date} style={styles.dayContainer}>
            <Text>
              {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
            </Text>
            <Text>{new Date(date).getDate()}</Text>
            <View
              style={[
                styles.dateCircle,
                markedDates[date] && { backgroundColor: "green" },
              ]}
            />
          </View>
        ))}
      </ScrollView>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text>Select a habit:</Text>
        <RNPickerSelect
          onValueChange={(value) => setSelectedHabitId(value)}
          items={dummyHabits.map((habit) => ({
            label: habit.name,
            value: habit.id,
          }))}
          value={selectedHabitId}
          style={pickerSelectStyles}
        />
        <Button
          title={`Show ${showMonth ? "Week" : "Month"}`}
          onPress={() => setShowMonth(!showMonth)}
        />
        {showMonth ? (
          <Calendar markedDates={markedDates} onDayPress={toggleDate} />
        ) : (
          renderWeekView()
        )}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            navigation.navigate("AddHabit");
          }}
        >
          <Entypo name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  fab: {
    position: "absolute",
    bottom: 50,
    right: 50,
    width: 50,
    height: 50,
    borderRadius: 25,
    elevation: 5,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
  },
  picker: {
    height: 50,
    width: "100%",
    marginVertical: 10,
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-around",

    width: "100%",
  },
  dayContainer: {
    alignItems: "center",
    marginHorizontal: 5,
  },
  dateCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "gray",
    marginTop: 5,
  },
});
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "purple",
    borderRadius: 8,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
