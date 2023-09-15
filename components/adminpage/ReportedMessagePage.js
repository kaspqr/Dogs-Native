import { useGetMessageReportsQuery, useDeleteMessageReportMutation } from "../messagereports/messageReportsApiSlice"
import { useGetMessagesQuery } from "../messages/messagesApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { useParams, Link, useNavigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth"

const ReportedMessagePage = () => {

    const navigate = useNavigate()

    const { isAdmin, isSuperAdmin } = useAuth()

    const { messagereportid } = useParams()

    // GET the message report with all of it's .values
    const { messageReport } = useGetMessageReportsQuery("messageReportsList", {
        selectFromResult: ({ data }) => ({
            messageReport: data?.entities[messagereportid]
        }),
    })

    // DELETE method to delete the message report
    const [deleteMessageReport, {
        isLoading: isDelLoading,
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteMessageReportMutation()

    // GET the message in props with all of it's .values
    const { message } = useGetMessagesQuery("messagesList", {
        selectFromResult: ({ data }) => ({
            message: data?.entities[messageReport?.message]
        }),
    })

    // GET the reportee in props with all of it's .values
    const { sender } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            sender: data?.entities[message?.sender]
        }),
    })

    if (!isAdmin && !isSuperAdmin) return <p>You are not logged in as an admin.</p>

    if (!messageReport) {
        return null
    }

    const handleDelete = async () => {
        await deleteMessageReport({ id: messageReport?.id })
    }

    if (isDelLoading) return <p>Loading...</p>
    if (isDelSuccess) navigate('/messagereports')
    if (isDelError) return <p>{delerror?.data?.message}</p>

    return (
        <>
            <p><b>Report ID {messageReport?.id}</b></p>
            <p><b>Message Text</b></p>
            <p>{message?.text}</p>
            <br />
            <p><b>Person who sent the message is <Link className="orange-link" to={`/users/${sender?.id}`}>{sender?.username}</Link></b></p>
            <p><b>Reason for reporting</b></p>
            <p>{messageReport?.text}</p>
            <br />
            <button onClick={handleDelete} className="black-button">
                Delete Report
            </button>
        </>
    )
}

export default ReportedMessagePage
