import { useGetAdvertisementReportsQuery, useDeleteAdvertisementReportMutation } from "../components/advertisementreports/advertisementReportsApiSlice"
import { useGetAdvertisementsQuery } from "../components/advertisements/advertisementsApiSlice"
import { useGetUsersQuery } from "../components/users/usersApiSlice"
import useAuth from "../hooks/useAuth"
import { COLORS } from "../constants"
import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from "react-native"

const ReportedAdvertisementPage = ({ navigation, route }) => {

    const { isAdmin, isSuperAdmin } = useAuth()

    const { advertisementreportid } = route.params

    // GET the advertisement report with all of it's .values
    const { advertisementReport } = useGetAdvertisementReportsQuery("advertisementReportsList", {
        selectFromResult: ({ data }) => ({
            advertisementReport: data?.entities[advertisementreportid]
        }),
    })

    // DELETE method to delete the advertisement report
    const [deleteAdvertisementReport, {
        isLoading: isDelLoading,
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteAdvertisementReportMutation()

    // GET the advertisement in props with all of it's .values
    const { advertisement } = useGetAdvertisementsQuery("advertisementsList", {
        selectFromResult: ({ data }) => ({
            advertisement: data?.entities[advertisementReport?.advertisement]
        }),
    })

    // GET the user who is the poster of the advertisement report with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[advertisementReport?.reporter]
        }),
    })

    if (!isAdmin && !isSuperAdmin) return <Text style={{ margin: 10 }}>You are not logged in as an admin.</Text>

    if (!advertisementReport) {
        return null
    }

    const handleDelete = async () => {
        await deleteAdvertisementReport({ id: advertisementReport?.id })
    }

    if (isDelLoading) return <Text style={{ margin: 10 }}>Loading...</Text>
    if (isDelSuccess) navigation.navigate('AdvertisementReportsList')
    if (isDelError) return <Text style={{ margin: 10 }}>{delerror?.data?.message}</Text>

    return (
        <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}> 
            <View style={styles.mainView}>
                <Text style={{ fontWeight: 'bold' }}>Report ID {advertisementReport?.id}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontWeight: 'bold' }}>Advertisement Title </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AdvertisementPage', { advertisementId: advertisement?.id })}>
                        <Text style={styles.orangeLink}>{advertisement?.title}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontWeight: 'bold' }}>Reporter </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('UserPage', { id: user?.id })}>
                        <Text style={styles.orangeLink}>{user?.username}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={{ fontWeight: 'bold' }}>Reason for reporting</Text>
                <Text>{advertisementReport?.text}</Text>

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

export default ReportedAdvertisementPage
