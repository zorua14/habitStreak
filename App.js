import { useColorScheme } from "react-native";
import AppNavigator from "./AppNavigator";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./src/redux/store";
import { MenuProvider } from "react-native-popup-menu";
import {
  Provider as PaperProvider,
  MD3LightTheme,
  MD3DarkTheme,
} from "react-native-paper";
import { lightScheme } from "./src/theme/lightScheme";
import { DarkScheme } from "./src/theme/darkScheme";
import * as SplashScreen from "expo-splash-screen";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

const LightTheme = {
  ...MD3LightTheme,
  colors: lightScheme,
};

const DarkTheme = {
  ...MD3DarkTheme,
  colors: DarkScheme,
};

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 1200);

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? DarkTheme : LightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <PaperProvider theme={theme}>
            <MenuProvider>
              <KeyboardProvider>
                <BottomSheetModalProvider>
                  <AppNavigator />
                </BottomSheetModalProvider>
              </KeyboardProvider>
            </MenuProvider>
          </PaperProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}