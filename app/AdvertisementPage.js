import { useGetAdvertisementsQuery, useDeleteAdvertisementMutation } from "../components/advertisements/advertisementsApiSlice"
import { useGetUsersQuery } from "../components/users/usersApiSlice"
import useAuth from "../hooks/useAuth"
import { View, Text, Image, ScrollView, StyleSheet, Dimensions } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { COLORS } from "../constants"
import { useState, useEffect } from "react"

const AdvertisementPage = ({ route, navigation }) => {

    const { advertisementId } = route.params

    const { userId, isAdmin, isSuperAdmin } = useAuth()

    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

    // GET the advertisement with all of it's .values
    const { advertisement } = useGetAdvertisementsQuery("advertisementsList", {
        selectFromResult: ({ data }) => ({
            advertisement: data?.entities[advertisementId]
        }),
    })

    useEffect(() => {

        if (advertisement?.image?.length) {
            // Get the screen width
            const screenWidth = Dimensions.get('window').width - 20
        
            // Use Image.getSize to get the original image dimensions
            Image.getSize(advertisement?.image, (originalWidth, originalHeight) => {
            // Calculate the height while maintaining the aspect ratio
            const aspectRatio = originalWidth / originalHeight
            const calculatedHeight = screenWidth / aspectRatio
        
            setImageDimensions({ width: screenWidth, height: calculatedHeight })
            })   
        }
    }, [advertisement?.image?.length])

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
        return <Text style={{ margin: 10 }}>Advertisement doesn't exist</Text>
    }

    if (isDelLoading) return <Text style={{ margin: 10 }}>Loading...</Text>
    if (isDelError) return <Text style={{ margin: 10 }}>{delerror?.data?.message}</Text>
    if (isDelSuccess) navigation.navigate('AdvertisementsList')

    return (
        <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>

            <View style={styles.mainView}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                    {advertisement?.title}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text>Posted by{' '}</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('UserPage', { id: advertisement?.poster })}
                    >
                        <Text style={{ fontWeight: 'bold', color: 'orange' }}>{user?.username}</Text>
                    </TouchableOpacity>
                </View>

                {advertisement?.image?.length 
                    ? <View style={{ marginTop: 10 }}>
                        <Image style={{ width: imageDimensions.width, height: imageDimensions.height, borderRadius: 5 }} source={{ uri: `${advertisement?.image}`}} />
                    </View>
                    : null
                }

                <Text style={{ marginTop: 10, fontWeight: 'bold' }}>{advertisement?.type}</Text>

                {advertisement?.type === 'Require Female Dog' || advertisement?.type === 'Require Male Dog' 
                    ? advertisement?.breed?.length 
                        ? <Text>{advertisement?.breed }</Text>
                        : <Text>Any breed</Text>
                    : null
                }

                {advertisement?.type !== "Found" && advertisement?.type !== "Lost" 
                    ? <Text>{advertisement?.currency}{advertisement?.price}</Text> 
                    : null
                }

                <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Location</Text>

                <Text>
                    {advertisement?.region 
                        ? advertisement?.region + ', ' 
                        : null
                    }
                    
                    {advertisement?.country}
                </Text>

                <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Info</Text>

                <Text>{advertisement?.info}</Text>

                {userId === advertisement?.poster 
                    ? <View style={{ marginTop: 10 }}>
                        <TouchableOpacity 
                            style={styles.blackButtonWide}
                            onPress={() => navigation.navigate('EditAdvertisementForm', { advertisementId })}
                        >
                            <Text style={styles.buttonText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    : null
                }

                {userId?.length && advertisement?.poster !== userId
                    ? <View style={{ marginTop: 10 }}><TouchableOpacity style={styles.blackButtonWide}
                        onPress={() => navigation.navigate('AdvertisementReportPage', { advertisementid: advertisement?.id })}
                    >
                        <Text style={styles.buttonText}>Report Advertisement</Text>
                    </TouchableOpacity></View>
                    : null
                }

                {isAdmin || isSuperAdmin
                    ? <View><TouchableOpacity style={styles.blackButtonWide} onPress={handleAdminDelete}>
                        <Text style={styles.buttonText}>Delete as Admin</Text>
                    </TouchableOpacity></View>
                    : null
                }

            </View>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    blackButtonWide: {
        backgroundColor: '#000000',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    mainView: {
        marginHorizontal: 10,
        marginBottom: 30,
        marginTop: 10,
    },
})

export default AdvertisementPage
