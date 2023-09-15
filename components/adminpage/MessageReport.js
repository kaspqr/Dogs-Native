import { Link } from "react-router-dom"
import { useGetMessageReportsQuery } from "../messagereports/messageReportsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { memo } from "react"

const MessageReport = ({ messageReportId }) => {

    // GET the messageReport in props with all of it's .values
    const { messageReport } = useGetMessageReportsQuery("messageReportsList", {
        selectFromResult: ({ data }) => ({
            messageReport: data?.entities[messageReportId]
        }),
    })

    // GET the user who is the poster of the messageReport with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[messageReport?.reporter]
        }),
    })

    if (!messageReport) {
        return null
    }

    return (
        <div className="report-div">
            <span>
                <Link className="orange-link" to={`/messagereports/${messageReportId}`}>
                    <b>{messageReport?.id}</b>
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

const memoizedMessageReport = memo(MessageReport)

export default memoizedMessageReport
