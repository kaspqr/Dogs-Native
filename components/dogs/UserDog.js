import { useGetDogsQuery } from "./dogsApiSlice"
import { memo } from "react"
import DogIcon from "../../assets/images/DogIcon.jpg"

import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native"

const UserDog = ({ dogId }) => {

    // GET the dog with all of it's .values
    const { dog } = useGetDogsQuery("dogsList", {
        selectFromResult: ({ data }) => ({
            dog: data?.entities[dogId]
        }),
    })

    if (!dog) return null

    return (
        <View style={styles.dogView}>

            <View>
                {dog?.image?.length 
                    ? <Image style={styles.dogPicture} source={{ uri: `${dog?.image}`}} />
                    : <Image style={styles.dogPicture} source={DogIcon} />
                }
            </View>

            <View>
                <TouchableOpacity>
                    <Text style={styles.orangeLink}>{dog.name}</Text>
                </TouchableOpacity>
                
                <Text>{dog.breed}</Text>
                <Text>{dog.female === true ? 'Good Girl' : 'Good Boy'}</Text>
                <Text>Born {dog.birth.split(' ').slice(1, 4).join(' ')}</Text>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    dogPicture: {
        width: 150,
        height: 150,
        marginRight: 10,
        borderRadius: 75,
    },
    dogView: {
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

const memoizedUserDog = memo(UserDog)

export default memoizedUserDog
