import { useGetUserReportsQuery, useDeleteUserReportMutation } from "../components/userreports/userReportsApiSlice"
import { useGetUsersQuery } from "../components/users/usersApiSlice"
import { COLORS } from "../constants"
import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import useAuth from "../hooks/useAuth"

const ReportedUserPage = ({ navigation, route }) => {

    const { isAdmin, isSuperAdmin } = useAuth()

    const { userreportid } = route.params

    // GET the user report with all of it's .values
    const { userReport } = useGetUserReportsQuery("userReportsList", {
        selectFromResult: ({ data }) => ({
            userReport: data?.entities[userreportid]
        }),
    })

    // DELETE method to delete the user report
    const [deleteUserReport, {
        isLoading: isDelLoading,
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteUserReportMutation()

    // GET the user in props with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[userReport?.reportee]
        }),
    })

    if (!isAdmin && !isSuperAdmin) return <Text style={{ margin: 10 }}>You are not logged in as an admin.</Text>

    if (!userReport) {
        return null
    }

    const handleDelete = async () => {
        await deleteUserReport({ id: userReport?.id })
    }

    if (isDelLoading) return <Text style={{ margin: 10 }}>Loading...</Text>
    if (isDelSuccess) navigation.navigate('UserReportsList')
    if (isDelError) return <Text style={{ margin: 10 }}>{delerror?.data?.message}</Text>

    return (
        <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}> 
            <View style={styles.mainView}>
                <Text style={{ fontWeight: 'bold' }}>Report ID {userReport?.id}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontWeight: 'bold' }}>Reportee </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('UserPage', { id: user?.id })}>
                        <Text style={styles.orangeLink}>{user?.username}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={{ fontWeight: 'bold' }}>Reason for reporting</Text>
                <Text>{userReport?.text}</Text>

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
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    orangeLink: {
        fontWeight: 'bold',
        color: 'orange',
    },
})

export default ReportedUserPage
