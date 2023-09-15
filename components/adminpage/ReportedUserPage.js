import { useGetUserReportsQuery, useDeleteUserReportMutation } from "../userreports/userReportsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { useParams, Link, useNavigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth"

const ReportedUserPage = () => {

    const navigate = useNavigate()

    const { isAdmin, isSuperAdmin } = useAuth()

    const { userreportid } = useParams()

    // GET the user report with all of it's .values
    const { userReport } = useGetUserReportsQuery("userReportsList", {
        selectFromResult: ({ data }) => ({
            userReport: data?.entities[userreportid]
        }),
    })

    // DELETE method to delete the user report
    const [deleteUserReport, {
        isLoading: isDelLoading,
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteUserReportMutation()

    // GET the user in props with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[userReport?.reportee]
        }),
    })

    if (!isAdmin && !isSuperAdmin) return <p>You are not logged in as an admin.</p>

    if (!userReport) {
        return null
    }

    const handleDelete = async () => {
        await deleteUserReport({ id: userReport?.id })
    }

    if (isDelLoading) return <p>Loading...</p>
    if (isDelSuccess) navigate('/userreports')
    if (isDelError) return <p>{delerror?.data?.message}</p>

    return (
        <>
            <p><b>Report ID {userReport?.id}</b></p>
            <p><b>Reportee <Link className="orange-link" to={`/users/${user?.id}`}>{user?.username}</Link></b></p>
            <p><b>Reason for reporting</b></p>
            <p>{userReport?.text}</p>
            <br />
            <button onClick={handleDelete} className="black-button">
                Delete Report
            </button>
        </>
    )
}

export default ReportedUserPage
