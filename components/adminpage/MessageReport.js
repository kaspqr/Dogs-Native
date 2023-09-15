import { Text, TouchableOpacity, StyleSheet, View } from "react-native"
import { useGetMessageReportsQuery } from "../messagereports/messageReportsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { memo } from "react"
import navigationService from "../../app/navigationService"

const MessageReport = ({ messageReportId }) => {

    // GET the messageReport in props with all of it's .values
    const { messageReport } = useGetMessageReportsQuery("messageReportsList", {
        selectFromResult: ({ data }) => ({
            messageReport: data?.entities[messageReportId]
        }),
    })

    // GET the user who is the poster of the messageReport with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[messageReport?.reporter]
        }),
    })

    if (!messageReport) {
        return null
    }

    return (
        <View style={styles.reportView}>

            <TouchableOpacity 
                onPress={() => navigationService.navigate('ReportedMessagePage', { messagereportid: messageReport?.id })}
            >
                <Text style={styles.orangeLink}>{messageReport?.id}</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
                <Text style={{ fontWeight: 'bold' }}>by </Text>
                <TouchableOpacity onPress={() => navigationService.navigate('UserPage', { id: user?.id })}>
                    <Text style={styles.orangeLink}>{user?.username}</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    reportView: {
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

const memoizedMessageReport = memo(MessageReport)

export default memoizedMessageReport
