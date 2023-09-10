import React from 'react'
import { COLORS, images, icons } from "../constants"
import MenuComponent from './MenuComponent'
import Login from './Login'
import NewUserForm from './NewUserForm'
import ScreenHeaderBtn from '../components/header/ScreenHeaderBtn'
import FAQ from './Faq'
import UsersList from './UsersList'
import UserPage from './UserPage'

import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

const Menu = ({ navigation }) => {

    return (
        <Stack.Navigator
            initialRouteName="MenuComponent"
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.beige },
                headerShadowVisible: true,
                headerLeft: () => (
                    <ScreenHeaderBtn 
                        iconUrl={images.home} 
                        dimension="100%" 
                        handlePress={() => navigation.navigate('AdvertisementsList')}
                    />
                ),
                headerRight: () => (
                    <ScreenHeaderBtn 
                        iconUrl={icons.menu} 
                        dimension="60%" 
                        handlePress={() => navigation.navigate('MenuComponent')}
                    />
                ),
                headerTitle: "",
            }}
        >
            <Stack.Screen 
                name='MenuComponent' 
                component={MenuComponent} 
            />
            <Stack.Screen 
                name='Login' 
                component={Login} 
            />
            <Stack.Screen 
                name='NewUserForm' 
                component={NewUserForm} 
            />
            <Stack.Screen 
                name='Faq' 
                component={FAQ} 
            />
            <Stack.Screen 
                name='UsersList' 
                component={UsersList} 
            />
            <Stack.Screen 
                name='UserPage' 
                component={UserPage} 
            />
        </Stack.Navigator>
    )
}

export default Menu
