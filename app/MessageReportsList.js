import { useGetMessageReportsQuery } from "../components/messagereports/messageReportsApiSlice"
import MessageReport from "../components/adminpage/MessageReport"
import { Text, ScrollView, StyleSheet, View } from "react-native"
import { COLORS } from "../constants"

const MessageReportsList = () => {

  // GET all the message reports
  const {
    data: messageReports,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetMessageReportsQuery('messageReportsList', {
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
    const { ids } = messageReports

    // Message report component for each report
    const tableContent = ids?.length
      ? ids.map(messageReportId => <MessageReport 
          key={messageReportId} 
          messageReportId={messageReportId} 
        />
      )
      : null

    content = ids?.length 
      ? <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
        <View style={styles.mainView}>{tableContent}</View>
      </ScrollView>
      : <Text style={{ margin: 10 }}>There are no message reports</Text>
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

export default MessageReportsList
