import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./src/screens/Home";
import AddHabit from "./src/screens/AddHabit";
import Analytics from "./src/screens/Analytics";
import { useTheme } from "react-native-paper";


const Stack = createNativeStackNavigator();
const AppNavigator = () => {
  const { colors } = useTheme();
  return (
    <NavigationContainer>
      <Stack.Navigator
      screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.title,
          headerTitleStyle: { color: colors.title },
          headerTitleAlign: 'center',
        }}>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddHabit"
          component={AddHabit}
          options={({ route }) => ({
          headerShown: true,
          title: route.params?.id ? "Edit Habit" : "Add Habit",
        })}
        />
        <Stack.Screen
          name="Analytics"
          component={Analytics}
          options={{ headerShown: true }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({});
