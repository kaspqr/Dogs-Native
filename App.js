import React from 'react'
import Index from './app/index'

import { Provider } from 'react-redux'
import { store } from './store'
import PersistLogin from './components/auth/PersistLogin'
import Prefetch from './components/auth/Prefetch'
import Layout from './app/_layout'

const App = () => {
    return (
        <Provider store={store}>
            <PersistLogin>
                <Prefetch>
                    <Layout>
                        <Index />
                    </Layout>
                </Prefetch>
            </PersistLogin>
        </Provider>
    )
}

export default App
