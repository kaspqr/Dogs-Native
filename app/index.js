import { useState } from "react"
import { View, ScrollView, SafeAreaView } from "react-native"
import { Stack, useRouter } from "expo-router"

import { COLORS, icons, images, SIZES } from "../constants"
import { ScreenHeaderBtn } from "../components"

import { Provider } from "react-redux"
import { store } from "./store"

import AdvertisementsList from "../components/advertisements/AdvertisementsList"

const Home = () => {
    const router = useRouter()

    return (
        <Provider store={store}>
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
                <Stack.Screen 
                    options={{
                        headerStyle: { backgroundColor: COLORS.beige },
                        headerShadowVisible: true,
                        headerLeft: () => (
                            <ScreenHeaderBtn iconUrl={images.home} dimension="100%" />
                        ),
                        headerRight: () => (
                            <ScreenHeaderBtn iconUrl={icons.menu} dimension="60%" />
                        ),
                        headerTitle: "",
                    }}
                />

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View
                        style={{
                            flex: 1,
                            padding: SIZES.medium
                        }}
                    >
                    </View>
                        <AdvertisementsList />
                </ScrollView>
            </SafeAreaView>
        </Provider>
    )
}

export default Home
