import { useGetAdvertisementsQuery } from "./advertisementsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { memo, useState, useEffect } from "react"
import AdIcon from "../../assets/images/AdIcon.jpg"
import navigationService from "../../app/navigationService"
import { View, Text, Image, StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'

const Advertisement = ({ advertisementId }) => {

    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

    // GET the advertisement in props with all of it's .values
    const { advertisement } = useGetAdvertisementsQuery("advertisementsList", {
        selectFromResult: ({ data }) => ({
            advertisement: data?.entities[advertisementId]
        }),
    })

    useEffect(() => {

        if (advertisement?.image?.length) {
            // Get the screen width
            const maxPixels = 150
        
            // Use Image.getSize to get the original image dimensions
            Image.getSize(advertisement?.image, (originalWidth, originalHeight) => {
                
                const aspectRatio = originalWidth / originalHeight
                const calculatedPixels = maxPixels / aspectRatio

                setImageDimensions(originalWidth > originalHeight 
                    ? { width: maxPixels, height: calculatedPixels } 
                    : { width: (maxPixels * aspectRatio), height: maxPixels }
                )
            })   
        }
    }, [advertisement?.image?.length])

    // GET the user who is the poster of the advertisement with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[advertisement?.poster]
        }),
    })

    const id = user?.id

    if (!advertisement) {
        return null
    }

    return (
        <View style={styles.adView}>

            <View style={{ justifyContent: 'center', alignItems: 'center', width: 160 }}>
                {advertisement?.image?.length 
                    ? <Image 
                        style={[styles.adPicture, { width: imageDimensions.width, height: imageDimensions.height }]} 
                        source={{ uri: `${advertisement.image}` }} 
                    />
                    : <Image 
                        style={[styles.adPicture, { width: 150, height: 150 }]} 
                        source={AdIcon} 
                    />
                }
            </View>

            <View>

                <Text>

                    <TouchableOpacity 
                        onPress={() => navigationService.navigate('AdvertisementPage', { advertisementId })}
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

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                    <Text>Posted by{' '}</Text>

                    <TouchableOpacity onPress={() => {navigationService.navigate('UserPage', { id })}}>
                        <Text style={[styles.orangeLink]}>{user?.username}</Text>
                    </TouchableOpacity>

                </View>

            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    adPicture: {
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

const memoizedAdvertisement = memo(Advertisement)

export default memoizedAdvertisement
