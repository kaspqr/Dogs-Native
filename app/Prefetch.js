import { store } from '../store'
import { dogsApiSlice } from '../components/dogs/dogsApiSlice'
import { usersApiSlice } from '../components/users/usersApiSlice'
import { useEffect } from 'react'
import Home from "./home"
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

const Prefetch = () => {
    useEffect(() => {
        store.dispatch(dogsApiSlice.util.prefetch('getDogs', 'dogsList', { force: true }))
        store.dispatch(usersApiSlice.util.prefetch('getUsers', 'usersList', { force: true }))
    }, [])

    return <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
            headerShown: false
        }}
    >
        <Stack.Screen 
            name="Home" 
            component={Home} 
        />
    </Stack.Navigator>
}

export default Prefetch

