import { useGetDogsQuery, useDeleteDogMutation } from "./dogsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { useGetLittersQuery } from "../litters/littersApiSlice"

import { useNavigate, useParams, Link } from "react-router-dom"
import { useState, useEffect, Fragment } from "react"

import useAuth from "../../hooks/useAuth"

const DogPage = () => {

    const navigate = useNavigate()

    const { userId, isAdmin, isSuperAdmin } = useAuth()
    const { dogid } = useParams()

    let filteredLitters
    let childrenLitterIds
    let allChildren
    let siblings
    let filteredParents
    let parentDogs
    let littersContent

    // State for checking how wide is the user's screen
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)

    // Function for handling the resizing of screen
    const handleResize = () => {
        setWindowWidth(window.innerWidth)
    }

    // Always check if a window is being resized
    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
        window.removeEventListener('resize', handleResize)
        }
    }, [])

    // GET the dog with all of it's .values
    const { dog } = useGetDogsQuery("dogsList", {
        selectFromResult: ({ data }) => ({
            dog: data?.entities[dogid]
        }),
    })

    // DELETE method to delete the dog
    const [deleteDog, {
        isLoading: isDelLoading,
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteDogMutation()

    // GET the user who administrates the dog with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[dog?.user]
        }),
    })

    // GET the litter that the dog was born to with all of it's .values
    const { parentLitter } = useGetLittersQuery("littersList", {
        selectFromResult: ({ data }) => ({
            parentLitter: data?.entities[dog?.litter]
        }),
    })

    // GET all the litters
    const {
        data: litters,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetLittersQuery('littersList', {
        pollingInterval: 75000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    // GET all the dogs
    const {
        data: dogs,
        isLoading: isDogsLoading,
        isSuccess: isDogsSuccess,
        isError: isDogsError,
        error: dogsError
    } = useGetDogsQuery('dogsList', {
        pollingInterval: 75000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    // GET the mother dog of the dog's litter
    const { mother } = useGetDogsQuery("dogsList", {
        selectFromResult: ({ data }) => ({
            mother: data?.entities[parentLitter?.mother]
        }),
    })

    // GET the father dog of the dog's litter
    const { father } = useGetDogsQuery("dogsList", {
        selectFromResult: ({ data }) => ({
            father: data?.entities[parentLitter?.father]
        }),
    })
    
    if (isSuccess) {
        const { ids, entities } = litters

        // Filter all the litters to see whether the dog is a parent of any
        const filteredIds = dog?.female === true
            ? ids.filter(litterId => entities[litterId].mother === dog?.id)
            : ids.filter(litterId => entities[litterId].father === dog?.id)

        if (filteredIds?.length) {
            // If yes, store the litter with all of it's values
            filteredLitters = filteredIds.map(litterId => entities[litterId])
            // And keep the ID to look for dogs who belong to said litter (the dog's children)
            childrenLitterIds = filteredIds
        }
    }

    if (isDogsSuccess) {
        const { ids, entities } = dogs

        // Filter all the IDs of dogs who have a litter that THE dog is a parent of (children)
        const filteredIds = ids.filter(dogId => childrenLitterIds?.includes(entities[dogId].litter))
        // Filter all the IDs of dogs who have the same litter as THE dog (siblings)
        const filteredSiblingIds = ids.filter(dogId => dog?.litter?.length && entities[dogId].litter === dog?.litter && dogId !== dog?.id)

        if (filteredSiblingIds?.length) {
            siblings = filteredSiblingIds.map(dogId => entities[dogId])
        }

        if (filteredIds?.length) {
            allChildren = filteredIds.map(dogId => entities[dogId])
        }
    }

    if (isSuccess && isDogsSuccess) {

        const { entities } = dogs

        // Find the ID of the other parent of the litter that THE dog is a parent of
        filteredParents = filteredLitters?.map(litter => {
            if (dog?.female === true) {
                return litter?.father
            } else {
                return litter?.mother
            }
        })

        // If found, store it with all of it's .values
        parentDogs = filteredParents?.map(dogId => entities[dogId])

        littersContent = filteredLitters?.map(litter => 
            <div key={litter?.id}>
                <p>
                    <Link key={litter?.id} className="orange-link" to={`/litters/${litter?.id}`}><b>Litter</b></Link>
                    {(dog?.female === true && litter?.father?.length) || (dog?.female === false && litter?.mother?.length) ? ' with ' : null} 
                    {dog?.female === true ? <Link key={litter?.father} className="orange-link" to={`/dogs/${litter?.father}`}><b>{parentDogs?.find(parent => parent?.id === litter?.father)?.name}</b></Link> : null}
                    {dog?.female === false ? <Link key={litter?.mother} className="orange-link" to={`/dogs/${litter?.mother}`}><b>{parentDogs?.find(parent => parent?.id === litter?.mother)?.name}</b></Link> : null}
                    {litter?.born?.length ? <> born on <b>{litter?.born?.split(' ').slice(1, 4).join(' ')}</b></> : null}
                    {!allChildren?.length ? <><br />This litter doesn't have any puppies added to it</> : null}
                    {allChildren?.map(child => child?.litter === litter?.id 
                        ? <Fragment key={child.id}><br />{child?.female === true ? <b>Daughter </b> : <b>Son </b>}<Link key={child?.id} className="orange-link" to={`/dogs/${child?.id}`}><b>{child?.name}</b></Link></Fragment>
                        : null
                    )}
                </p>
                <br />
            </div> 
        )
    }

    if (!dog) return null

    const content = userId === dog?.user 
        ? <>
            <button
                title="Edit Dog"
                className="black-button three-hundred"
                onClick={() => navigate(`/dogs/edit/${dog?.id}`)}
            >
                Edit
            </button>
            <br />
            <br />
        </>
        : null

    const fatherContent = father
        ? <p><b>Father <Link className="orange-link" to={`/dogs/${father?.id}`}>{father?.name}</Link></b></p>
        : null

    const parentsContent = parentLitter 
        ? <>
            <p><b>Mother <Link className="orange-link" to={`/dogs/${mother?.id}`}>{mother?.name}</Link></b></p>
            {fatherContent}
        </>
        : <p>{dog?.name} is not added to any litter and therefore has no parents in the database</p>

    const siblingsContent = siblings?.length 
        ? <>{siblings.map(sibling => <p><b>{sibling?.female === true 
            ? <>Sister </> 
            : <>Brother </>}</b><Link className="orange-link" to={`/dogs/${sibling?.id}`}><b>{sibling?.name}</b></Link></p>)}<br />
        </>
        : parentLitter 
            ? <><p>{dog?.name} is not connected to any siblings through it's litter in the database</p><br /></>
            : null

    const instagramUrl = dog?.instagram?.length && dog?.instagram !== 'none ' ? `https://instagram.com/${dog?.instagram}` : null
    const facebookUrl = dog?.facebook?.length && dog?.facebook !== 'none ' ? `https://facebook.com/${dog?.facebook}` : null
    const youtubeUrl = dog?.youtube?.length && dog?.youtube !== 'none ' ? `https://youtube.com/@${dog?.youtube}` : null
    const tiktokUrl = dog?.tiktok?.length && dog?.tiktok !== 'none ' ? `https://tiktok.com/@${dog?.tiktok}` : null

    const handleAdminDelete = async () => {
        await deleteDog({ id: dog?.id })
    }

    if (isLoading || isDelLoading || isDogsLoading) return <p>Loading...</p>
    if (isError) littersContent = <p>{error?.data?.message}</p>
    if (isDelError) return <p>{delerror?.data?.message}</p>
    if (isDogsError) return <p>{dogsError?.data?.message}</p>

    if (isDelSuccess) navigate('/dogs')

    return (
        <>
            <p>
                <span className="dog-page-name">{dog?.name}</span>
                {windowWidth > 600 ? null : <br />}
                <span className={windowWidth > 600 ? "nav-right" : null}>
                    <b>Administered by</b> <Link className="orange-link" to={`/users/${user?.id}`}><b>{user?.username}</b></Link>
                </span>
            </p>
            <p>
                {dog?.instagram?.length && dog?.instagram !== 'none ' ? <a href={instagramUrl} rel="noreferrer" target="_blank"><svg className="instagram-icon" xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 448 512"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg></a> : null}
                {dog?.facebook?.length && dog?.facebook !== 'none ' ? <a href={facebookUrl} rel="noreferrer" target="_blank"><svg className="facebook-icon" xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 448 512"><path d="M400 32H48A48 48 0 0 0 0 80v352a48 48 0 0 0 48 48h137.25V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.27c-30.81 0-40.42 19.12-40.42 38.73V256h68.78l-11 71.69h-57.78V480H400a48 48 0 0 0 48-48V80a48 48 0 0 0-48-48z"/></svg></a> : null}
                {dog?.youtube?.length && dog?.youtube !== 'none ' ? <a href={youtubeUrl} rel="noreferrer" target="_blank"><svg className="youtube-icon" xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 576 512"><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/></svg></a> : null}
                {dog?.tiktok?.length && dog?.tiktok !== 'none ' ? <a href={tiktokUrl} rel="noreferrer" target="_blank"><svg className="tiktok-icon" xmlns="http://www.w3.org/2000/svg" height="1.2em" viewBox="0 0 448 512"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/></svg></a> : null}
            </p>
            <br />
            {dog?.image?.length ? <><p><img width="300" height="300" className="dog-profile-picture" src={dog?.image} alt="Dog" /></p><br /></> : null}
            <p className="main-dog-info-title"><b>Main Info</b></p>
            <br />
            <p><b>Good {dog?.female === true ? 'Girl' : 'Boy'}</b></p>
            <p><b>{dog?.breed}</b></p>
            <p><b>Born </b> {dog?.birth?.split(' ').slice(1, 4).join(' ')}</p>
            {dog?.death?.length && dog?.death !== 'none ' ? <p><b>Entered Dog Heaven on </b>{dog?.death?.split(' ').slice(1, 4).join(' ')}</p> : null}
            <p><b>From </b>{dog?.region?.length && dog?.region !== 'none ' ? <>{dog?.region}, </> : null}{dog?.country?.length ? <>{dog?.country}</> : null}</p>
            <br />
            <p><b>{dog?.passport === true ? 'Has a Passport' : 'Does Not Have a Passport'}</b></p>
            <p><b>{dog?.sterilized === true ? null : 'Not '}{dog?.female === true ? 'Sterilized' : 'Castrated'}</b></p>
            {dog?.female === true && dog?.sterilized === false ? <p><b>{dog?.heat === true ? 'Currently in Heat' : 'Currently Not in Heat'}</b></p> : null}
            <p><b>{dog?.microchipped === true ? 'Microchipped' : 'Not Microchipped'}</b></p>
            {dog?.microchipped === true && dog?.chipnumber?.length && dog?.chipnumber !== 'none ' ? <p><b>Chipnumber </b>{dog?.chipnumber}</p> : null}
            <br />
            {dog?.info && dog?.info !== 'none ' 
                ? <><p><b>Additional Info</b></p>
                    <p>{dog?.info}</p>
                    <br /></> 
                : null
            }
            <p className="family-tree-title"><b>Instant Family Tree</b></p>
            <br />
            {parentLitter 
                ? <><p><b>Parents of {dog?.name}'s {dog?.litter ? <Link className="orange-link" to={`/litters/${dog?.litter}`}><b>Litter</b></Link> : 'litter'}</b></p>
                    {parentsContent}</> 
                : <p>{dog?.name} is not added to any litter and therefore has no parents or siblings in the database</p>
            }
            <br />
            {siblingsContent}
            {filteredLitters?.length ? <><p><b>{dog?.name}'s litters and each litter's puppies</b></p><br /></> : null}
            {filteredLitters?.length ? littersContent : <>{dog?.name} has no litters and therefore has no puppies in the database<br /><br /></>}
            {content}
            {userId?.length && dog?.user !== userId
                ? <><button 
                    className="black-button three-hundred"
                    onClick={() => navigate(`/reportdog/${dog?.id}`)}
                >
                    Report Dog
                </button><br /><br /></>
                : null
            }
            {isAdmin || isSuperAdmin
                ? <><button title="Delete as Admin" className="black-button three-hundred" onClick={handleAdminDelete}>Delete as Admin</button></>
                : null
            }
        </>
    )
}

export default DogPage
