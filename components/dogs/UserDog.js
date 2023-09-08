import { Link } from "react-router-dom"
import { useGetDogsQuery } from "./dogsApiSlice"
import { memo } from "react"
import DogIcon from "../../config/images/DogIcon.jpg"

const UserDog = ({ dogId }) => {

    // GET the dog with all of it's .values
    const { dog } = useGetDogsQuery("dogsList", {
        selectFromResult: ({ data }) => ({
            dog: data?.entities[dogId]
        }),
    })

    if (!dog) return null

    return (
        <div className="dog-div">
            <div className="dog-div-image">
                {dog?.image?.length 
                    ? <img width="150px" height="150px" className="dog-profile-picture" src={dog?.image} alt="Dog" />
                    : <img width="150px" height="150px" className="dog-profile-picture" src={DogIcon} alt="Dog" />
                }
            </div>
            <div className="dog-div-info">
                <p><Link className="orange-link" to={`/dogs/${dog.id}`}><b>{dog.name}</b></Link></p>
                <br />
                <p>{dog.breed}</p>
                <p>{dog.female === true ? 'Good Girl' : 'Good Boy'}</p>
                <p>Born {dog.birth.split(' ').slice(1, 4).join(' ')}</p>
            </div>
        </div>
    )
}

const memoizedUserDog = memo(UserDog)

export default memoizedUserDog
