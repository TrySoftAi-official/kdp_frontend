import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import slices
import authSlice from './slices/authSlice';
import subscriptionSlice from './slices/subscriptionSlice';
import userSlice from './slices/userSlice';
import bookSlice from './slices/bookSlice';
import uiSlice from './slices/uiSlice';
import kdpFlowSlice from './slices/kdpFlowSlice';

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'user', 'kdpFlow'], // Persist auth, user, and kdpFlow data
};

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  subscription: subscriptionSlice,
  user: userSlice,
  books: bookSlice,
  ui: uiSlice,
  kdpFlow: kdpFlowSlice,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  // Avoid relying on process types in browser TS unless provided
  devTools: true,
});

// Persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;