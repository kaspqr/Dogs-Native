import { useGetDogsQuery } from "./dogsApiSlice"
import { memo } from "react"
import DogIcon from "../../assets/images/DogIcon.jpg"

import { View, Image, Text, StyleSheet } from "react-native"

const UserDog = ({ dogId }) => {

    // GET the dog with all of it's .values
    const { dog } = useGetDogsQuery("dogsList", {
        selectFromResult: ({ data }) => ({
            dog: data?.entities[dogId]
        }),
    })

    if (!dog) return null

    return (
        <View>
            <View>
                {dog?.image?.length 
                    ? <Image style={{width: 150, height: 150, borderRadius: 75}} source={{ uri: `${dog?.image}`}} />
                    : <Image style={{width: 150, height: 150, borderRadius: 75}} source={DogIcon} />
                }
            </View>
            <View className="dog-div-info">
                <Text style={styles.orangeLink}>{dog.name}</Text>

                <Text>{dog.breed}</Text>
                <Text>{dog.female === true ? 'Good Girl' : 'Good Boy'}</Text>
                <Text>Born {dog.birth.split(' ').slice(1, 4).join(' ')}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    orangeLink: {
        color: 'orange',
    },
})

const memoizedUserDog = memo(UserDog)

export default memoizedUserDog
