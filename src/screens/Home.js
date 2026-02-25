import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  FlatList,
  Vibration,
} from "react-native";
import React, { useState, useRef, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo, SimpleLineIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Snackbar, useTheme } from "react-native-paper";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useSelector, useDispatch } from "react-redux";
import { deleteHabit, addDateToHabit, removeDateFromHabit } from "../redux/habitSlice";
import { StatusBar } from "expo-status-bar";
import AnimatedTouchable from "../components/AnimatedTouchable";

const Home = () => {
  const { colors, dark } = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const habits = useSelector((state) => state.habits);
  const [snackVisible, setSnackVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  const bottomSheetModalRef = useRef(null);

  // Store the pending navigation action so we can fire it after sheet closes
  const pendingNavAction = useRef(null);
  const pendingDeleteRef = useRef(null);

  const handlePresentModal = useCallback((habit) => {
    setSelectedHabit(habit);
    bottomSheetModalRef.current?.present();
  }, []);

  const handleClose = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  // Called by BottomSheetModal's onDismiss — fires AFTER the sheet animation completes
  const handleSheetDismiss = useCallback(() => {
    if (pendingNavAction.current) {
      pendingNavAction.current();
      pendingNavAction.current = null;
    }
    if (pendingDeleteRef.current) {
      const { id, name } = pendingDeleteRef.current;
      pendingDeleteRef.current = null;
      const habitName = name ?? "this habit";
      Alert.alert(
        "Delete habit?",
        `Are you sure you want to delete "${habitName}"? This cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              dispatch(deleteHabit(id));
              setSnackVisible(true);
            },
          },
        ]
      );
    }
  }, [dispatch]);

  const navigateAfterDismiss = useCallback(
    (screenName, params) => {
      // Queue the navigation action, then dismiss the sheet
      pendingNavAction.current = () => navigation.navigate(screenName, params);
      bottomSheetModalRef.current?.dismiss();
    },
    [navigation]
  );

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.4}
      />
    ),
    []
  );

  const toggleDate = useCallback(
    (habitId, dateString) => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;
      if (habit.completedDates.includes(dateString)) {
        dispatch(removeDateFromHabit({ id: habitId, date: dateString }));
      } else {
        dispatch(addDateToHabit({ id: habitId, date: dateString }));
      }
    },
    [habits, dispatch]
  );

  const getWeekDates = useCallback(() => {
    const today = new Date();
    return Array.from({ length: 5 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (4 - i));
      return date.toISOString().split("T")[0];
    });
  }, []);

  const weekDates = getWeekDates();
  const todayString = new Date().toISOString().split("T")[0];

  const renderWeekView = useCallback(
    ({ item }) => {
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
          onPress={() => navigation.navigate("Analytics", { id: item.id })}
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

              <TouchableOpacity
                onPress={() => handlePresentModal(item)}
                style={{ marginRight: "6%", padding: 4 }}
              >
                <SimpleLineIcons name="options" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal contentContainerStyle={styles.weekContainer}>
              {weekDates.map((date) => (
                <View key={date} style={styles.dayContainer}>
                  <Text>
                    {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
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
                        markedDates[date] && { backgroundColor: item.secondaryColor },
                        {
                          borderColor: date === todayString ? "white" : "black",
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
    },
    [weekDates, todayString, handlePresentModal, toggleDate, navigation]
  );

  return (
    <>
      <StatusBar
        barStyle={dark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
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

          {habits.length === 0 ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontWeight: "600", fontSize: 30, color: colors.title }}>
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

          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.title }]}
            onPress={() => navigation.navigate("AddHabit", { id: null })}
          >
            <Entypo name="plus" size={24} color={colors.background} />
          </TouchableOpacity>
        </View>

        <Snackbar
          visible={snackVisible}
          onDismiss={() => setSnackVisible(false)}
          duration={1200}
          style={{ backgroundColor: "white", marginBottom: 20 }}
        >
          Habit has been deleted
        </Snackbar>
      </SafeAreaView>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        // ← Key fix: fire pending navigation AFTER sheet animation finishes
        onDismiss={handleSheetDismiss}
        handleIndicatorStyle={{ backgroundColor: "#aaa" }}
        handleStyle={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <BottomSheetView style={[styles.sheetContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sheetTitle, { color: colors.onSurface }]}>
            {selectedHabit?.name}
          </Text>

          <TouchableOpacity
            style={styles.sheetItem}
            onPress={() => {
              // Queue nav, dismiss sheet — onDismiss fires navigation after animation
              navigateAfterDismiss("Analytics", { id: selectedHabit?.id });
            }}
          >
            <SimpleLineIcons name="graph" size={20} color={colors.onSurface} />
            <Text style={[styles.sheetItemText, { color: colors.onSurface }]}>
              Analytics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetItem}
            onPress={() => {
              pendingDeleteRef.current = {
                id: selectedHabit?.id,
                name: selectedHabit?.name,
              };
              handleClose();
            }}
          >
            <SimpleLineIcons name="trash" size={20} color="red" />
            <Text style={[styles.sheetItemText, { color: "red" }]}>
              Delete Habit
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  sheetItemText: {
    fontSize: 16,
  },
});