import { useGetMessagesQuery } from "../components/messages/messagesApiSlice"
import { COLORS } from "../constants"
import { Text, View, ScrollView, TextInput, TouchableOpacity, StyleSheet } from "react-native"
import useAuth from "../hooks/useAuth"
import { useState, useEffect } from "react"
import { useAddNewMessageReportMutation } from "../components/messagereports/messageReportsApiSlice"

const MessageReportPage = ({ route }) => {

    const { userId } = useAuth()
    const { messageid } = route.params

    const [report, setReport] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    // GET the message with all of it's .values
    const { message } = useGetMessagesQuery("messagesList", {
        selectFromResult: ({ data }) => ({
            message: data?.entities[messageid]
        }),
    })

    // POST function to add a new message report
    const [addNewMessageReport, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useAddNewMessageReportMutation()

    // Clear the inputs if a report was POSTed successfully
    useEffect(() => {
        if (isSuccess) {
            setReport('')
            setSuccessMsg('Thank You! We have received your report.')
        }
    }, [isSuccess])

    if (message?.poster === userId) return <Text style={{ margin: 10 }}>You cannot report your own message.</Text>

    const handleReportClicked = async () => {
        await addNewMessageReport({ "message": messageid, "reporter": userId, "text": report })
    }

    if (isLoading) return <Text style={{ margin: 10 }}>Loading...</Text>
    if (isError) return <Text style={{ margin: 10 }}>{error?.data?.message}</Text>

    const content = successMsg?.length 
        ? <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
            <Text style={{ margin: 10 }}>{successMsg}</Text>
        </ScrollView> 
        : <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
            <View style={styles.mainView}>
                <Text style={{ fontWeight: 'bold' }}>Reason for reporting message {message?.text}</Text>

                <TextInput 
                    style={styles.textInputWide}
                    value={report}
                    multiline={true}
                    numberOfLines={5}
                    onChangeText={(value) => setReport(value)}
                    maxLength={900}
                />

                <TouchableOpacity
                    onPress={handleReportClicked}
                    disabled={report?.length < 1}
                    style={report?.length < 1 ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                >
                    <Text style={styles.buttonText}>Report</Text>
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
        marginTop: 10,
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
    errMsg: {
        color: 'red',
    },
    successMsg: {
        color: 'green',
        marginHorizontal: 10,
        fontWeight: 'bold',
    },
    orangeLink: {
        fontWeight: 'bold',
        color: 'orange',
    },
})

export default MessageReportPage
