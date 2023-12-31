import { useGetUsersQuery } from "../components/users/usersApiSlice"
import { COLORS } from "../constants"
import { Text, View, ScrollView, TextInput, TouchableOpacity, StyleSheet } from "react-native"
import useAuth from "../hooks/useAuth"
import { useState, useEffect } from "react"
import { useAddNewUserReportMutation } from "../components/userreports/userReportsApiSlice"

const UserReportPage = ({ navigation, route }) => {

    const { userId } = useAuth()
    const { userid } = route.params

    const [report, setReport] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    // GET the user with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[userid]
        }),
    })

    // POST function to add a new user report
    const [addNewUserReport, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useAddNewUserReportMutation()

    // Clear the inputs if a report was POSTed successfully
    useEffect(() => {
        if (isSuccess) {
            setReport('')
            setSuccessMsg('Thank You! We have received your report.')
        }
    }, [isSuccess])

    if (userid === userId) return <Text style={{ margin: 10 }}>You cannot report yourself.</Text>

    const handleReportClicked = async () => {
        await addNewUserReport({ "reportee": userid, "reporter": userId, "text": report })
    }

    if (isLoading) return <Text style={{ margin: 10 }}>Loading...</Text>
    if (isError) return <Text style={{ margin: 10 }}>{error?.data?.message}</Text>

    const content = successMsg?.length 
    ? <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
        <Text style={{ margin: 10 }}>{successMsg}</Text>
    </ScrollView> 
    : <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
        <View style={styles.mainView}>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold' }}>Reason for reporting user </Text>
                <TouchableOpacity onPress={() => navigation.navigate('UserPage', { id: user?.id })}>
                    <Text style={styles.orangeLink}>{user?.username}</Text>
                </TouchableOpacity>
            </View>

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
    greyButton: {
        backgroundColor: 'lightgrey',
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    textInputWide: {
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 5,
        paddingVertical: 13,
        marginBottom: 10,
        marginTop: 10,
    },
    orangeLink: {
        fontWeight: 'bold',
        color: 'orange',
    },
})

export default UserReportPage
