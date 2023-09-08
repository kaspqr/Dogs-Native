import { Provider } from "react-redux"
import { store } from "../store"

import Home from "./home"

const Index = () => {

    return (
        <Provider store={store}>
                <Home />
        </Provider>
    )
}

export default Index
