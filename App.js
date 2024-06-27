import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import AppNavigator from "./AppNavigator";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./src/redux/store";
import { MenuProvider } from "react-native-popup-menu";
import { Provider as PaperProvider } from "react-native-paper";

export default function App() {
  return (
    <MenuProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <PaperProvider>
            <AppNavigator />
          </PaperProvider>
        </PersistGate>
      </Provider>
    </MenuProvider>
  );
}
