import React from 'react'
import ScreenHeaderBtn from './ScreenHeaderBtn'
import { icons, images, COLORS } from '../../constants'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import useAuth from '../../hooks/useAuth'
import { useSendLogoutMutation } from '../auth/authApiSlice'
import { useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import Home from '../../app/home'
import AdvertisementsList from '../../app/AdvertisementsList'
import { ScrollView } from 'react-native-gesture-handler'

const Stack = createNativeStackNavigator()

const Header = ({ navigation }) => {

    // POST request to clear the refreshtoken
    const [sendLogout, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useSendLogoutMutation()

    const { userId } = useAuth()

    const [menuOpened, setMenuOpened] = useState(false)

    const menu = (
        <View>

            {userId?.length 
                ? <View>
                    <TouchableOpacity style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>My Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>Inbox</Text>
                    </TouchableOpacity>
                </View>
                : <View>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('NewUserForm')} style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>Register</Text>
                    </TouchableOpacity>
                </View>
            }

            <TouchableOpacity style={styles.menuButton}>
                <Text style={styles.menuButtonText}>Dogs</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButton}>
                <Text style={styles.menuButtonText}>Litters</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButton}>
                <Text style={styles.menuButtonText}>Users</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButton}>
                <Text style={styles.menuButtonText}>FAQ</Text>
            </TouchableOpacity>

            {userId?.length 
                ? <TouchableOpacity onPress={() => sendLogout()} style={styles.menuButton}>
                    <Text style={styles.menuButtonText}>Logout</Text>
                </TouchableOpacity> 
                : null
            }

        </View>
    )

    return (
        <View>
            <Stack.Navigator
                initialRouteName='Home'
                screenOptions={{
                    headerStyle: { backgroundColor: COLORS.beige },
                    headerShadowVisible: true,
                    headerLeft: () => (
                        <ScreenHeaderBtn 
                            iconUrl={images.home} 
                            dimension="100%" 
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
            >
                <Stack.Screen name='Home' component={Home} />
            </Stack.Navigator>

            {menuOpened ? menu : null}
        </View>
    )
}

const styles = StyleSheet.create({
    menuButton: {
        height: 75,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'lightgrey',
    },
    menuButtonText: {
        fontWeight: 'bold',
    }
})

export default Header
