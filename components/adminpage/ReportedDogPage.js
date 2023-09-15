import { useGetDogReportsQuery, useDeleteDogReportMutation } from "../dogreports/dogReportsApiSlice"
import { useGetDogsQuery } from "../dogs/dogsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { useParams, Link, useNavigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth"

const ReportedDogPage = () => {

    const navigate = useNavigate()

    const { isAdmin, isSuperAdmin } = useAuth()

    const { dogreportid } = useParams()

    // GET the dog report with all of it's .values
    const { dogReport } = useGetDogReportsQuery("dogReportsList", {
        selectFromResult: ({ data }) => ({
            dogReport: data?.entities[dogreportid]
        }),
    })

    // DELETE method to delete the dog report
    const [deleteDogReport, {
        isLoading: isDelLoading,
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteDogReportMutation()

    // GET the dog in props with all of it's .values
    const { dog } = useGetDogsQuery("dogsList", {
        selectFromResult: ({ data }) => ({
            dog: data?.entities[dogReport?.dog]
        }),
    })

    // GET the user who is the poster of the dog report with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[dogReport?.reporter]
        }),
    })

    if (!isAdmin && !isSuperAdmin) return <p>You are not logged in as an admin.</p>

    if (!dogReport) {
        return null
    }

    const handleDelete = async () => {
        await deleteDogReport({ id: dogReport?.id })
    }

    if (isDelLoading) return <p>Loading...</p>
    if (isDelSuccess) navigate('/dogreports')
    if (isDelError) return <p>{delerror?.data?.message}</p>

    return (
        <>
            <p><b>Report ID {dogReport?.id}</b></p>
            <p><b>Dog <Link className="orange-link" to={`/dogs/${dog?.id}`}>{dog?.name}</Link></b></p>
            <p><b>Reporter <Link className="orange-link" to={`/users/${user?.id}`}>{user?.username}</Link></b></p>
            <p><b>Reason for reporting</b></p>
            <p>{dogReport?.text}</p>
            <br />
            <button onClick={handleDelete} className="black-button">
                Delete Report
            </button>
        </>
    )
}

export default ReportedDogPage
