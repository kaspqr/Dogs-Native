import { useParams } from "react-router-dom"
import EditAdvertisementForm from './EditAdvertisementForm'
import { useGetAdvertisementsQuery } from "./advertisementsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import useAuth from '../../hooks/useAuth'

const EditAdvertisement = () => {

  const { id } = useParams()

  const { userId } = useAuth()

  // GET the advertisement with all of it's .values
  const { advertisement } = useGetAdvertisementsQuery("advertisementsList", {
    selectFromResult: ({ data }) => ({
      advertisement: data?.entities[id]
    }),
  })

  // GET all the users with all of their .values
  const { users } = useGetUsersQuery("usersList", {
    selectFromResult: ({ data }) => ({
      users: data?.ids.map(id => data?.entities[id])
    }),
  })

  if (!advertisement || !users?.length) return <p>Loading...</p>

  // If the user is not the poster, they are unauthorized to edit it
  if (advertisement.poster !== userId) return <p>This is not your advertisement</p>

  return <EditAdvertisementForm advertisement={advertisement} users={users} />
}

export default EditAdvertisement
