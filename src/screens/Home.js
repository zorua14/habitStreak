import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  FlatList,
  Vibration,
  Animated,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Snackbar, useTheme } from "react-native-paper";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { SimpleLineIcons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import {
  deleteHabit,
  addDateToHabit,
  removeDateFromHabit,
} from "../redux/habitSlice";
import { StatusBar } from "expo-status-bar";
import AnimatedTouchable from "../components/AnimatedTouchable";

const Home = () => {
  const { colors, dark } = useTheme();
  const navigation = useNavigation();
  const [showMonth, setShowMonth] = useState(false);
  const dispatch = useDispatch();
  const habits = useSelector((state) => state.habits);
  const [visible, setVisible] = useState(false);

  const onToggleSnackBar = () => setVisible(!visible);

  const onDismissSnackBar = () => setVisible(false);

  // MARK: - TOGGLE DATE
  const toggleDate = (habitId, dateString) => {
    const habit = habits.find((habit) => habit.id === habitId);
    if (!habit) return;

    if (habit.completedDates.includes(dateString)) {
      dispatch(removeDateFromHabit({ id: habitId, date: dateString }));
    } else {
      dispatch(addDateToHabit({ id: habitId, date: dateString }));
    }
  };
  // MARK: - GET WEEK DATES

  const getWeekDates = () => {
    const today = new Date();
    const weekDates = Array.from({ length: 5 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (4 - i));
      return date.toISOString().split("T")[0];
    });

    return weekDates;
  };
  // MARK: - WEEK VIEW
  const renderWeekView = ({ item }) => {
    const weekDates = getWeekDates();
    const markedDates = item.completedDates.reduce((acc, date) => {
      acc[date] = true;
      return acc;
    }, {});

    return (
      <TouchableOpacity
        style={{
          backgroundColor: item.primaryColor,
          padding: 15,
          marginVertical: 8,
          borderRadius: 15,
          marginHorizontal: 12,
        }}
        onPress={() => {
          navigation.navigate("Analytics", { id: item.id });
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 25,
                color: "black",
                marginLeft: 15,
                marginVertical: 5,
              }}
            >
              {item.name}
            </Text>

            <Menu
              style={{
                marginRight: "6%",
                width: 25,
              }}
            >
              <MenuTrigger>
                <SimpleLineIcons name="options" size={24} color="black" />
              </MenuTrigger>
              <MenuOptions>
                <MenuOption
                  onSelect={() => {
                    navigation.navigate("Analytics", { id: item.id });
                  }}
                >
                  <Text style={{ padding: 10 }}>Analytics</Text>
                </MenuOption>
                <MenuOption
                  onSelect={() => {
                    onToggleSnackBar();
                    dispatch(deleteHabit(item.id));
                  }}
                >
                  <Text style={{ padding: 10 }}>Delete Habit</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
          <ScrollView horizontal contentContainerStyle={styles.weekContainer}>
            {weekDates.map((date) => (
              <View key={date} style={styles.dayContainer}>
                <Text>
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </Text>
                <Text>{new Date(date).getDate()}</Text>
                <AnimatedTouchable
                  onPress={() => {
                    Vibration.vibrate(100);
                    toggleDate(item.id, date);
                  }}
                >
                  <View
                    style={[
                      styles.dateCircle,

                      markedDates[date] && {
                        backgroundColor: item.secondaryColor,
                      },
                      {
                        borderColor:
                          date === new Date().toISOString().split("T")[0]
                            ? "white"
                            : "black",
                      },
                    ]}
                  />
                </AnimatedTouchable>
              </View>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    );
  };

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
          <Text
            style={{
              fontSize: 25,
              fontWeight: "600",
              marginLeft: 16,
              marginVertical: 5,
              textAlign: "center",
              color: colors.title,
            }}
          >
            Your Streak!
          </Text>
          {habits.length == 0 ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 30,
                  color: colors.title,
                }}
              >
                No Habits Added Yet
              </Text>
            </View>
          ) : (
            <FlatList
              data={habits}
              renderItem={renderWeekView}
              keyExtractor={(item) => item.id}
            />
          )}
          {/* <FlatList
            data={habits}
            renderItem={renderWeekView}
            keyExtractor={(item) => item.id}
          /> */}
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.title }]}
            onPress={() => {
              navigation.navigate("AddHabit", { id: null });
            }}
          >
            <Entypo name="plus" size={24} color={colors.background} />
          </TouchableOpacity>
        </View>
        <Snackbar
          visible={visible}
          onDismiss={onDismissSnackBar}
          duration={1200}
          style={{ backgroundColor: "white", marginBottom: 20 }}
        >
          Habit has been deleted
        </Snackbar>
      </SafeAreaView>
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    elevation: 5,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    marginTop: 5,
    marginBottom: 5,
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
