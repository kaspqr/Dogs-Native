import { Provider } from "react-redux"
import { store } from "../store"
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import Home from "./home"
import Menu from "./Menu"

const Stack = createNativeStackNavigator()

const Index = () => {

    return (
        <Provider store={store}>
            <Stack.Navigator
                initialRouteName="home"
                screenOptions={{
                    headerShown: false
                }}
            >
                <Stack.Screen 
                    name="home" 
                    component={Home} 
                />
                <Stack.Screen 
                    name="Menu" 
                    component={Menu} 
                />
            </Stack.Navigator>
        </Provider>
    )

    /* return <Provider store={store}>
        <Home />
    </Provider> */
}

export default Index
