import useAuth from "../hooks/useAuth"
import { useState, useEffect } from "react"
import { useAddNewResetTokenMutation } from "../components/auth/resetTokensApiSlice"
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { COLORS } from "../constants"

const ResetPassword = () => {

    const { userId } = useAuth()
    const [email, setEmail] = useState('')
    const [confirmEmail, setConfirmEmail] = useState('')
    const [errMsg, setErrMsg] = useState('')

    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    // POST method for a new reset token
    const [addNewResetToken, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useAddNewResetTokenMutation()

    const handleSubmit = async (e) => {
        e.preventDefault()
        await addNewResetToken({ email })
    }

    useEffect(() => {
        if (isError) {
            setErrMsg(error?.data?.message)
        }
    }, [isError, error])

    useEffect(() => {
        if (isSuccess) {
            setEmail('')
            setConfirmEmail('')
            setErrMsg('A link to reset your password has been sent to the specified email address. Please check the Spam folder if you cannot find it in your Primary emails.')
        }
    }, [isSuccess])

    if (userId?.length) return <Text style={{ margin: 10 }}>You need to be logged out before resetting your password</Text>

    if (isLoading) return <Text style={{ margin: 10 }}>Loading...</Text>

    const content = <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
        <View style={styles.mainView}>

            <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 15 }}>Reset Password</Text>

            {errMsg?.length ? <Text>{errMsg}</Text> : null}

            <Text style={styles.inputTitle}>Email</Text>

            <TextInput 
                value={email}
                style={styles.textInputWide}
                onChangeText={(value) => setEmail(value)}
            />

            <Text style={styles.inputTitle}>Confrim Email</Text>

            <TextInput 
                onChangeText={(value) => setConfirmEmail(value)}
                value={confirmEmail}
                style={styles.textInputWide}
            />

            <TouchableOpacity 
                onPress={handleSubmit}
                disabled={!EMAIL_REGEX.test(email) || email !== confirmEmail}
                style={!EMAIL_REGEX.test(email) || email !== confirmEmail 
                    ? [styles.blackButtonWide, styles.greyButton] 
                    : styles.blackButtonWide
                }
            >
                <Text style={styles.buttonText}>Request Link</Text>
            </TouchableOpacity>
            
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
    blackButton: {
      padding: 10,
      borderRadius: 5,
      backgroundColor: '#000000',
      width: 50,
    },
    blackNewPageButton: {
      backgroundColor: '#000000',
      borderRadius: 5,
      padding: 10,
    },
    greyButton: {
      backgroundColor: 'lightgrey',
    },
    buttonText: {
      color: '#ffffff',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    filterViewVisible: {
      flex: 1,
    },
    filterViewHidden: {
      display: 'none',
    },
    textInputWide: {
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 5,
      paddingVertical: 13,
      marginBottom: 10,
    },
    textInput: {
      borderWidth: 1,
      borderRadius: 5,
      paddingLeft: 5,
      width: 60,
    },
    selectInputWide: {
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 10,
    },
    paginationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    paginationTextView: {
      flex: 1,
      alignItems: 'center',
    },
    paginationInputView: {
      flexDirection: 'row',
      marginTop: 5,
    },
    inputTitle: {
      fontWeight: 'bold',
    },
  })

export default ResetPassword
