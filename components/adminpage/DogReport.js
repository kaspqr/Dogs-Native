import { Text, TouchableOpacity, StyleSheet, View } from "react-native"
import { useGetDogReportsQuery } from "../dogreports/dogReportsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { memo } from "react"
import navigationService from "../../app/navigationService"

const DogReport = ({ dogReportId }) => {

    // GET the dogReport in props with all of it's .values
    const { dogReport } = useGetDogReportsQuery("dogReportsList", {
        selectFromResult: ({ data }) => ({
            dogReport: data?.entities[dogReportId]
        }),
    })

    // GET the user who is the poster of the dogReport with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[dogReport?.reporter]
        }),
    })

    if (!dogReport) {
        return null
    }

    return (
        <View style={styles.reportView}>

            <TouchableOpacity 
                onPress={() => navigationService.navigate('ReportedDogPage', { dogreportid: dogReport?.id })}
            >
                <Text style={styles.orangeLink}>{dogReport?.id}</Text>
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

const memoizedDogReport = memo(DogReport)

export default memoizedDogReport
