import { useGetUserReportsQuery } from "../userreports/userReportsApiSlice"
import UserReport from "./UserReport"

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

  if (isLoading) content = <p>Loading...</p>

  if (isError) {
    content = <p className="errmsg">{error?.data?.message}</p>
  }

  if (isSuccess) {
    const { ids } = userReports

    // User report component for each report
    const tableContent = ids?.length
      ? ids.map(userReportId => <UserReport key={userReportId} userReportId={userReportId} />)
      : null

    content = ids?.length 
      ? tableContent
    : <p>There are no user reports</p>
  }

  return content
}

export default UserReportsList
