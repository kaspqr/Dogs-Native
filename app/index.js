import { Stack } from "expo-router"
import { SafeAreaView, View, ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native"
import { COLORS, icons, images, SIZES } from "../constants"
import { ScreenHeaderBtn } from "../components"
import { useState } from "react"

import AdvertisementsList from "../components/advertisements/AdvertisementsList"
import Login from "../components/auth/Login"
import Logout from "../components/auth/Logout"

import { Provider } from "react-redux"
import { store } from "../store"

const Index = () => {

    const [menuOpened, setMenuOpened] = useState(false)
    const [component, setComponent] = useState(<AdvertisementsList />)

    const changeComponent = (newComponent) => {
        setComponent(newComponent)
        setMenuOpened(false)
    }

    const handleLogout = () => {
        changeComponent(<Logout />)
        setTimeout(() => changeComponent(<AdvertisementsList />), 50)
    }

    const content = (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View
                style={{
                    flex: 1,
                    padding: SIZES.medium
                }}
            >
            </View>
                {component}
        </ScrollView>
    )

    const menu = (
        <View>

            <TouchableOpacity onPress={() => {changeComponent(<Login />)}} style={styles.menuButton}>
                <Text style={styles.menuButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButton}>
                <Text style={styles.menuButtonText}>Inbox</Text>
            </TouchableOpacity>

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
                <Text style={styles.menuButtonText}>My Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButton}>
                <Text style={styles.menuButtonText}>FAQ</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout} style={styles.menuButton}>
                <Text style={styles.menuButtonText}>Logout</Text>
            </TouchableOpacity>

        </View>
    )

    return (
        <Provider store={store}>
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>

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

                {menuOpened ? menu : content}
                
            </SafeAreaView>
        </Provider>
    )
    // return <Stack />
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

export default Index
