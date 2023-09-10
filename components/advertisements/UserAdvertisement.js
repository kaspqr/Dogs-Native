import { useGetAdvertisementsQuery } from "./advertisementsApiSlice"
import { memo } from "react"
import AdIcon from "../../assets/images/AdIcon.jpg"

import { View, Image, Text } from "react-native"

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
        <View>
            <View>
                {advertisement?.image?.length 
                    ? <Image style={{width: 150, height: 150, borderRadius: 75}} source={{ uri: `${advertisement?.image}`}} />
                    : <Image style={{width: 150, height: 150, borderRadius: 75}} source={AdIcon} />
                }
            </View>
            
            <View>
                <Text>{advertisement?.title}</Text>

                <Text>{advertisement?.type}</Text>

                <Text>{advertisement?.type === 'Require Female Dog' || advertisement?.type === 'Require Male Dog' 
                    ? advertisement?.breed : null}
                </Text>

                {advertisement?.type !== 'Found' && advertisement?.type !== 'Lost' 
                    ? <Text>{advertisement?.currency}{advertisement?.price}</Text> 
                    : null
                }

                <Text>{advertisement?.region?.length && advertisement?.region !== 'none ' 
                    ? `${advertisement?.region}, ` : null}{advertisement?.country}
                </Text>

            </View>
        </View>
    )
}

const memoizedUserAdvertisement = memo(UserAdvertisement)

export default memoizedUserAdvertisement
