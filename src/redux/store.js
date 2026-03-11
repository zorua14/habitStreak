import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";

import habitsReducer from "./habitSlice";
import { habitsApi } from "./api/habitsApi";

const rootReducer = combineReducers({
  habits: habitsReducer,
  [habitsApi.reducerPath]: habitsApi.reducer,
});

const persistConfig = {
  key: "root",
  version: 1,
  storage: AsyncStorage,
  // Exclude the RTK Query cache — it should never be persisted.
  // Persisting it causes stale data from a previous user to flash
  // on screen before the fresh fetch completes after login.
  blacklist: [habitsApi.reducerPath],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(habitsApi.middleware),
});

const persistor = persistStore(store);

export { store, persistor };