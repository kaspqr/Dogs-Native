import { useState, useEffect } from "react"
import { useAddNewUserMutation } from "../components/users/usersApiSlice"
import useAuth from "../hooks/useAuth"
import { Countries } from "../assets/countries"
import { bigCountries } from "../assets/bigCountries"
import { Regions } from "../assets/regions"

import { Text, TextInput, TouchableOpacity, View, StyleSheet, ScrollView } from "react-native"
import RNPickerSelect from 'react-native-picker-select'

import { COLORS } from "../constants"

const NewUserForm = () => {

    const USERNAME_REGEX = /^[A-z0-9]{6,20}$/
    const NAME_REGEX = /^(?=.{1,30}$)[a-zA-Z]+(?: [a-zA-Z]+)*$/
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const PASSWORD_REGEX = /^[A-z0-9!@#%]{8,20}$/

    const auth = useAuth()

    // POST method for registering a new user
    const [addNewUser, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useAddNewUserMutation()

    const [username, setUsername] = useState('')
    const [validUsername, setValidUsername] = useState(false)
    const [password, setPassword] = useState('')
    const [validPassword, setValidPassword] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState('')
    const [name, setName] = useState('')
    const [validName, setValidName] = useState(false)
    const [email, setEmail] = useState('')
    const [validEmail, setValidEmail] = useState(false)
    const [country, setCountry] = useState('Argentina')
    const [region, setRegion] = useState('')
    const [bio, setBio] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    useEffect(() => {
        setValidUsername(USERNAME_REGEX.test(username))
    }, [username])

    useEffect(() => {
        setValidPassword(PASSWORD_REGEX.test(password))
    }, [password])

    useEffect(() => {
        setValidName(NAME_REGEX.test(name))
    }, [name])

    useEffect(() => {
        setValidEmail(EMAIL_REGEX.test(email))
    }, [email])

    // Clear the inputs if a user was POSTed successfully
    useEffect(() => {
        if (isSuccess) {
            setUsername('')
            setPassword('')
            setConfirmPassword('')
            setName('')
            setEmail('')
            setCountry('')
            setRegion('')
            setBio('')
            setSuccessMsg('A verification link has been sent to your email. Please check the Spam folder if you cannot find it in your Primary emails. You will be able to log in once your account is verified.')
        }
    }, [isSuccess])

    const handleUsernameChanged = value => setUsername(value)
    const handlePasswordChanged = value => setPassword(value)
    const handleConfirmPasswordChanged = value => setConfirmPassword(value)
    const handleNameChanged = value => setName(value)
    const handleEmailChanged = value => setEmail(value)
    const handleBioChanged = value => setBio(value)

    // Boolean to control the style and 'disabled' value of the SAVE button
    const canSave = [validUsername, validPassword, validName, validEmail].every(Boolean) && password === confirmPassword && !isLoading

    const handleSaveUserClicked = async () => {
        if (canSave) {
            // POST the user
            await addNewUser({ username, password, name, email, country, region, bio })
        }
    }

    if (auth?.username?.length) {
        return <Text>You are currently logged in. Please logout before registering a new user.</Text>
    }

    if (isLoading) return <Text>Loading...</Text>

    const content = successMsg?.length ? <Text style={styles.successMsg}>{successMsg}</Text> :
    <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
        <View style={styles.mainView}>
            {isError ? <Text style={styles.errMsg}>{error?.data?.message}</Text> : null}

            <Text style={styles.inputTitle}>Fields marked with * are required</Text>
            
            <Text style={styles.inputTitle}>Username (6-20 Letters and/or Numbers)*</Text>

            <TextInput 
                style={styles.textInputWide}
                value={username}
                onChangeText={handleUsernameChanged}
            />

            <Text style={styles.inputTitle}>Password (8-20 Characters, Optionally Including !@#%)*</Text>

            <TextInput 
                style={styles.textInputWide}
                secureTextEntry={true}
                value={password}
                onChangeText={handlePasswordChanged}
            />

            <Text style={styles.inputTitle}>Confirm Password*</Text>

            <TextInput 
                style={styles.textInputWide}
                secureTextEntry={true}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChanged}
            />

            <Text style={styles.inputTitle}>Email*</Text>

            <TextInput 
                style={styles.textInputWide}
                value={email}
                onChangeText={handleEmailChanged}
            />

            <Text style={styles.inputTitle}>Name*</Text>

            <TextInput 
                value={name}
                style={styles.textInputWide}
                onChangeText={handleNameChanged}
            />

            <Text style={styles.inputTitle}>Country*</Text>

            <View style={styles.selectInputWide}>
                <RNPickerSelect 
                    value={country}
                    items={Countries}
                    onValueChange={(value) => {
                        setRegion('')
                        setCountry(value)
                    }}
                />
            </View>

            <Text style={styles.inputTitle}>Region</Text>

            <View style={styles.selectInputWide}>
                <RNPickerSelect 
                    disabled={!bigCountries?.includes(country)}
                    placeholder={{ label: '--', value: '' }} 
                    items={bigCountries?.includes(country) ? Regions[country] : []}
                    value={region}
                    onValueChange={(value) => setRegion(value)}
                />
            </View>

            <Text style={styles.inputTitle}>Bio</Text>

            <TextInput 
                style={styles.textInputWide}
                multiline={true}
                numberOfLines={5}
                maxLength={500}
                value={bio}
                onChangeText={handleBioChanged}
            />

            <View>
                <TouchableOpacity
                    onPress={handleSaveUserClicked}
                    disabled={!canSave}
                    style={!canSave ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                >
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
            </View>
        </View>
    </ScrollView>

    return content
}

const styles = StyleSheet.create({
    mainView: {
        marginHorizontal: 10,
        marginBottom: 30,
        marginTop: 10,
    },
    blackButtonWide: {
        backgroundColor: '#000000',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    greyButton: {
        backgroundColor: 'lightgrey',
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    textInputWide: {
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 5,
        paddingVertical: 13,
        marginBottom: 10,
    },
    selectInputWide: {
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
    },
    inputTitle: {
        fontWeight: 'bold',
    },
    errMsg: {
        color: 'red',
    },
    successMsg: {
        color: 'green',
        marginHorizontal: 10,
        fontWeight: 'bold',
    },
})

export default NewUserForm
