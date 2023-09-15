import { useGetAdvertisementReportsQuery } from "../advertisementreports/advertisementReportsApiSlice"
import AdvertisementReport from "./AdvertisementReport"

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

  if (isLoading) content = <p>Loading...</p>

  if (isError) {
    content = <p className="errmsg">{error?.data?.message}</p>
  }

  if (isSuccess) {
    const { ids } = advertisementReports

    // Advertisement report component for each report
    const tableContent = ids?.length
      ? ids.map(advertisementReportId => <AdvertisementReport key={advertisementReportId} advertisementReportId={advertisementReportId} />)
      : null

    content = ids?.length 
      ? tableContent
      : <p>There are no advertisement reports</p>
  }

  return content
}

export default AdvertisementReportsList
