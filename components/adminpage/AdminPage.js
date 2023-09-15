import React from 'react'
import useAuth from '../../hooks/useAuth'
import { useGetAdvertisementReportsQuery } from "../advertisementreports/advertisementReportsApiSlice"
import { useGetMessageReportsQuery } from "../messagereports/messageReportsApiSlice"
import { useGetDogReportsQuery } from "../dogreports/dogReportsApiSlice"
import { useGetUserReportsQuery } from "../userreports/userReportsApiSlice"
import { COLORS } from "../constants"
import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from "react-native"
import styles from '../header/screenheader.style'

const AdminPage = ({ navigation }) => {

    // Check if the logged in user is an admin
    const { isAdmin, isSuperAdmin } = useAuth()

    // GET all the advertisement reports
    const {
        data: advertisementReports,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetAdvertisementReportsQuery('advertisementReportsList', {
        pollingInterval: 75000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    let amountOfAdvertisementReports = 0

    if (isSuccess) {
        const { ids } = advertisementReports
        amountOfAdvertisementReports = ids?.length
    }

    // GET all the message reports
    const {
        data: messageReports,
        isLoading: isMsgLoading,
        isSuccess: isMsgSuccess,
        isError: isMsgError,
        error: msgError
    } = useGetMessageReportsQuery('messageReportsList', {
        pollingInterval: 75000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    let amountOfMessageReports = 0

    if (isMsgSuccess) {
        const { ids } = messageReports
        amountOfMessageReports = ids?.length
    }

    // GET all the dog reports
    const {
        data: dogReports,
        isLoading: isDogLoading,
        isSuccess: isDogSuccess,
        isError: isDogError,
        error: dogError
    } = useGetDogReportsQuery('dogReportsList', {
        pollingInterval: 75000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    let amountOfDogReports = 0

    if (isDogSuccess) {
        const { ids } = dogReports
        amountOfDogReports = ids?.length
    }

    // GET all the user reports
    const {
        data: userReports,
        isLoading: isUserLoading,
        isSuccess: isUserSuccess,
        isError: isUserError,
        error: userError
    } = useGetUserReportsQuery('userReportsList', {
        pollingInterval: 75000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    let amountOfUserReports = 0

    if (isUserSuccess) {
        const { ids } = userReports
        amountOfUserReports = ids?.length
    }

    if (!isAdmin && !isSuperAdmin) return <Text style={{ margin: 10 }}>You're not logged in as an admin</Text>

    if (isLoading || isMsgLoading || isDogLoading || isUserLoading) return <Text style={{ margin: 10 }}>Loading...</Text>

    if (isError) return <Text style={{ margin: 10 }}>{error?.data?.message}</Text>
    if (isMsgError) return <Text style={{ margin: 10 }}>{msgError?.data?.message}</Text>
    if (isDogError) return <Text style={{ margin: 10 }}>{dogError?.data?.message}</Text>
    if (isUserError) return <Text style={{ margin: 10 }}>{userError?.data?.message}</Text>

    return (
        <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}> 
            <View style={styles.mainView}>

                <View>
                    {amountOfAdvertisementReports < 1 
                        ? <Text style={{ fontWeight: 'bold' }}>No Advertisement Reports</Text> 
                        : <TouchableOpacity onPress={() => {}}>
                            <Text style={styles.orangeLink}>
                                View {amountOfAdvertisementReports} Advertisement Report{amountOfAdvertisementReports === 1 ? '' : 's'}
                            </Text>
                        </TouchableOpacity>
                    }
                </View>

                <View style={{ marginTop: 15 }}>
                    {amountOfMessageReports < 1 
                        ? <Text style={{ fontWeight: 'bold' }}>No Message Reports</Text> 
                        : <TouchableOpacity onPress={() => {}}>
                            <Text style={styles.orangeLink}>
                                View {amountOfMessageReports} Message Report{amountOfMessageReports === 1 ? '' : 's'}
                            </Text>
                        </TouchableOpacity>
                    }
                </View>

                <View style={{ marginTop: 15 }}>
                    {amountOfDogReports < 1 
                        ? <Text style={{ fontWeight: 'bold' }}>No Dog Reports</Text> 
                        : <TouchableOpacity onPress={() => {}}>
                            <Text style={styles.orangeLink}>
                                View {amountOfDogReports} Dog Report{amountOfDogReports === 1 ? '' : 's'}
                            </Text>
                        </TouchableOpacity>
                    }
                </View>

                <View style={{ marginTop: 15 }}>
                    {amountOfUserReports < 1 
                        ? <Text style={{ fontWeight: 'bold' }}>No User Reports</Text> 
                        : <TouchableOpacity onPress={() => {}}>
                            <Text style={styles.orangeLink}>
                                View {amountOfUserReports} User Report{amountOfUserReports === 1 ? '' : 's'}
                            </Text>
                        </TouchableOpacity>
                    }
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

export default AdminPage
