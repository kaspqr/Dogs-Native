import React from 'react'
import { Stack } from 'expo-router'
import ScreenHeaderBtn from './ScreenHeaderBtn'
import { icons, images, COLORS } from '../../constants'

const Header = () => {
  return (
    <Stack.Screen 
        options={{
            headerStyle: { backgroundColor: COLORS.beige },
            headerShadowVisible: true,
            headerLeft: () => (
                <ScreenHeaderBtn 
                    iconUrl={images.home} 
                    dimension="100%" 
                    handlePress={() => changeComponent(<AdvertisementsList />)}
                />
            ),
            headerRight: () => (
                <ScreenHeaderBtn 
                    iconUrl={icons.menu} 
                    dimension="60%" 
                    handlePress={() => setMenuOpened(!menuOpened)}
                />
            ),
            headerTitle: "",
        }}
    />
  )
}

export default Header
