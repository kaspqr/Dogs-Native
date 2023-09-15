import { Link } from "react-router-dom"
import { useGetDogReportsQuery } from "../dogreports/dogReportsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { memo } from "react"

const DogReport = ({ dogReportId }) => {

    // GET the dogReport in props with all of it's .values
    const { dogReport } = useGetDogReportsQuery("dogReportsList", {
        selectFromResult: ({ data }) => ({
            dogReport: data?.entities[dogReportId]
        }),
    })

    // GET the user who is the poster of the dogReport with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[dogReport?.reporter]
        }),
    })

    if (!dogReport) {
        return null
    }

    return (
        <div className="report-div">
            <span>
                <Link className="orange-link" to={`/dogreports/${dogReportId}`}>
                    <b>{dogReport?.id}</b>
                </Link>
            </span>
            <span className="report-div-reporter">
                <span>by </span>
                <Link className="orange-link" to={`/users/${user?.id}`}>
                    <b>{user?.username}</b>
                </Link>
            </span>
        </div>
    )
}

const memoizedDogReport = memo(DogReport)

export default memoizedDogReport
