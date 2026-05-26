import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import web3Reducer from './slices/web3Slice'
import credentialReducer from './slices/credentialSlice'
import chatReducer from './slices/chatSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    web3: web3Reducer,
    credentials: credentialReducer,
    chat: chatReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in web3 state
        ignoredActions: ['web3/setProvider', 'web3/setSigner'],
        ignoredPaths: ['web3.provider', 'web3.signer'],
      },
    }),
})
