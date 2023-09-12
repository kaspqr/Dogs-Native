import { Provider } from "react-redux"
import { store } from "../store"
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import Home from "./home"
import Menu from "./Menu"
import UserPage from "./UserPage"
import AdvertisementPage from "./AdvertisementPage"
import PersistLogin from "./PersistLogin"
import Prefetch from "./Prefetch"

const Stack = createNativeStackNavigator()

const Index = () => {

    return (
        <Provider store={store}>
            {/* <Stack.Navigator
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
                <Stack.Screen 
                    name="UserPage" 
                    component={UserPage} 
                />
                <Stack.Screen 
                    name="AdvertisementPage" 
                    component={AdvertisementPage} 
                />
            </Stack.Navigator> */}
            <Stack.Navigator
                initialRouteName="PersistLogin"
                screenOptions={{
                    headerShown: false
                }}
            >
                <Stack.Screen 
                    name="PersistLogin" 
                    component={PersistLogin} 
                />
            </Stack.Navigator>
        </Provider>
    )
}

export default Index
