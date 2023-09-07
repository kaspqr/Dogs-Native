import { useGetAdvertisementsQuery } from "./advertisementsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { memo } from "react"
import AdIcon from "../../assets/images/AdIcon.jpg"

import { View, Text, Image, StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'

const styles = StyleSheet.create({
    adPicture: {
        width: 150,
        height: 150,
        marginRight: 10,
        borderRadius: 5,
    },
    adView: {
        flexDirection: 'row',
        wordWrap: 'wrap',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#d3d3d3',
        padding: 10,
        marginTop: 5,
        marginBottom: 5,
    },
    orangeLink: {
        color: '#eb9b34',
        fontWeight: 'bold',
    }
})

const Advertisement = ({ advertisementId }) => {

    // GET the advertisement in props with all of it's .values
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

    if (!advertisement) {
        return null
    }

    return (
        <View style={styles.adView}>

            <View>
                {advertisement?.image?.length 
                    ? <Image style={styles.adPicture} source={{ uri: `${advertisement.image}` }} />
                    : <Image style={styles.adPicture} source={AdIcon} />
                }
            </View>

            <View>

                <Text>

                    <TouchableOpacity 
                        onPress={() => {}}
                    >
                        <Text style={styles.orangeLink}>{advertisement?.title}</Text>
                    </TouchableOpacity>

                </Text>

                <Text>{advertisement?.type}</Text>

                <Text>
                    {advertisement?.type === 'Require Female Dog' || advertisement?.type === 'Require Male Dog' 
                        ? <Text>{advertisement?.breed}</Text>
                        : null
                    }
                </Text>

                <Text>
                    {advertisement?.type !== 'Found' && advertisement?.type !== 'Lost' 
                        ? <Text style={{ fontWeight: 'bold' }}>{advertisement?.currency}{advertisement?.price}</Text>
                        : null
                    }
                </Text>

                <Text>
                    {advertisement?.region?.length && advertisement?.region !== 'none ' 
                        ? (<Text>{advertisement?.region}, </Text>)
                        : null
                    }

                    <Text>{advertisement?.country}</Text>
                </Text>

                <Text>

                    <Text>Posted by{' '}</Text>
                    <TouchableOpacity 
                        onPress={() => {}}
                    >
                        <Text style={styles.orangeLink}>{user?.username}</Text>
                    </TouchableOpacity>

                </Text>

            </View>

        </View>
    )
}

const memoizedAdvertisement = memo(Advertisement)

export default memoizedAdvertisement
