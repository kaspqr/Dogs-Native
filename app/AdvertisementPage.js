import { useGetAdvertisementsQuery, useDeleteAdvertisementMutation } from "../components/advertisements/advertisementsApiSlice"
import { useGetUsersQuery } from "../components/users/usersApiSlice"
import useAuth from "../hooks/useAuth"

import { View, Text, Image, ScrollView, StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { COLORS } from "../constants"

const AdvertisementPage = ({ route, navigation }) => {

    const { advertisementId } = route.params

    const { userId, isAdmin, isSuperAdmin } = useAuth()

    // GET the advertisement with all of it's .values
    const { advertisement } = useGetAdvertisementsQuery("advertisementsList", {
        selectFromResult: ({ data }) => ({
            advertisement: data?.entities[advertisementId]
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
                        onPress={() => navigation.navigate('UserPage', { id: advertisement?.poster, navigation })}
                    >
                        <Text style={{ fontWeight: 'bold', color: 'orange' }}>{user?.username}</Text>
                    </TouchableOpacity>
                </View>

                {advertisement?.image?.length 
                    ? <View style={{ marginTop: 10 }}>
                        <Image style={{ width: 300, height: 300, borderRadius: 5 }} source={{ uri: `${advertisement?.image}`}} />
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
                            onPress={() => navigation.navigate('EditAdvertisementForm', { advertisementId, navigation })}
                        >
                            <Text style={styles.buttonText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                    : null
                }

                {userId?.length && advertisement?.poster !== userId
                    ? <View style={{ marginTop: 10 }}><TouchableOpacity 
                        onPress={() => navigate(`/reportadvertisement/${advertisement?.id}`)}
                    >
                        <Text>Report Advertisement</Text>
                    </TouchableOpacity></View>
                    : null
                }

                {isAdmin || isSuperAdmin
                    ? <View style={{ marginTop: 10 }}><TouchableOpacity onPress={handleAdminDelete}>
                        <Text>Delete as Admin</Text>
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
