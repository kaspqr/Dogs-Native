import NewDogForm from './NewDogForm'
import { useGetUsersQuery } from "../users/usersApiSlice"

const NewDog = () => {

  // GET all the users with all of their .values
  const { users } = useGetUsersQuery("usersList", {
    selectFromResult: ({ data }) => ({
      users: data?.ids.map(id => data?.entities[id])
    }),
  })

  if (!users?.length) return <p>Loading...</p>

  return <NewDogForm users={users} />
}

export default NewDog
