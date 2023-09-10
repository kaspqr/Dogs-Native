import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import useAuth from '../hooks/useAuth'
import { useSendLogoutMutation } from '../components/auth/authApiSlice'

const MenuComponent = ({ navigation }) => {

    // POST request to clear the refreshtoken
    const [sendLogout, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useSendLogoutMutation()

    const { userId } = useAuth()

    return (
        
        <View>

            {userId?.length 
                ? <View>
                    <TouchableOpacity onPress={() => {navigation.navigate('UserPage', { id: userId })}} style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>My Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>Inbox</Text>
                    </TouchableOpacity>
                </View>
                : <View>
                    <TouchableOpacity onPress={() => {navigation.navigate('Login', { navigation })}} style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {navigation.navigate('NewUserForm', { navigation })}} style={styles.menuButton}>
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

            <TouchableOpacity onPress={() => navigation.navigate('UsersList', { navigation })} style={styles.menuButton}>
                <Text style={styles.menuButtonText}>Users</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Faq', { navigation })} style={styles.menuButton}>
                <Text style={styles.menuButtonText}>FAQ</Text>
            </TouchableOpacity>

            {userId?.length 
                ? <TouchableOpacity onPress={() => sendLogout()} style={styles.menuButton}>
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

export default MenuComponent
