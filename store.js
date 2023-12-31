import { configureStore } from "@reduxjs/toolkit"
import { apiSlice } from "./app/api/apiSlice"
import { setupListeners } from "@reduxjs/toolkit/dist/query"
import authReducer from './components/auth/authSlice'

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: false
})

setupListeners(store.dispatch)
