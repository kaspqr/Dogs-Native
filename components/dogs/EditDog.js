import { useParams } from "react-router-dom"
import EditDogForm from './EditDogForm'
import { useGetDogsQuery } from "./dogsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import useAuth from '../../hooks/useAuth'

const EditDog = () => {
  const { id } = useParams()

  const { userId } = useAuth()

  // GET the dog with all of it's .values
  const { dog } = useGetDogsQuery("dogsList", {
    selectFromResult: ({ data }) => ({
      dog: data?.entities[id]
    }),
  })

  // GET all the users with their .values
  const { users } = useGetUsersQuery("usersList", {
    selectFromResult: ({ data }) => ({
      users: data?.ids.map(id => data?.entities[id])
    }),
  })

  if (!dog) console.log('no dog')
  if (!users?.length) console.log('no users length')
  if (!dog || !users?.length) return <p>Loading...</p>

  // Allow access to only the person who is the dog's administrative user
  if (dog.user !== userId) return <p>This is not your dog</p>

  return <EditDogForm dog={dog} users={users} />
}

export default EditDog
