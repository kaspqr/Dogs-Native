import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import useAuth from '../hooks/useAuth'
import { useSendLogoutMutation } from '../components/auth/authApiSlice'
import { COLORS } from '../constants'

const MenuComponent = ({ navigation }) => {

    // POST request to clear the refreshtoken
    const [sendLogout, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useSendLogoutMutation()

    const { userId, isAdmin, isSuperAdmin } = useAuth()

    return (
        
        <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>

            {userId?.length 
                ? <View>
                    <TouchableOpacity onPress={() => {navigation.navigate('UserPage', { id: userId })}} style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>My Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('ConversationsList')}>
                        <Text style={styles.menuButtonText}>Inbox</Text>
                    </TouchableOpacity>
                </View>
                : <View>
                    <TouchableOpacity onPress={() => {navigation.navigate('Login')}} style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {navigation.navigate('NewUserForm')}} style={styles.menuButton}>
                        <Text style={styles.menuButtonText}>Register</Text>
                    </TouchableOpacity>
                </View>
            }

            <TouchableOpacity onPress={() => navigation.navigate('DogsList')} style={styles.menuButton}>
                <Text style={styles.menuButtonText}>Dogs</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('LittersList')} style={styles.menuButton}>
                <Text style={styles.menuButtonText}>Litters</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('UsersList')} style={styles.menuButton}>
                <Text style={styles.menuButtonText}>Users</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Faq')} style={styles.menuButton}>
                <Text style={styles.menuButtonText}>FAQ</Text>
            </TouchableOpacity>

            {isAdmin === true || isSuperAdmin === true ? (
                <TouchableOpacity onPress={() => navigation.navigate('AdminPage')} style={styles.menuButton}>
                    <Text style={styles.menuButtonText}>Admin Panel</Text>
                </TouchableOpacity>
            ) : null}

            {userId?.length 
                ? <TouchableOpacity onPress={() => sendLogout()} style={styles.menuButton}>
                    <Text style={styles.menuButtonText}>Logout</Text>
                </TouchableOpacity> 
                : null
            }

        </ScrollView>
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
