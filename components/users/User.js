import { useGetUsersQuery } from "./usersApiSlice"
import { memo } from "react"
import UserIcon from "../../assets/images/UserIcon.jpg"
import { View, Image, Text, StyleSheet } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"

const User = ({ userId, navigation }) => {

    // GET the user with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[userId]
        }),
    })

    if (user) {
        return (
            <View style={styles.userView}>
                <View>
                    {user?.image?.length 
                        ? <Image style={styles.userPicture} source={{ uri: `${user.image}` }} />
                        : <Image style={styles.userPicture} source={UserIcon} />
                    }
                </View>
                <View>
                    <TouchableOpacity onPress={() => navigation.navigate('UserPage', { id: user?.id, navigation })}>
                        <Text style={styles.orangeLink}>{user?.username}</Text>
                    </TouchableOpacity>
                    <Text>{user?.name}</Text>
                    <Text>{user?.region?.length && user?.region !== 'none ' ? `${user?.region}, ` : null}{user?.country}</Text>
                </View>
            </View>
        )
    } else return null
}

const styles = StyleSheet.create({
    userPicture: {
        width: 76,
        height: 76,
        marginRight: 10,
        borderRadius: 38,
    },
    userView: {
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

const memoizedUser = memo(User)

export default memoizedUser
