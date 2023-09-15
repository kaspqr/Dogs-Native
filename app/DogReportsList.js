import { useGetDogReportsQuery } from "../components/dogreports/dogReportsApiSlice"
import DogReport from "../components/adminpage/DogReport"
import { Text, ScrollView, StyleSheet, View } from "react-native"
import { COLORS } from "../constants"

const DogReportsList = () => {

  // GET all the dog reports
  const {
    data: dogReports,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetDogReportsQuery('dogReportsList', {
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
    const { ids } = dogReports

    // Dog report component for each report
    const tableContent = ids?.length
      ? ids.map(dogReportId => <DogReport 
          key={dogReportId} 
          dogReportId={dogReportId} 
        />
      )
      : null

    content = ids?.length 
      ? <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
        <View style={styles.mainView}>{tableContent}</View>
      </ScrollView>
      : <Text style={{ margin: 10 }}>There are no dog reports</Text>
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

export default DogReportsList
