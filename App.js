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
const LightTheme = {
  ...MD3LightTheme,
  colors: lightScheme,
};
const DarkTheme = {
  ...MD3DarkTheme,
  colors: DarkScheme,
};

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 3000);
export default function App() {
  const colorscheme = useColorScheme();
  const theme = colorscheme === "dark" ? DarkTheme : LightTheme;
  return (
    <MenuProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <PaperProvider theme={theme}>
            <AppNavigator />
          </PaperProvider>
        </PersistGate>
      </Provider>
    </MenuProvider>
  );
}
