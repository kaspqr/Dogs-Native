import { Link } from "react-router-dom"
import { useGetDogsQuery } from "./dogsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { memo } from "react"
import DogIcon from "../../config/images/DogIcon.jpg"

const Dog = ({ dogId }) => {

    // GET the dog with all of it's .values
    const { dog } = useGetDogsQuery("dogsList", {
        selectFromResult: ({ data }) => ({
            dog: data?.entities[dogId]
        }),
    })

    // GET the user who administrates the dog with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[dog?.user]
        }),
    })

    if (!dog) return null

    return (
        <div className="dog-div">

            <div className="dog-div-image">
                <img 
                    width="150px" 
                    height="150px" 
                    className="dog-profile-picture" 
                    src={dog?.image?.length ? dog?.image : DogIcon} 
                    alt="Dog" 
                />
            </div>

            <div className="dog-div-info">
                <p><Link className="orange-link" to={`/dogs/${dogId}`}><b>{dog.name}</b></Link></p>

                <br />

                <p>{dog.breed}</p>
                <p>Good{dog.female === true ? ' Girl' : ' Boy'}</p>
                <p>Born {dog.birth?.split(' ').slice(1, 4).join(' ')}</p>

                <br />

                <p className="dog-div-admin">
                    <span>
                        Administered by <Link className="orange-link" to={`/users/${user?.id}`}><b>{user?.username}</b></Link>
                    </span>
                </p>
            </div>

        </div>
    )
}

const memoizedDog = memo(Dog)

export default memoizedDog
