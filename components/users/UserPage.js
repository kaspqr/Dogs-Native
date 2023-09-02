import { useParams, useNavigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth"
import { useGetUsersQuery, useUpdateUserMutation } from "./usersApiSlice"
import { useGetDogsQuery, useUpdateDogMutation } from "../dogs/dogsApiSlice"
import { useGetConversationsQuery, useAddNewConversationMutation } from "../conversations/conversationsApiSlice"
import { useGetDogProposesQuery, useAddNewDogProposeMutation, useDeleteDogProposeMutation } from "../dogs/proposeDogApiSlice"
import { useGetFatherProposesQuery, useDeleteFatherProposeMutation } from "../litters/fatherProposesApiSlice"
import { useGetPuppyProposesQuery, useDeletePuppyProposeMutation } from "../litters/puppyProposesApiSlice"
import { useGetAdvertisementsQuery } from "../advertisements/advertisementsApiSlice"
import { useState, useEffect } from "react"
import UserDog from "../dogs/UserDog"
import UserAdvertisement from "../advertisements/UserAdvertisement"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons"

const UserPage = () => {

    const navigate = useNavigate()

    // User that's logged in
    const { userId, isAdmin, isSuperAdmin } = useAuth()

    const [selectedProposeDog, setSelectedProposeDog] = useState('')
    const [selectedAcceptDog, setSelectedAcceptDog] = useState('')

    const [currentAdvertisementPage, setCurrentAdvertisementPage] = useState(1)
    const [newAdvertisementPage, setNewAdvertisementPage] = useState('')

    const [currentDogPage, setCurrentDogPage] = useState(1)
    const [newDogPage, setNewDogPage] = useState('')

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

    // User whose page we're on
    const { id } = useParams()

    // POST method for /conversations
    const [addNewConversation, {
        isLoading: isLoadingNewConversation,
        isError: isErrorNewConversation,
        error: errorNewConversation
    }] = useAddNewConversationMutation()

    // POST method for /dogproposes
    const [addNewDogPropose, {
        isLoading: isLoadingNewDogPropose,
        isError: isErrorNewDogPropose,
        error: errorNewDogPropose
    }] = useAddNewDogProposeMutation()

    // DELETE method for /dogproposes
    const [deleteDogPropose, {
        isLoading: isLoadingDeleteDogPropose,
        isError: isErrorDeleteDogPropose,
        error: errorDeleteDogPropose
    }] = useDeleteDogProposeMutation()

    // DELETE method for /fatherproposes
    const [deleteFatherPropose, {
        isLoading: isLoadingDeleteFatherPropose,
        isError: isErrorDeleteFatherPropose,
        error: errorDeleteFatherPropose
    }] = useDeleteFatherProposeMutation()

    // DELETE method for /puppyproposes
    const [deletePuppyPropose, {
        isLoading: isLoadingDeletePuppyPropose,
        isError: isErrorDeletePuppyPropose,
        error: errorDeletePuppyPropose
    }] = useDeletePuppyProposeMutation()

    // GET the user whose page we're on with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[id]
        }),
    })

    // PATCH function for updating the user
    const [updateUser, {
        isLoading: isUpdateLoading,
        isError: isUpdateError,
        error: updateError
    }] = useUpdateUserMutation()

    // PATCH function for updating a dog
    const [updateDog, {
        isLoading: isUpdateDogLoading,
        isError: isUpdateDogError,
        error: updateDogError
    }] = useUpdateDogMutation()

    // GET all conversations
    const {
        data: conversations,
        isLoading: isConversationLoading,
        isSuccess: isConversationSuccess,
        isError: isConversationError,
        error: conversationError
    } = useGetConversationsQuery('conversationsList', {
        pollingInterval: 75000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    // GET all advertisements made by the user
    const {
        data: advertisements,
        isLoading: isAdvertisementLoading,
        isSuccess: isAdvertisementSuccess,
        isError: isAdvertisementError,
        error: advertisementError
    } = useGetAdvertisementsQuery('advertisementsList', {
        pollingInterval: 75000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    // GET all dog proposals
    const {
        data: dogproposes,
        isLoading: isDogProposeLoading,
        isSuccess: isDogProposeSuccess,
        isError: isDogProposeError,
        error: dogProposeError
    } = useGetDogProposesQuery('dogProposesList', {
        pollingInterval: 75000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    // GET all litter father proposals
    const {
        data: fatherproposes,
        isLoading: isFatherProposeLoading,
        isSuccess: isFatherProposeSuccess,
        isError: isFatherProposeError,
        error: fatherProposeError
    } = useGetFatherProposesQuery('fatherProposesList', {
        pollingInterval: 75000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    // GET all litter puppy proposals
    const {
        data: puppyproposes,
        isLoading: isPuppyProposeLoading,
        isSuccess: isPuppyProposeSuccess,
        isError: isPuppyProposeError,
        error: puppyProposeError
    } = useGetPuppyProposesQuery('puppyProposesList', {
        pollingInterval: 75000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    // Reset pages when going directly from one user's page to another user's page
    useEffect(() => {
        setCurrentAdvertisementPage(1)
        setNewAdvertisementPage('')
        setCurrentDogPage(1)
        setNewDogPage('')
    }, [user])

    // Variable for either an error or content after fetching the user's dogs
    let proposeDogContent
    let myProposalsContent
    let dogPaginationContent
    let finalAdvertisementsContent

    // Variable to store the ID of the conversation between the two users
    let filteredConversation
    
    if (isConversationSuccess) {
        const { ids, entities } = conversations

        const filteredId = ids.find(conversationId => {
            return (entities[conversationId].sender === id && entities[conversationId].receiver === userId)
                || (entities[conversationId].receiver === id && entities[conversationId].sender === userId)
        })

        if (filteredId?.length) {
            filteredConversation = filteredId
        }
    }

    // GET all dogs
    const {
        data: dogs,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetDogsQuery('dogsList', {
        pollingInterval: 75000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })
    
    if (isLoading || isConversationLoading || isDogProposeLoading || isPuppyProposeLoading 
        || isFatherProposeLoading || isUpdateDogLoading || isUpdateLoading || isLoadingDeleteDogPropose 
        || isLoadingDeleteFatherPropose || isLoadingDeletePuppyPropose || isLoadingNewConversation 
        || isLoadingNewDogPropose || isAdvertisementLoading) finalAdvertisementsContent = <p>Loading...</p>
    
    if (isError) finalAdvertisementsContent = <p>{error?.data?.message}</p>
    if (isPuppyProposeError) finalAdvertisementsContent = <p>{puppyProposeError?.data?.message}</p>
    if (isFatherProposeError) finalAdvertisementsContent = <p>{fatherProposeError?.data?.message}</p>
    if (isConversationError) finalAdvertisementsContent = <p>{conversationError?.data?.message}</p>
    if (isDogProposeError) finalAdvertisementsContent = <p>{dogProposeError?.data?.message}</p>
    if (isUpdateDogError) finalAdvertisementsContent = <p>{updateDogError?.data?.message}</p>
    if (isUpdateError) finalAdvertisementsContent = <p>{updateError?.data?.message}</p>
    if (isErrorDeleteDogPropose) finalAdvertisementsContent = <p>{errorDeleteDogPropose?.data?.message}</p>
    if (isErrorDeletePuppyPropose) finalAdvertisementsContent = <p>{errorDeletePuppyPropose?.data?.message}</p>
    if (isErrorDeleteFatherPropose) finalAdvertisementsContent = <p>{errorDeleteFatherPropose?.data?.message}</p>
    if (isErrorNewDogPropose) finalAdvertisementsContent = <p>{errorNewDogPropose?.data?.message}</p>
    if (isErrorNewConversation) finalAdvertisementsContent = <p>{errorNewConversation?.data?.message}</p>
    if (isAdvertisementError) finalAdvertisementsContent = <p>{advertisementError?.data?.message}</p>

    const handleProposeDog = async () => {
        await addNewDogPropose({ "dog": selectedProposeDog, "user": user?.id })
        setSelectedProposeDog('')
    }

    const handleAcceptDog = async () => {
        await updateDog({ "id": selectedAcceptDog, "user": userId })
        setSelectedAcceptDog('')
    }

    // Variable for storing all dogs that belong to the logged in user
    let filteredProposeDogs = []

    // Variable for storing all proposals for dogs that were made to the user whose page we're on
    let filteredProposedDogs

    let myProposals = []

    let deleteProposalsContent
    
    if (isSuccess && isDogProposeSuccess && isFatherProposeSuccess && isPuppyProposeSuccess && isAdvertisementSuccess) {
        const { ids, entities } = dogs

        const { ids: proposeIds, entities: proposeEntities } = dogproposes
        const { ids: fatherProposeIds, entities: fatherProposeEntities } = fatherproposes
        const { ids: puppyProposeIds, entities: puppyProposeEntities } = puppyproposes
        const { ids: advertisementIds, entities: advertisementEntities } = advertisements

        // All IDs of Dog Proposes that were made to the user whose page we're on
        const filteredProposeIds = proposeIds?.filter(proposeId => proposeEntities[proposeId]?.user === user?.id)

        // All Advertisement objects of advertisements that were made by the user whose page we're on
        const filteredAdvertisementIds = advertisementIds?.filter(advertisementId => advertisementEntities[advertisementId]?.poster === user?.id)

        // All IDs of Dog Proposes that were made to the user that's logged in
        const filteredMyProposeIds = userId !== user?.id 
            ? proposeIds?.filter(proposeId => proposeEntities[proposeId]?.user === userId)
            : null
        
        // All IDs of dogs that are owned by the user whose page we're on
        const filteredIds = ids?.filter(dogId => entities[dogId]?.user === user?.id)

        // All IDs of dogproposes, fatherproposes and puppyproposes that match the dogs 
        // Owned by the user whose page we're on and who is also logged in
        const filteredMadeDogProposes = user?.id === userId
            ? proposeIds?.filter(proposeId => filteredIds?.includes(proposeEntities[proposeId]?.dog))
            : null

        const filteredMadeFatherProposes = user?.id === userId
            ? fatherProposeIds?.filter(proposeId => filteredIds?.includes(fatherProposeEntities[proposeId]?.father))
            : null

        const filteredMadePuppyProposes = user?.id === userId
            ? puppyProposeIds?.filter(proposeId => filteredIds?.includes(puppyProposeEntities[proposeId]?.puppy))
            : null

        async function handleDeleteDogProposal(proposal) {
            await deleteDogPropose({ "id": proposal })
        }

        async function handleDeleteFatherProposal(proposal) {
            await deleteFatherPropose({ "id": proposal })
        }

        async function handleDeletePuppyProposal(proposal) {
            await deletePuppyPropose({ "id": proposal })
        }

        if (filteredMadeDogProposes?.length || filteredMadeFatherProposes?.length || filteredMadePuppyProposes?.length) {
            const madeDogProposesContent = filteredMadeDogProposes?.length
                ? <><button 
                    title="Delete Dog Transfer Proposals Made by Me"
                    className="black-button three-hundred" 
                    onClick={() => filteredMadeDogProposes?.forEach((proposal) => {
                        handleDeleteDogProposal(proposal)
                    })}
                >
                    Delete Dog Proposals Made by Me
                </button>
                <br />
                <br />
                </>
                : null

            const madeFatherProposesContent = filteredMadeFatherProposes?.length
                ? <><button 
                    title="Delete Father Proposals Made by Me"
                    className="black-button three-hundred" 
                    onClick={() => filteredMadeFatherProposes?.forEach((proposal) => {
                        handleDeleteFatherProposal(proposal)
                    })}
                >
                    Delete Father Proposals Made by Me
                </button>
                <br />
                <br />
                </>
                : null

            const madePuppyProposesContent = filteredMadePuppyProposes?.length
                ? <><button 
                    title="Delete Puppy Proposals Made by Me"
                    className="black-button three-hundred" 
                    onClick={() => filteredMadePuppyProposes?.forEach((proposal) => {
                        handleDeletePuppyProposal(proposal)
                    })}
                >
                    Delete Puppy Proposals Made by Me
                </button>
                <br />
                <br />
                </>
                : null

            deleteProposalsContent = <>
                {madeDogProposesContent}
                {madeFatherProposesContent}
                {madePuppyProposesContent}
            </>
        }

        // All Dog Objects of the user that's logged in AND is not the user whose page we're on
        // To eliminate the possibility of proposing your own dogs to yourself
        const filteredProposeDogIds = userId?.length && user?.id !== userId
            ? ids?.filter(dogId => entities[dogId]?.user === userId)
            : null

        // If there are Dog Proposes made to the user that's logged in
        // And there are Dogs that the user whose page we're on, owns
        // Fill myProposals array with dogs 
        filteredMyProposeIds?.forEach(proposal => { // For each proposal made to the user that's logged in
            if (filteredIds?.includes(proposeEntities[proposal]?.dog)) { // If the user whose page we're on has a dog whose ID matches with the proposals dog
                myProposals.push(entities[proposeEntities[proposal]?.dog])
            }
        })

        // If dogs were proposed to the user whose page we're on, fill filteredProposedDogs array with said dog objects
        if (filteredProposeIds?.length) {
            filteredProposedDogs = filteredProposeIds.map(proposeId => proposeEntities[proposeId]?.dog)
        }

        // For each dog's id that's owned by the logged in user
        // Check that said dog is not included in the DogProposes that have been made to the user whose page we're on
        // Add those dogs to filteredProposeDogs array
        filteredProposeDogIds?.forEach(dogId => {
            if (!filteredProposedDogs?.includes(dogId)) {
                filteredProposeDogs.push(entities[dogId])
            }
        })

        if (filteredProposeDogs?.length) {
            const proposeDogs = filteredProposeDogs?.map(dog => <option value={dog?.id} key={dog?.id}>{dog?.name}</option>)

            proposeDogContent = proposeDogs?.length
                ? <>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <label htmlFor="transfer-selected-dog"><b>Transfer Dog to {user?.username}</b></label>
                        <br />
                        <select name="transfer-selected-dog" value={selectedProposeDog} onChange={(e) => setSelectedProposeDog(e.target.value)}>
                            <option value="">--</option>
                            {proposeDogs}
                        </select>
                        <br />
                        <br />
                        <button 
                            title="Propose Transferring Selected Dog to User"
                            className="black-button three-hundred"
                            disabled={!selectedProposeDog?.length}
                            style={!selectedProposeDog?.length ? {backgroundColor: "grey", cursor: "default"} : null}
                            onClick={handleProposeDog}
                        >
                            Propose Transfer
                        </button>
                        <br />
                        <br />
                    </form>
                </>
                : null
        }

        if (myProposals?.length) {
            const acceptDogs = myProposals?.map(dog => <option value={dog?.id} key={dog?.id}>{dog?.name}</option>)

            myProposalsContent = acceptDogs?.length 
                ? <>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <label htmlFor="accept-selected-dog"><b>Accept Dog{myProposals?.length > 1 ? 's' : null} Offered by {user?.username}</b></label>
                        <br />
                        <select name="accept-selected-dog" value={selectedAcceptDog} onChange={(e) => setSelectedAcceptDog(e.target.value)}>
                            <option value="">--</option>
                            {acceptDogs}
                        </select>
                        <br />
                        <br />
                        <button
                            title="Accept Ownership of Selected Dog's Account"
                            className="black-button three-hundred"
                            disabled={!selectedAcceptDog?.length}
                            style={!selectedAcceptDog?.length ? {backgroundColor: "grey", cursor: "default"} : null}
                            onClick={handleAcceptDog}
                        >
                            Accept Dog
                        </button>
                        <br />
                        <br />
                    </form>
                </>
                : null
        }

        // Pagination for the user's advertisements
        const itemsPerAdvertisementPage = 5

        const maxAdvertisementPage = Math.ceil(filteredAdvertisementIds?.length ? filteredAdvertisementIds?.length / itemsPerAdvertisementPage : 1)

        const startAdvertisementIndex = (currentAdvertisementPage - 1) * itemsPerAdvertisementPage
        const endAdvertisementIndex = startAdvertisementIndex + itemsPerAdvertisementPage

        // Advertisements to display on the current page
        const advertisementsToDisplay = filteredAdvertisementIds?.length
        ? filteredAdvertisementIds.slice(startAdvertisementIndex, endAdvertisementIndex)
        : null

        const goToAdvertisementPageButtonDisabled = newAdvertisementPage < 1 
            || newAdvertisementPage > maxAdvertisementPage || parseInt(newAdvertisementPage) === currentAdvertisementPage

        // Advertisement component for each advertisement
        const tableAdvertisementContent = advertisementsToDisplay?.map(advertisementId => (
            <UserAdvertisement key={advertisementId} advertisementId={advertisementId} />
        ))

        finalAdvertisementsContent = !filteredAdvertisementIds?.length ? null : <>
            {userId === user?.id || !userId ? null : <><br /><br /></>}
            <p><b>{filteredAdvertisementIds?.length} Active Advertisement{filteredAdvertisementIds?.length === 1 ? null : 's'}</b></p>
            <br />
            <p>
            <button 
                title="Go to Previous Advertisements Page"
                style={currentAdvertisementPage === 1 ? {display: "none"} : null}
                disabled={currentAdvertisementPage === 1}
                className="pagination-button"
                onClick={() => {
                setCurrentAdvertisementPage(currentAdvertisementPage - 1)
                }}
            >
                <FontAwesomeIcon color="rgb(235, 155, 52)" icon={faArrowLeft} />
            </button>

            {` Page ${currentAdvertisementPage} of ${maxAdvertisementPage} `}

            <button 
                title="Go to Next Advertisement Page"
                className="pagination-button"
                style={currentAdvertisementPage === maxAdvertisementPage ? {display: "none"} : null}
                disabled={currentAdvertisementPage === maxAdvertisementPage}
                onClick={() => {
                setCurrentAdvertisementPage(currentAdvertisementPage + 1)
                }}
            >
                <FontAwesomeIcon color="rgb(235, 155, 52)" icon={faArrowRight} />
            </button>

            {windowWidth > 600 || maxAdvertisementPage === 1 ? null : <><br /><br /></>}

            <span 
                className="new-page-input-span"
                style={maxAdvertisementPage === 1 
                ? {display: "none"}
                : windowWidth > 600 
                    ? null 
                    : {float: "none"}
                }
            >
                <label htmlFor="new-advertisement-page-input" className="off-screen">Advertisements Page Number</label>
                <input 
                    name="new-advertisement-page-input"
                    onChange={(e) => setNewAdvertisementPage(e.target.value)} 
                    value={newAdvertisementPage} 
                    type="number" 
                    className="new-page-input"
                    placeholder="Page no."
                />
                <button
                    title="Go to the Specified Advertisements Page"
                    style={goToAdvertisementPageButtonDisabled ? {backgroundColor: "grey", cursor: "default"} : null}
                    disabled={goToAdvertisementPageButtonDisabled}
                    onClick={() => {
                        if (newAdvertisementPage >= 1 && newAdvertisementPage <= maxAdvertisementPage) {
                            setCurrentAdvertisementPage(parseInt(newAdvertisementPage))
                        }
                    }}
                    className="black-button"
                >
                    Go to Page
                </button>
            </span>

            </p>

            <br />
            {tableAdvertisementContent}
            <br />
        </>


        // Pagination for the user's dogs
        const itemsPerDogPage = 5

        const maxDogPage = Math.ceil(filteredIds?.length ? filteredIds?.length / itemsPerDogPage : 1)

        const startDogIndex = (currentDogPage - 1) * itemsPerDogPage
        const endDogIndex = startDogIndex + itemsPerDogPage

        // Dogs to display on the current page
        const dogsToDisplay = filteredIds?.length
        ? filteredIds.slice(startDogIndex, endDogIndex)
        : null

        const goToDogPageButtonDisabled = newDogPage < 1 
            || newDogPage > maxDogPage || parseInt(newDogPage) === currentDogPage

        // Dog component for each dog
        const tableDogContent = dogsToDisplay?.map(dogId => (
            <UserDog key={dogId} dogId={dogId} />
        ))

        dogPaginationContent = !filteredIds?.length ? null : <>
            <p><b>{filteredIds?.length} Dog{filteredIds?.length === 1 ? null : 's'} Administered</b></p><br />
            <p>
            <button 
                title="Go to Previous Dogs Page"
                style={currentDogPage === 1 ? {display: "none"} : null}
                disabled={currentDogPage === 1}
                className="pagination-button"
                onClick={() => {
                setCurrentDogPage(currentDogPage - 1)
                }}
            >
                <FontAwesomeIcon color="rgb(235, 155, 52)" icon={faArrowLeft} />
            </button>

            {` Page ${currentDogPage} of ${maxDogPage} `}

            <button 
                title="Go to Next Dog Page"
                className="pagination-button"
                style={currentDogPage === maxDogPage ? {display: "none"} : null}
                disabled={currentDogPage === maxDogPage}
                onClick={() => {
                setCurrentDogPage(currentDogPage + 1)
                }}
            >
                <FontAwesomeIcon color="rgb(235, 155, 52)" icon={faArrowRight} />
            </button>

            {windowWidth > 600 || maxDogPage === 1 ? null : <><br /><br /></>}

            <span 
                className="new-page-input-span"
                style={maxDogPage === 1 
                ? {display: "none"}
                : windowWidth > 600 
                    ? null 
                    : {float: "none"}
                }
            >
                <label htmlFor="new-dog-page-input" className="off-screen">Dogs Page Number</label>
                <input 
                    name="new-dog-page-input"
                    onChange={(e) => setNewDogPage(e.target.value)} 
                    value={newDogPage} 
                    type="number" 
                    className="new-page-input"
                    placeholder="Page no."
                />
                <button
                    title="Go to the Specified Dogs Page"
                    style={goToDogPageButtonDisabled ? {backgroundColor: "grey", cursor: "default"} : null}
                    disabled={goToDogPageButtonDisabled}
                    onClick={() => {
                        if (newDogPage >= 1 && newDogPage <= maxDogPage) {
                            setCurrentDogPage(parseInt(newDogPage))
                        }
                    }}
                    className="black-button"
                >
                    Go to Page
                </button>
            </span>

            </p>

            <br />
            {tableDogContent}
            <br />
        </>
    }

    if (!user) return <p>User not found</p>

    // Only available when userId === id (the user visiting === the user whose page we're on)
    const handleEdit = () => navigate(`/users/edit/${id}`)

    // If the user visiting is someone else, they can send a message instead
    const handleMessage = async () => {
        // If they already have a conversation started, navigate to it
        if (filteredConversation?.length) {
            navigate(`/conversations/${filteredConversation}`)
        } else {
            // Create a new conversation, then navigate to it
            const response = await addNewConversation({ sender: userId, receiver: id })

            if (response) {
                navigate(`/conversations/${response?.data?.newConversationId}`)
            }
        }
    }

    const handleBanUser = async () => {
        await updateUser({ id: user?.id, active: false })
    }

    const handleUnbanUser = async () => {
        await updateUser({ id: user?.id, active: true })
    }

    const handleMakeAdmin = async () => {
        await updateUser({ id: user?.id, roles: user?.roles?.concat(["Admin"]) })
    }

    const handleRemoveAdmin = async () => {
        await updateUser({ id: user?.id, roles: ["User"] })
    }

    const content = (
        <>
            <p className="user-page-username">
                {user?.username}
                {userId === id 
                    ? <button
                        title="Edit Profile"
                        className="user-page-edit-button black-button"
                        onClick={handleEdit}
                    >
                        Edit Profile
                    </button> 
                    : null
                }
                {userId?.length && userId !== id 
                    ? <button
                        title="Message User"
                        className="user-page-edit-button black-button"
                        onClick={handleMessage}
                    >
                        Message
                    </button> 
                    : null
                }
            </p>
            {user?.image?.length && user?.image !== 'none ' 
                ? <><p><img width="300" height="300" className="user-profile-picture" src={user?.image} alt="User" /></p><br /></> 
                : null
            }
            <p><b>{user?.name}</b></p>
            <br />
            <p><b>From </b>{user?.region && user?.region !== 'none ' ? `${user?.region}, ` : null}{user?.country}</p>
            <br />
            {user?.bio?.length ? <><p><b>Bio</b></p><p>{user.bio}</p><br /></> : null}
            {proposeDogContent}
            {myProposalsContent}
            {deleteProposalsContent}
            {userId?.length && id !== userId
                ? <button 
                    title="Report User"
                    className="black-button three-hundred"
                    onClick={() => navigate(`/reportuser/${id}`)}
                >
                    Report User
                </button>
                : null
            }
            {(isAdmin || isSuperAdmin) && !user?.roles?.includes("Admin", "SuperAdmin") && id !== userId
                ? user?.active
                    ? <><br /><br /><button title="Ban User" className="black-button three-hundred" onClick={handleBanUser}>Ban User</button></>
                    : <><br /><br /><button title="Unban User" className="black-button three-hundred" onClick={handleUnbanUser}>Unban User</button></>
                : null
            }
            {isSuperAdmin && !user?.roles?.includes("SuperAdmin") && id !== userId
                ? !user?.roles?.includes("Admin")
                    ? <><br /><br /><button title="Make Admin" className="black-button three-hundred" onClick={handleMakeAdmin}>Make Admin</button></>
                    : <><br /><br /><button title="Remove Admin" className="black-button three-hundred" onClick={handleRemoveAdmin}>Remove Admin</button></>
                : null
            }
            {finalAdvertisementsContent}
            {dogPaginationContent}
        </>
    )

    if (!isAdmin && !isSuperAdmin && user?.active === false) return <p>This user is banned</p>

    return content
}

export default UserPage
