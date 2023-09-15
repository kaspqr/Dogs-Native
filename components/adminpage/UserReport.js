import { Text, TouchableOpacity, StyleSheet, View } from "react-native"
import { useGetUserReportsQuery } from "../userreports/userReportsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { memo } from "react"
import navigationService from "../../app/navigationService"

const UserReport = ({ userReportId }) => {

    // GET the userReport in props with all of it's .values
    const { userReport } = useGetUserReportsQuery("userReportsList", {
        selectFromResult: ({ data }) => ({
            userReport: data?.entities[userReportId]
        }),
    })

    // GET the user who is the poster of the userReport with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[userReport?.reporter]
        }),
    })

    if (!userReport) {
        return null
    }

    return (
        <View style={styles.reportView}>

            <TouchableOpacity 
                onPress={() => navigationService.navigate('ReportedUserPage', { userreportid: userReport?.id })}
            >
                <Text style={styles.orangeLink}>{userReport?.id}</Text>
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

const memoizedUserReport = memo(UserReport)

export default memoizedUserReport
