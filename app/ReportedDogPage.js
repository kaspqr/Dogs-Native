import { useGetDogReportsQuery, useDeleteDogReportMutation } from "../components/dogreports/dogReportsApiSlice"
import { useGetDogsQuery } from "../components/dogs/dogsApiSlice"
import { useGetUsersQuery } from "../components/users/usersApiSlice"
import { COLORS } from "../constants"
import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import useAuth from "../hooks/useAuth"

const ReportedDogPage = ({ navigation, route }) => {

    const { isAdmin, isSuperAdmin } = useAuth()

    const { dogreportid } = route.params

    // GET the dog report with all of it's .values
    const { dogReport } = useGetDogReportsQuery("dogReportsList", {
        selectFromResult: ({ data }) => ({
            dogReport: data?.entities[dogreportid]
        }),
    })

    // DELETE method to delete the dog report
    const [deleteDogReport, {
        isLoading: isDelLoading,
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteDogReportMutation()

    // GET the dog in props with all of it's .values
    const { dog } = useGetDogsQuery("dogsList", {
        selectFromResult: ({ data }) => ({
            dog: data?.entities[dogReport?.dog]
        }),
    })

    // GET the user who is the poster of the dog report with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[dogReport?.reporter]
        }),
    })

    if (!isAdmin && !isSuperAdmin) return <Text style={{ margin: 10 }}>You are not logged in as an admin.</Text>

    if (!dogReport) {
        return null
    }

    const handleDelete = async () => {
        await deleteDogReport({ id: dogReport?.id })
    }

    if (isDelLoading) return <Text style={{ margin: 10 }}>Loading...</Text>
    if (isDelSuccess) navigation.navigate('DogReportsList')
    if (isDelError) return <Text style={{ margin: 10 }}>{delerror?.data?.message}</Text>

    return (
        <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}> 
            <View style={styles.mainView}>
                <Text style={{ fontWeight: 'bold' }}>Report ID {dogReport?.id}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontWeight: 'bold' }}>Dog </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('DogPage', { dogId: dog?.id })}>
                        <Text style={styles.orangeLink}>{dog?.name}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontWeight: 'bold' }}>Reporter </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('UserPage', { id: user?.id })}>
                        <Text style={styles.orangeLink}>{user?.username}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={{ fontWeight: 'bold' }}>Reason for reporting</Text>
                <Text>{dogReport?.text}</Text>

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

export default ReportedDogPage
