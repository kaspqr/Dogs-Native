import { Link } from "react-router-dom"
import { useGetLittersQuery } from "./littersApiSlice"
import { useGetDogsQuery } from "../dogs/dogsApiSlice"
import { memo } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye } from "@fortawesome/free-solid-svg-icons"

const Litter = ({ litterId }) => {

    // GET the litter with all of it's .values
    const { litter } = useGetLittersQuery("littersList", {
        selectFromResult: ({ data }) => ({
            litter: data?.entities[litterId]
        }),
    })

    // GET the litter's mother dog with all of it's .values
    const { mother } = useGetDogsQuery("dogsList", {
        selectFromResult: ({ data }) => ({
            mother: data?.entities[litter?.mother]
        }),
    })

    // GET the litter's father dog with all of it's .values
    const { father } = useGetDogsQuery("dogsList", {
        selectFromResult: ({ data }) => ({
            father: data?.entities[litter?.father]
        }),
    })

    if (!litter || !mother) {
        return null
    }

    return (
        <div className="litter-div">
            <div className="litter-div-info">
                
                <p>Mother <Link className="orange-link" to={`/dogs/${mother?.id}`}><b>{mother?.name}</b></Link></p>
                {father 
                    ? <p>Father <Link className="orange-link" to={`/dogs/${father?.id}`}><b>{father?.name}</b></Link></p>
                    : <p>Father Not Added</p>
                }
                <p>Born {litter?.born?.split(' ').slice(1, 4).join(' ')}</p>
                <p>{litter?.region?.length ? `${litter?.region}, ` : null}{litter?.country}</p>
                <p>{litter?.breed}</p>
                <p>{litter?.children} {litter?.children === 1 ? 'Puppy' : 'Puppies'}</p>
            </div>

            <div className="litter-div-link">
                <span className="litter-link-span">
                    <p><Link className="eye-view" to={`/litters/${litterId}`}>
                        <FontAwesomeIcon icon={faEye} size="xl"/>
                        <br />
                        <b>View Litter</b>
                    </Link></p>
                </span>
            </div>
        </div>
    )
}

const memoizedLitter = memo(Litter)

export default memoizedLitter
