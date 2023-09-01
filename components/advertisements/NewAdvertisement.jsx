import NewAdvertisementForm from './NewAdvertisementForm'
import { useGetUsersQuery } from "../users/usersApiSlice"

const NewAdvertisement = () => {

  // GET all the users with all of their .values
  const { users } = useGetUsersQuery("usersList", {
    selectFromResult: ({ data }) => ({
      users: data?.ids.map(id => data?.entities[id])
    }),
  })

  if (!users?.length) return <p>Loading...</p>

  return <NewAdvertisementForm users={users} />
}

export default NewAdvertisement
