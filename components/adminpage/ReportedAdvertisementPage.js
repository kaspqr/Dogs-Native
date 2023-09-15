import { useGetAdvertisementReportsQuery, useDeleteAdvertisementReportMutation } from "../advertisementreports/advertisementReportsApiSlice"
import { useGetAdvertisementsQuery } from "../advertisements/advertisementsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { useParams, Link, useNavigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth"

const ReportedAdvertisementPage = () => {

    const navigate = useNavigate()

    const { isAdmin, isSuperAdmin } = useAuth()

    const { advertisementreportid } = useParams()

    // GET the advertisement report with all of it's .values
    const { advertisementReport } = useGetAdvertisementReportsQuery("advertisementReportsList", {
        selectFromResult: ({ data }) => ({
            advertisementReport: data?.entities[advertisementreportid]
        }),
    })

    // DELETE method to delete the advertisement report
    const [deleteAdvertisementReport, {
        isLoading: isDelLoading,
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteAdvertisementReportMutation()

    // GET the advertisement in props with all of it's .values
    const { advertisement } = useGetAdvertisementsQuery("advertisementsList", {
        selectFromResult: ({ data }) => ({
            advertisement: data?.entities[advertisementReport?.advertisement]
        }),
    })

    // GET the user who is the poster of the advertisement report with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[advertisementReport?.reporter]
        }),
    })

    if (!isAdmin && !isSuperAdmin) return <p>You are not logged in as an admin.</p>

    if (!advertisementReport) {
        return null
    }

    const handleDelete = async () => {
        await deleteAdvertisementReport({ id: advertisementReport?.id })
    }

    if (isDelLoading) return <p>Loading...</p>
    if (isDelSuccess) navigate('/advertisementreports')
    if (isDelError) return <p>{delerror?.data?.message}</p>

    return (
        <>
            <p><b>Report ID {advertisementReport?.id}</b></p>
            <p><b>Advertisement Title <Link className="orange-link" to={`/advertisements/${advertisement?.id}`}>{advertisement?.title}</Link></b></p>
            <p><b>Reporter <Link className="orange-link" to={`/users/${user?.id}`}>{user?.username}</Link></b></p>
            <p><b>Reason for reporting</b></p>
            <p>{advertisementReport?.text}</p>
            <br />
            <button onClick={handleDelete} className="black-button">
                Delete Report
            </button>
        </>
    )
}

export default ReportedAdvertisementPage
