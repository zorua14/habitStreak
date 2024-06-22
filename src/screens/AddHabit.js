import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const AddHabit = () => {
  const navigation = useNavigation();
  const [habitName, setHabitName] = useState("");
  const [color, setColor] = useState("#98F5F9");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const colorArray = [
    "#98F5F9",
    "#8BFF5D",
    "#EAAA6A",
    "#EFC3CA",
    "#060270",
    "#FFECA1",
  ];
  const handleAddHabit = () => {
    if (habitName.trim()) {
      //   dispatch(addHabit({ id: Date.now().toString(), name: habitName }));
      //   setHabitName('');
      navigation.goBack();
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        style={styles.container}
        colors={["#fff", color]}
        start={[0.5, 0.5]}
        end={[1, 1]}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.headerText}>Add Habit</Text>
          <TextInput
            style={styles.input}
            value={habitName}
            onChangeText={setHabitName}
            placeholder="Enter habit"
            placeholderTextColor="#888"
          />
          <View style={styles.colorContainer}>
            {colorArray.map((color, index) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorView,
                  {
                    backgroundColor: color,
                    borderWidth: index === selectedIndex ? 3 : 1,
                    borderColor:
                      index === selectedIndex ? "black" : "transparent",
                  },
                ]}
                onPress={() => {
                  setColor(colorArray[index]);
                  setSelectedIndex(index);
                }}
              ></TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddHabit}>
            <Text style={styles.addButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default AddHabit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
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
