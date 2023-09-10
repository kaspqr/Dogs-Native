import Index from './index'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import React from 'react'

const Stack = createNativeStackNavigator()

const Layout = () => {

  /* return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen 
        name="index" 
        component={Index} 
      />
    </Stack.Navigator>
  ) */

  return <Index />
}

export default Layout
