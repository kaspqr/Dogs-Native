import { useState, useEffect } from "react"
import { useUpdateUserMutation, useDeleteUserMutation, useGetUsersQuery } from "../components/users/usersApiSlice"
import { useSendLogoutMutation } from "../components/auth/authApiSlice"
import { Countries } from "../assets/countries"
import { bigCountries } from "../assets/bigCountries"
import { Regions } from "../assets/regions"
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, TextInput } from "react-native"
import RNPickerSelect from 'react-native-picker-select'
import * as ImagePicker from 'expo-image-picker'
import { COLORS } from "../constants"
import { backendApi } from "./api/apiSlice"

const EditUserForm = ({ route, navigation }) => {

    // GET the user whose page we're on with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[route.params.user]
        }),
    })

    // PATCH function for updating the user
    const [updateUser, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useUpdateUserMutation()

    // DELETE function for deleting the user
    const [deleteUser, {
        isLoading: isDelLoading,
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteUserMutation()

    // POST request to clear the refreshtoken
    const [sendLogout, {
        isLoading: isLogoutLoading,
        isSuccess: isLogoutSuccess,
        isError: isLogoutError,
        error: logoutError
    }] = useSendLogoutMutation()

    const NAME_REGEX = /^(?=.{1,30}$)[a-zA-Z]+(?: [a-zA-Z]+)*$/
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const PASSWORD_REGEX = /^[A-z0-9!@#%]{8,20}$/

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [name, setName] = useState(user?.name)
    const [email, setEmail] = useState('')
    const [confirmEmail, setConfirmEmail] = useState('')
    const [bio, setBio] = useState(user?.bio !== 'none ' ? user?.bio : '')
    const [country, setCountry] = useState(user?.country)
    const [region, setRegion] = useState(user?.region?.length ? user?.region : '')
    const [changePasswordError, setChangePasswordError] = useState('')
    const [previewSource, setPreviewSource] = useState(null)
    const [base64Value, setBase64Value] = useState(null)
    const [uploadMessage, setUploadMessage] = useState('')
    const [uploadLoading, setUploadLoading] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState('')
    const [deletionVisible, setDeletionVisible] = useState(false)

    // Clear the inputs if the user has been updated or deleted successfully
    useEffect(() => {
        if (isSuccess || isDelSuccess) {
            setPassword('')
            setConfirmPassword('')
            setName('')
            setEmail('')
            setCountry('')
            setRegion('')
            setBio('')
            navigation.navigate('UsersList')
        }
    }, [isSuccess, isDelSuccess])

    const handlePasswordChanged = value => setPassword(value)
    const handleConfirmPasswordChanged = value => setConfirmPassword(value)
    const handleCurrentPasswordChanged = value => setCurrentPassword(value)
    const handleNameChanged = value => setName(value)
    const handleEmailChanged = value => setEmail(value)
    const handleConfirmEmailChanged = value => setConfirmEmail(value)
    const handleBioChanged = value => setBio(value)

    const handleCountryChanged = value => {
        setRegion('none ')
        setCountry(value)
    }

    // PATCH the user
    const handleSaveUserClicked = async () => {
        setChangePasswordError('')

        const finalBio = bio?.length ? bio : 'none '

        if (password?.length) {
            if (password !== confirmPassword) {
                setChangePasswordError("New Password doesn't match with Confirm Password")
            }
            await updateUser({ id: user?.id, password, name, email, country, region, currentPassword, bio: finalBio })
        } else {
            await updateUser({ id: user?.id, name, email, country, region, currentPassword, bio: finalBio })
        }
    }

    // DELETE the user
    const handleDeleteUserClicked = async () => {
        const response = await deleteUser({ id: user?.id, currentPassword })

        if (!response?.error) {
            sendLogout()
        }
    }

    // Function to handle image selection
    const handleFileClicked = async () => {
        setUploadMessage('')

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            base64: true,
        })

        if (!result.canceled) {
            setPreviewSource(result.assets[0].uri)
            setBase64Value('data:image/jpeg;base64,' + result.assets[0].base64)
        }
    }

    const uploadImage = async (base64EncodedImage) => {
        setUploadLoading(true)

        try {
            setUploadMessage('')
            await fetch(`${backendApi}/userimages`, {
                method: 'POST',
                body: JSON.stringify({ 
                    data: base64EncodedImage,
                    user_id: `${user?.id}`
                }),
                headers: {'Content-type': 'application/json'}
            })

            setPreviewSource(null)
            setUploadMessage('Profile Picture Updated!')
        } catch (error) {
            console.error(error)
            setUploadMessage('Something went wrong')
        }

        setUploadLoading(false)
    }

    const handleSubmitFile = () => {
        if (!base64Value) return
        return uploadImage(base64Value)
    }

    useEffect(() => {
        if (isLogoutSuccess) navigation.navigate('AdvertisementsList')
    }, [isLogoutSuccess, navigation])

    if (isLoading || isDelLoading || isLogoutLoading) return <Text style={{ margin: 10 }}>Loading...</Text>

    const errContent = isError 
        ? error?.data?.message
        : isDelError
            ? delerror?.data?.message 
            : isLogoutError
                ? logoutError
                : ''

    const canSave = currentPassword?.length && NAME_REGEX.test(name) && email !== user?.email
        && ((EMAIL_REGEX.test(email) && email === confirmEmail) || !email?.length)
        && ((!password?.length && !confirmPassword?.length) || (PASSWORD_REGEX.test(password) && password === confirmPassword))

    const content = (
        <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
            <View style={styles.mainView}>
                {changePasswordError?.length ? <Text>{changePasswordError}</Text> : null}
                {errContent?.length ? <Text>{errContent}</Text> : null}

                <Text style={{ fontSize: 20, marginBottom: 15, fontWeight: 'bold' }}>Edit Profile</Text>

                <View>
                    <TouchableOpacity style={styles.blackButtonWide} onPress={() => handleFileClicked()}>
                        <Text style={styles.buttonText}>Browse Profile Picture</Text>
                    </TouchableOpacity>
                </View>

                <View>
                    <TouchableOpacity 
                        onPress={handleSubmitFile}
                        disabled={!previewSource || uploadLoading === true}
                        style={!previewSource || uploadLoading === true ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                    >
                        <Text style={styles.buttonText}>Update Picture</Text>
                    </TouchableOpacity>
                </View>

                {uploadLoading === true ? <Text style={{ marginVertical: 10 }}>Uploading...</Text> : null}
                {uploadLoading === false && uploadMessage?.length ? <Text style={{ marginVertical: 10 }}>{uploadMessage}</Text> : null}

                {previewSource 
                    ? <Image style={{height: 300, width: 300, borderRadius: 150}} source={{ uri: previewSource }} />
                    : null
                }

                <Text style={{ marginTop: 10 }}>Fields marked with * are required</Text>

                <Text style={styles.inputTitle}>Current Password*</Text>

                <TextInput 
                    value={currentPassword}
                    onChangeText={handleCurrentPasswordChanged}
                    style={styles.textInputWide}
                />

                <Text style={styles.inputTitle}>New Password (8-20 characters, including !@#%)</Text>

                <TextInput 
                    value={password}
                    onChangeText={handlePasswordChanged}
                    style={styles.textInputWide}
                />

                <Text style={styles.inputTitle}>Confirm New Password</Text>

                <TextInput 
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChanged}
                    style={styles.textInputWide}
                />

                <Text style={styles.inputTitle}>New Email</Text>

                <TextInput 
                    value={email}
                    onChangeText={handleEmailChanged}
                    style={styles.textInputWide}
                />

                <Text style={styles.inputTitle}>Confirm New Email</Text>

                <TextInput 
                    style={styles.textInputWide}
                    value={confirmEmail}
                    onChangeText={handleConfirmEmailChanged}
                />

                <Text style={styles.inputTitle}>Name (Max. 30 Letters)*</Text>

                <TextInput 
                    style={styles.textInputWide}
                    value={name}
                    onChangeText={handleNameChanged}
                />

                <Text style={styles.inputTitle}>Country</Text>

                <View style={styles.selectInputWide}>
                    <RNPickerSelect 
                        items={Countries}
                        value={country}
                        onValueChange={handleCountryChanged}
                    />
                </View>

                <Text style={styles.inputTitle}>Region</Text>

                <View style={styles.selectInputWide}>
                    <RNPickerSelect 
                        disabled={!bigCountries?.includes(country)}
                        value={region}
                        onValueChange={(value) => setRegion(value)}
                        placeholder={{ label: '--', value: '' }} 
                        items={bigCountries?.includes(country) ? Regions[country] : []}
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
                    <View>
                        <TouchableOpacity
                            disabled={!canSave}
                            style={!canSave ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                            onPress={handleSaveUserClicked}
                        >
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <TouchableOpacity
                            disabled={!currentPassword?.length}
                            style={!currentPassword?.length ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                            onPress={() => setDeletionVisible(!deletionVisible)}
                        >
                            <Text style={styles.buttonText}>Delete Account</Text>
                        </TouchableOpacity>
                    </View>

                    {deletionVisible === false ? null 
                        : <View>
                            <Text>
                                Enter your current password on top of the page, type "confirmdelete" in the input below and 
                                click on the Confirm Deletion button to delete your account.
                            </Text>

                            <TextInput 
                                style={styles.textInputWide}
                                value={confirmDelete} 
                                onChangeText={(value) => setConfirmDelete(value)} 
                            />

                            <View>
                                <TouchableOpacity
                                    disabled={confirmDelete !== 'confirmdelete' || !currentPassword?.length}
                                    style={confirmDelete !== 'confirmdelete' || !currentPassword?.length 
                                        ? [styles.blackButtonWide, styles.greyButton] 
                                        : styles.blackButtonWide
                                    }
                                    onPress={handleDeleteUserClicked}
                                >
                                    <Text style={styles.buttonText}>Confirm Deletion</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                </View>
            </View>
        </ScrollView>
    )

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
})

export default EditUserForm
