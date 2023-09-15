import { useGetUserReportsQuery } from "../components/userreports/userReportsApiSlice"
import UserReport from "../components/adminpage/UserReport"
import { Text, ScrollView, StyleSheet, View } from "react-native"
import { COLORS } from "../constants"

const UserReportsList = () => {

  // GET all the user reports
  const {
    data: userReports,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetUserReportsQuery('userReportsList', {
    pollingInterval: 75000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true
  })

  // Variable for displaying either an error or the content if the fetch was successful
  let content

  if (isLoading) content = <Text style={{ margin: 10 }}>Loading...</Text>

  if (isError) {
    content = <Text style={{ margin: 10 }}>{error?.data?.message}</Text>
  }

  if (isSuccess) {
    const { ids } = userReports

    // User report component for each report
    const tableContent = ids?.length
      ? ids.map(userReportId => <UserReport 
          key={userReportId} 
          userReportId={userReportId} 
        />
      )
      : null

    content = ids?.length 
      ? <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
        <View style={styles.mainView}>{tableContent}</View>
      </ScrollView>
      : <Text style={{ margin: 10 }}>There are no user reports</Text>
  }

  return content
}

const styles = StyleSheet.create({
  mainView: {
      marginHorizontal: 10,
      marginBottom: 30,
      marginTop: 10,
  },
})

export default UserReportsList
