import React from 'react'
import { COLORS, images, icons } from "../constants"
import MenuComponent from './MenuComponent'
import Login from './Login'
import NewUserForm from './NewUserForm'
import ScreenHeaderBtn from '../components/header/ScreenHeaderBtn'
import FAQ from './Faq'
import UsersList from './UsersList'
import UserPage from './UserPage'
import AdvertisementPage from './AdvertisementPage'
import DogPage from './DogPage'
import DogsList from './DogsList'
import LittersList from './LittersList'
import LitterPage from './LitterPage'
import NewLitterForm from './NewLitterForm'

import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

const Menu = ({ navigation }) => {

    {/* <Stack.Navigator
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
        > */}

    return (
        <Stack.Navigator
            initialRouteName="MenuComponent"
            screenOptions={{
                headerShown: false
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
            <Stack.Screen 
                name='AdvertisementPage' 
                component={AdvertisementPage} 
            />
            <Stack.Screen 
                name='DogPage' 
                component={DogPage} 
            />
            <Stack.Screen 
                name='DogsList' 
                component={DogsList} 
            />
            <Stack.Screen 
                name='LittersList' 
                component={LittersList} 
            />
            <Stack.Screen 
                name='LitterPage' 
                component={LitterPage} 
            />
            <Stack.Screen 
                name='NewLitterForm' 
                component={NewLitterForm} 
            />
        </Stack.Navigator>
    )
}

export default Menu
