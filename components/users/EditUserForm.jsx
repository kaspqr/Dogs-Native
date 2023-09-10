import { useState, useEffect, useRef } from "react"
import { useUpdateUserMutation, useDeleteUserMutation } from "./usersApiSlice"
import { useSendLogoutMutation } from "../auth/authApiSlice"
import { Countries } from "../../assets/countries"
import { bigCountries } from "../../assets/bigCountries"
import { Regions } from "../../assets/regions"

import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native"
import RNPickerSelect from 'react-native-picker-select'

const EditUserForm = ({ user }) => {

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
    const [name, setName] = useState(user.name)
    const [email, setEmail] = useState('')
    const [confirmEmail, setConfirmEmail] = useState('')
    const [bio, setBio] = useState(user.bio !== 'none ' ? user.bio : '')
    const [country, setCountry] = useState(user.country)
    const [region, setRegion] = useState(user.region?.length ? user.region : '')
    const [changePasswordError, setChangePasswordError] = useState('')
    const [previewSource, setPreviewSource] = useState()
    const [uploadMessage, setUploadMessage] = useState('')
    const [uploadLoading, setUploadLoading] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState('')
    const [deletionVisible, setDeletionVisible] = useState(false)
    const fileInputRef = useRef(null)

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
            // navigate('/users')
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
                setChangePasswordError(<Text>New Password doesn't match with Confirm Password</Text>)
            }
            await updateUser({ id: user.id, password, name, email, country, region, currentPassword, bio: finalBio })
        } else {
            await updateUser({ id: user.id, name, email, country, region, currentPassword, bio: finalBio })
        }
    }

    // DELETE the user
    const handleDeleteUserClicked = async () => {
        const response = await deleteUser({ id: user.id, currentPassword })

        if (!response?.error) {
            sendLogout()
        }
    }

    const previewFile = (file) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = () => {
            setPreviewSource(reader.result)
        }
    }

    const handleFileChanged = (e) => {
        const file = e.target.files[0]
        previewFile(file)
    }

    const uploadImage = async (base64EncodedImage) => {
        setUploadLoading(true)

        try {
            setUploadMessage('')
            await fetch('https://pawretriever-api.onrender.com/userimages', {
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

    const handleSubmitFile = (e) => {
        if (!previewSource) return
        uploadImage(previewSource)
    }

    const handleFileClicked = () => {
        // Programmatically trigger the click event on the file input
        fileInputRef.current.click()
    }

    /* useEffect(() => {
        if (isLogoutSuccess) navigate('/')
    }, [isLogoutSuccess, navigate]) */

    if (isLoading || isDelLoading || isLogoutLoading) return <Text>Loading...</Text>

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
        <View>
            {changePasswordError?.length ? <Text>{changePasswordError}</Text> : null}
            {errContent?.length ? <Text>{errContent}</Text> : null}

            <Text>Edit Profile</Text>

            <TouchableOpacity style={styles.blackButtonWide} onPress={handleFileClicked}>
                <Text style={styles.buttonText}>Browse Profile Picture</Text>
            </TouchableOpacity>

            <TextInput
                ref={fileInputRef}
                onChange={handleFileChanged}
                style={{ display: "none" }}
            />

            <TouchableOpacity 
                onClick={handleSubmitFile}
                disabled={!previewSource || uploadLoading === true}
                style={!previewSource || uploadLoading === true ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
            >
                <Text>Update Picture</Text>
            </TouchableOpacity>

            {uploadLoading === true ? <Text>Uploading...</Text> : null}
            {uploadLoading === false && uploadMessage?.length ? <Text>{uploadMessage}</Text> : null}

            {previewSource 
                ? <Image style={{height: 300, width: 300, borderRadius: 150}} src={previewSource} />
                : null
            }

            <Text>Fields marked with * are required</Text>

            <Text style={styles.inputTitle}>Current Password*</Text>

            <TextInput 
                value={currentPassword}
                onChangeText={handleCurrentPasswordChanged}
                style={styles.textInputWide}
            />

            <Text>New Password (8-20 characters, including !@#%)</Text>

            <TextInput 
                value={password}
                onChangeText={handlePasswordChanged}
                style={styles.textInputWide}
            />

            <Text>Confirm New Password</Text>

            <TextInput 
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChanged}
                style={styles.textInputWide}
            />

            <Text>New Email</Text>

            <TextInput 
                value={email}
                onChangeText={handleEmailChanged}
                style={styles.textInputWide}
            />

            <Text>Confirm New Email</Text>

            <TextInput 
                style={styles.textInputWide}
                value={confirmEmail}
                onChaonChangeTextnge={handleConfirmEmailChanged}
            />

            <Text>Name (Max. 30 Letters)*</Text>

            <TextInput 
                style={styles.textInputWide}
                value={name}
                onChangeText={handleNameChanged}
            />

            <Text>Country</Text>

            <RNPickerSelect 
                items={Countries}
                value={country}
                onValueChange={handleCountryChanged}
            />

            <Text>Region</Text>

            <RNPickerSelect 
                disabled={!bigCountries?.includes(country)}
                value={region}
                onValueChange={(value) => setRegion(value)}
                placeholder={{ label: '--', value: '' }} 
                items={bigCountries?.includes(country) ? Regions[country] : []}
            />

            <Text>Bio</Text>

            <TextInput 
                style={styles.textInputWide}
                multiline={true}
                numberOfLines={5}
                maxLength={500}
                value={bio}
                onChange={handleBioChanged}
            />
            
            <View>
                <TouchableOpacity
                    disabled={!canSave}
                    style={!canSave ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                    onPress={handleSaveUserClicked}
                >
                    <Text>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={!currentPassword?.length}
                    style={!currentPassword?.length ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                    onPress={() => setDeletionVisible(!deletionVisible)}
                >
                    <Text>Delete Account</Text>
                </TouchableOpacity>

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

                    <TouchableOpacity
                        disabled={confirmDelete !== 'confirmdelete' || !currentPassword?.length}
                        style={confirmDelete !== 'confirmdelete' || !currentPassword?.length 
                            ? [styles.blackButtonWide, styles.greyButton] 
                            : styles.blackButtonWide
                        }
                        onPress={handleDeleteUserClicked}
                    >
                        <Text>Confirm Deletion</Text>
                    </TouchableOpacity>
                </View>}
            </View>
        </View>
    )

  return content
}

export default EditUserForm
