import "expo-router/entry"

import { AppRegistry } from 'react-native'
import React from 'react'
import { name as appName } from './app.json'
import { Provider } from 'react-redux'
import { store } from './store'
import App from "./App"

const RNRedux = () => (
    <Provider store={store}>
        <App />
    </Provider>
)
AppRegistry.registerComponent(appName, () => RNRedux)
