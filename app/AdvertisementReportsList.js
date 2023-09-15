import { useGetAdvertisementReportsQuery } from "../components/advertisementreports/advertisementReportsApiSlice"
import AdvertisementReport from "../components/adminpage/AdvertisementReport"
import { Text, ScrollView, StyleSheet, View } from "react-native"
import { COLORS } from "../constants"

const AdvertisementReportsList = () => {

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

  // Variable for displaying either an error or the content if the fetch was successful
  let content

  if (isLoading) content = <Text style={{ margin: 10 }}>Loading...</Text>

  if (isError) {
    content = <Text style={{ margin: 10 }}>{error?.data?.message}</Text>
  }

  if (isSuccess) {
    const { ids } = advertisementReports

    // Advertisement report component for each report
    const tableContent = ids?.length
      ? ids.map(advertisementReportId => <AdvertisementReport 
          key={advertisementReportId} 
          advertisementReportId={advertisementReportId} 
        />
      )
      : null

    content = ids?.length 
      ? <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
        <View style={styles.mainView}>{tableContent}</View>
      </ScrollView>
      : <Text style={{ margin: 10 }}>There are no advertisement reports</Text>
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

export default AdvertisementReportsList
