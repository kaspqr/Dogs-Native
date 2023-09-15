import { useGetAdvertisementReportsQuery } from "../advertisementreports/advertisementReportsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { memo } from "react"
import { Text, TouchableOpacity, StyleSheet, View } from "react-native"

const AdvertisementReport = ({ advertisementReportId, navigation }) => {

    // GET the advertisementReport in props with all of it's .values
    const { advertisementReport } = useGetAdvertisementReportsQuery("advertisementReportsList", {
        selectFromResult: ({ data }) => ({
            advertisementReport: data?.entities[advertisementReportId]
        }),
    })

    // GET the user who is the poster of the advertisementReport with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[advertisementReport?.reporter]
        }),
    })

    if (!advertisementReport) {
        return null
    }

    return (
        <View style={styles.reportView}>

            <TouchableOpacity style={{ flex: 1 }} onPress={() => {}}>
                <Text style={styles.orangeLink}>{advertisementReport?.id}</Text>
            </TouchableOpacity>

            <View style={{ flex: 1, alignItems: 'flex-end', flexDirection: 'row' }}>
                <Text style={{ fontWeight: 'bold' }}>by </Text>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('UserPage', { navigation, id: user?.id })}>
                    <Text style={styles.orangeLink}>{user?.username}</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    reportView: {
        flexDirection: 'row',
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

const memoizedAdvertisementReport = memo(AdvertisementReport)

export default memoizedAdvertisementReport
