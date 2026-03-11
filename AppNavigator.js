import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "react-native-paper";

import Home from "./src/screens/Home";
import AddHabit from "./src/screens/AddHabit";
import LoginScreen from "./src/screens/LoginScreen";

import { supabase } from "./src/lib/supabase";
import Analytics from "./src/screens/analytics/analytics";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { colors } = useTheme();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth events — only react to meaningful ones
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          // Only clear session on explicit sign-out
          setSession(null);
        } else if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "INITIAL_SESSION"
        ) {
          // Keep session alive on login and silent token refreshes
          setSession(session);
        }
        // Intentionally ignore: PASSWORD_RECOVERY, USER_UPDATED
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Hold rendering until we know the auth state to prevent login flash
  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.title,
          headerTitleStyle: { color: colors.title },
          headerTitleAlign: "center",
        }}
      >
        {session == null ? (
          // AUTH STACK
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          // APP STACK
          <>
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;