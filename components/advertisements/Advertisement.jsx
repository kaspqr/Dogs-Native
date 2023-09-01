import { useGetAdvertisementsQuery } from "./advertisementsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { memo } from "react"
import AdIcon from "../../assets/images/AdIcon.jpg"

import { View, Text, Image } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import styles from "../header/screenheader.style"

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
        <View style={styles.advertisementContainer}>

            <View style={styles.advertisementImage}>
                {advertisement?.image?.length 
                    ? (<Image source={{ uri: advertisement?.image }} />)
                    : (<Image source={AdIcon} />)
                }
            </View>

            <View style={styles.advertisementInfo}>

                <Text>

                    <TouchableOpacity 
                        onPress={() => {}}
                    >
                        <Text style={styles.orangeLink}>
                            {advertisement?.title}
                        </Text>
                    </TouchableOpacity>

                </Text>

                <Text style={styles.bold}>
                    {advertisement?.type}
                </Text>

                <Text>
                    {advertisement?.type === 'Require Female Dog' || advertisement?.type === 'Require Male Dog' 
                        ? (<Text>{advertisement?.breed}</Text>) 
                        : null
                    }
                </Text>

                <Text>
                    {advertisement?.type !== 'Found' && advertisement?.type !== 'Lost' 
                        ? (<Text>{advertisement?.currency}{advertisement?.price}</Text>)
                        : null
                    }
                </Text>

                <Text>
                    {advertisement?.region?.length && advertisement?.region !== 'none ' 
                        ? (<Text>{advertisement?.region}, </Text>)
                        : null
                    }

                    (<Text>
                        {advertisement?.country}
                    </Text>)
                </Text>

                <Text>

                    Posted by{' '}
                    <TouchableOpacity 
                        onPress={() => {}}
                    >
                        (<Text>{user?.username}</Text>)
                    </TouchableOpacity>

                </Text>

            </View>

        </View>
    )
}

const memoizedAdvertisement = memo(Advertisement)

export default memoizedAdvertisement
