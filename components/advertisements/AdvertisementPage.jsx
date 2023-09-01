import { useGetAdvertisementsQuery, useDeleteAdvertisementMutation } from "./advertisementsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import useAuth from "../../hooks/useAuth"
import { useState, useEffect } from "react"

import { View, Text, Image } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import styles from "../header/screenheader.style"

const AdvertisementPage = ({ advertisementId }) => {

    const { userId, isAdmin, isSuperAdmin } = useAuth()

    // State for checking how wide is the user's screen
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)

    // Function for handling the resizing of screen
    const handleResize = () => {
        setWindowWidth(window.innerWidth)
    }

    // Always check if a window is being resized
    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
        window.removeEventListener('resize', handleResize)
        }
    }, [])

    // GET the advertisement with all of it's .values
    const { advertisement } = useGetAdvertisementsQuery("advertisementsList", {
        selectFromResult: ({ data }) => ({
            advertisement: data?.entities[advertisementid]
        }),
    })

    // GET the user who is the poster of the advertisement with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[advertisement?.poster]
        }),
    })

    // DELETE method to delete the advertisement
    const [deleteAdvertisement, {
        isLoading: isDelLoading,
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteAdvertisementMutation()

    const handleAdminDelete = async () => {
        await deleteAdvertisement({ id: advertisement?.id })
    }

    if (!advertisement) {
        return (<Text>Advertisement doesn't exist</Text>)
    }

    if (isDelLoading) return (<Text>Loading...</Text>)
    if (isDelError) return (<Text>{delerror?.data?.message}</Text>)
    if (isDelSuccess) return

    return (
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
                    <Text>
                        <Text>
                            {advertisement?.title}
                        </Text>

                        <Text>
                            Posted by{' '}
                            <TouchableOpacity
                                onPress={() => {}}
                            >
                                {user?.username}
                            </TouchableOpacity>
                        </Text>

                    </Text>

                    {advertisement?.image?.length 
                        ? <Image src={advertisement?.image} />
                        : null
                    }

                    <Text>
                        {advertisement?.type}
                    </Text>

                    {advertisement?.type === 'Require Female Dog' || advertisement?.type === 'Require Male Dog' 
                        ? advertisement?.breed?.length 
                            ? (<Text>{advertisement?.breed }</Text>)
                            : (<Text>Any breed</Text>)
                        : null
                    }

                    {advertisement?.type !== "Found" && advertisement?.type !== "Lost" 
                        ? <Text>{advertisement?.currency}{advertisement?.price}</Text> 
                        : null
                    }

                    <Text>Location</Text>

                    <Text>
                        {advertisement?.region 
                            ? advertisement?.region + ', ' 
                            : null
                        }
                        
                        {advertisement?.country}
                    </Text>

                    <Text>Info</Text>

                    <Text>{advertisement?.info}</Text>

                    {userId === advertisement?.poster 
                        ? <View>
                            <TouchableOpacity 
                                onPress={() => {}}
                            >
                                Edit
                            </TouchableOpacity>
                        </View>
                        : null
                    }

                    {userId?.length && advertisement?.poster !== userId
                        ? <View><TouchableOpacity 
                            onPress={() => navigate(`/reportadvertisement/${advertisement?.id}`)}
                        >
                            Report Advertisement
                        </TouchableOpacity></View>
                        : null
                    }

                    {isAdmin || isSuperAdmin
                        ? <View><TouchableOpacity onPress={handleAdminDelete}>
                            Delete as Admin
                        </TouchableOpacity></View>
                        : null
                    }

                </View>

            </ScrollView>

        </SafeAreaView>
    )
}

export default AdvertisementPage
