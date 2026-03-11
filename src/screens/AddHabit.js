import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useLayoutEffect, useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import { useTheme } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

import { selectHabitById } from "../redux/habitSlice";
import {
  useCreateHabitMutation,
  useUpdateHabitMutation,
} from "../redux/api/habitsApi";

const AddHabit = ({ route }) => {
  const { id } = route.params || {};
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [habitName, setHabitName] = useState("");
  const [color, setColor] = useState("#98F5F9");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);

  const habit = useSelector((state) => selectHabitById(state, id));

  const [createHabit] = useCreateHabitMutation();
  const [updateHabit] = useUpdateHabitMutation();

  const colorArray = [
    ["#98F5F9", "#2273FF"],
    ["#8BFF5D", "#0DF349"],
    ["#EAAA6A", "#F37A02"],
    ["#EFC3CA", "#FF6F86"],
    ["#CDCCFC", "#7671FF"],
    ["#FFECA1", "#FACB11"],
  ];

  useEffect(() => {
    if (id && habit) {
      setHabitName(habit.name);

      const index = colorArray.findIndex(
        (c) =>
          c[0] === habit.primaryColor &&
          c[1] === habit.secondaryColor
      );

      if (index !== -1) {
        setSelectedIndex(index);
        setColor(colorArray[index][0]);
      }
    }
  }, [id, habit]);

  useEffect(() => {
    if (id) {
      inputRef.current?.focus();
    }
  }, [id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 8 }}
        >
          <Feather name="arrow-left" size={24} color={colors.title} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors]);

  const handleAddHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert("Name is required", "Please enter a name");
      return;
    }

    try {
      if (id) {
        await updateHabit({
          id,
          name: habitName,
          primaryColor: colorArray[selectedIndex][0],
          secondaryColor: colorArray[selectedIndex][1],
        }).unwrap();
      } else {
        await createHabit({
          name: habitName,
          primaryColor: colorArray[selectedIndex][0],
          secondaryColor: colorArray[selectedIndex][1],
        }).unwrap();
      }

      setHabitName("");
      navigation.goBack();
    } catch (error) {
      console.log("Habit error:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="height">
      <LinearGradient
        style={styles.container}
        colors={[colors.background, color]}
        start={[0.5, 0.5]}
        end={[1, 1]}
      >
        <View style={styles.innerContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={habitName}
            onChangeText={setHabitName}
            placeholder={id ? "New Name" : "Enter habit"}
            placeholderTextColor="#888"
            color={colors.title}
          />

          <View style={styles.colorContainer}>
            {colorArray.map((colorItem, index) => (
              <TouchableOpacity
                key={colorItem[0]}
                style={[
                  styles.colorView,
                  {
                    backgroundColor: colorItem[0],
                    borderWidth: index === selectedIndex ? 3 : 1,
                    borderColor:
                      index === selectedIndex
                        ? colors.title
                        : "transparent",
                  },
                ]}
                onPress={() => {
                  setColor(colorItem[0]);
                  setSelectedIndex(index);
                }}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddHabit}
          >
            <Text style={styles.addButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default AddHabit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  input: {
    height: 40,
    fontSize: 16,
    marginBottom: 20,
    paddingLeft: 8,
    width: "80%",
    borderBottomWidth: 1,
    borderBottomColor: "blue",
    color: "#333",
  },
  colorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  colorView: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  addButton: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff69b4",
    width: 120,
    height: 40,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 18,
    color: "#fff",
  },
});