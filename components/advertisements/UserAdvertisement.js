import { useGetAdvertisementsQuery } from "./advertisementsApiSlice"
import { memo } from "react"
import AdIcon from "../../assets/images/AdIcon.jpg"

import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native"

const UserAdvertisement = ({ advertisementId }) => {

    // GET the advertisement in props with all of it's .values
    const { advertisement } = useGetAdvertisementsQuery("advertisementsList", {
        selectFromResult: ({ data }) => ({
            advertisement: data?.entities[advertisementId]
        }),
    })

    if (!advertisement) {
        return null
    }

    return (
        <View style={styles.adView}>
            <View>
                {advertisement?.image?.length 
                    ? <Image style={styles.adPicture} source={{ uri: `${advertisement?.image}`}} />
                    : <Image style={styles.adPicture} source={AdIcon} />
                }
            </View>
            
            <View>
                <TouchableOpacity>
                    <Text style={styles.orangeLink}>{advertisement?.title}</Text>
                </TouchableOpacity>

                <Text>{advertisement?.type}</Text>

                {advertisement?.type === 'Require Female Dog' || advertisement?.type === 'Require Male Dog' 
                    ? <Text>{advertisement?.breed}</Text> 
                    : null
                }
                

                {advertisement?.type !== 'Found' && advertisement?.type !== 'Lost' 
                    ? <Text style={{ fontWeight: 'bold' }}>{advertisement?.currency}{advertisement?.price}</Text> 
                    : null
                }

                <Text>{advertisement?.region?.length && advertisement?.region !== 'none ' 
                    ? `${advertisement?.region}, ` : null}{advertisement?.country}
                </Text>

            </View>
        </View>
    )
}

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

const memoizedUserAdvertisement = memo(UserAdvertisement)

export default memoizedUserAdvertisement
