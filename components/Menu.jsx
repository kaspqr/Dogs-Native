import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import useAuth from '../hooks/useAuth'

const Menu = () => {

    const [menuOpened, setMenuOpened] = useState(false)
    const [component, setComponent] = useState(<AdvertisementsList />)

    const changeComponent = (newComponent) => {
        setComponent(newComponent)
        setMenuOpened(false)
    }

    const handleLogout = () => {
        changeComponent(<Logout />)
        setTimeout(() => changeComponent(<AdvertisementsList />), 50)
    }

    const { userId } = useAuth()

    return (
        <View>

            {userId?.length 
                ? <View>
                    <TouchableOpacity style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>My Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>Inbox</Text>
                    </TouchableOpacity>
                </View>
                : <View>
                    <TouchableOpacity onPress={() => {changeComponent(<Login />)}} style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {changeComponent(<NewUserForm />)}} style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>Register</Text>
                    </TouchableOpacity>
                </View>
            }

            <TouchableOpacity style={styles.menuButton}>
                <Text style={styles.menuButtonText}>Dogs</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButton}>
                <Text style={styles.menuButtonText}>Litters</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButton}>
                <Text style={styles.menuButtonText}>Users</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButton}>
                <Text style={styles.menuButtonText}>FAQ</Text>
            </TouchableOpacity>

            {userId?.length 
                ? <TouchableOpacity onPress={handleLogout} style={styles.menuButton}>
                    <Text style={styles.menuButtonText}>Logout</Text>
                </TouchableOpacity> 
                : null
            }

        </View>
    )
}

const styles = StyleSheet.create({
    menuButton: {
        height: 75,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'lightgrey',
    },
    menuButtonText: {
        fontWeight: 'bold',
    }
})

export default Menu
