import React from 'react'
import Layout from './app/_layout'
import Index from './app/index'

import { Provider } from 'react-redux'
import { store } from './store'

const App = () => {
    return (
        <Provider store={store}>
            <Index />
        </Provider>
    )
}

export default App
