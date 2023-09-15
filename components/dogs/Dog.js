import { useGetDogsQuery } from "./dogsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { memo } from "react"
import DogIcon from "../../assets/images/DogIcon.jpg"
import { Image, Text, TouchableOpacity, StyleSheet, View } from "react-native"
import navigationService from "../../app/navigationService"

const Dog = ({ dogId }) => {

    // GET the dog with all of it's .values
    const { dog } = useGetDogsQuery("dogsList", {
        selectFromResult: ({ data }) => ({
            dog: data?.entities[dogId]
        }),
    })

    // GET the user who administrates the dog with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[dog?.user]
        }),
    })

    if (!dog) return <Text style={{ margin: 10 }}>Dog not found</Text>

    return (
        <View style={styles.dogView}>
            <View>
                <Image 
                    style={styles.dogPicture} 
                    source={dog?.image?.length ? { uri: `${dog?.image}`} : DogIcon} 
                />
            </View>

            <View>
                <View>
                    <TouchableOpacity onPress={() => navigationService.navigate('DogPage', { dogid: dogId })}>
                        <Text style={styles.orangeLink}>
                            {dog.name}
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text>{dog.breed}</Text>
                <Text>Good{dog.female === true ? ' Girl' : ' Boy'}</Text>
                <Text>Born {dog.birth?.split(' ').slice(1, 4).join(' ')}</Text>

                <View>
                    <Text>Administered by{' '}</Text>
                    <TouchableOpacity onPress={() => navigationService.navigate('UserPage', { id: user?.id })}>
                        <Text style={styles.orangeLink}>{user?.username}</Text>
                    </TouchableOpacity>
                </View>

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

const memoizedDog = memo(Dog)

export default memoizedDog
