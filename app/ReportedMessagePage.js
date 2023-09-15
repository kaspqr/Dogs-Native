import { useGetMessageReportsQuery, useDeleteMessageReportMutation } from "../components/messagereports/messageReportsApiSlice"
import { useGetMessagesQuery } from "../components/messages/messagesApiSlice"
import { useGetUsersQuery } from "../components/users/usersApiSlice"
import { COLORS } from "../constants"
import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import useAuth from "../hooks/useAuth"

const ReportedMessagePage = ({ navigation, route }) => {

    const { isAdmin, isSuperAdmin } = useAuth()

    const { messagereportid } = route.params

    // GET the message report with all of it's .values
    const { messageReport } = useGetMessageReportsQuery("messageReportsList", {
        selectFromResult: ({ data }) => ({
            messageReport: data?.entities[messagereportid]
        }),
    })

    // DELETE method to delete the message report
    const [deleteMessageReport, {
        isLoading: isDelLoading,
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteMessageReportMutation()

    // GET the message in props with all of it's .values
    const { message } = useGetMessagesQuery("messagesList", {
        selectFromResult: ({ data }) => ({
            message: data?.entities[messageReport?.message]
        }),
    })

    // GET the reportee in props with all of it's .values
    const { sender } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            sender: data?.entities[message?.sender]
        }),
    })

    if (!isAdmin && !isSuperAdmin) return <Text style={{ margin: 10 }}>You are not logged in as an admin.</Text>

    if (!messageReport) {
        return null
    }

    const handleDelete = async () => {
        await deleteMessageReport({ id: messageReport?.id })
    }

    if (isDelLoading) return <Text style={{ margin: 10 }}>Loading...</Text>
    if (isDelSuccess) navigation.navigate('MessageReportsList')
    if (isDelError) return <Text style={{ margin: 10 }}>{delerror?.data?.message}</Text>

    return (
        <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}> 
            <View style={styles.mainView}>
                <Text style={{ fontWeight: 'bold' }}>Report ID {messageReport?.id}</Text>
                <Text style={{ fontWeight: 'bold' }}>Message Text</Text>
                <Text>{message?.text}</Text>

                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontWeight: 'bold' }}>Person who sent the message is </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('UserPage', { id: sender?.id })}>
                        <Text style={styles.orangeLink}>{sender?.username}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={{ fontWeight: 'bold' }}>Reason for reporting</Text>
                <Text>{messageReport?.text}</Text>

                <View style={{ marginTop: 15 }}>
                    <TouchableOpacity onPress={handleDelete} style={styles.blackButtonWide}>
                        <Text style={styles.buttonText}>Delete Report</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    )
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

export default ReportedMessagePage
