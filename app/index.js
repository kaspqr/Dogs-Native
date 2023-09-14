import { Provider } from "react-redux"
import { store } from "../store"
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import PersistLogin from "./PersistLogin"

const Stack = createNativeStackNavigator()

const Index = () => {

    return (
        <Provider store={store}>
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
