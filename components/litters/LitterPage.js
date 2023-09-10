import { useGetLittersQuery, useUpdateLitterMutation, useDeleteLitterMutation } from "./littersApiSlice"
import { useGetFatherProposesQuery, useAddNewFatherProposeMutation } from "./fatherProposesApiSlice"
import { useGetPuppyProposesQuery, useAddNewPuppyProposeMutation } from "./puppyProposesApiSlice"
import { useGetDogsQuery, useUpdateDogMutation } from "../dogs/dogsApiSlice"
import { useNavigate, useParams, Link } from "react-router-dom"
import useAuth from "../../hooks/useAuth"
import Dog from '../dogs/Dog'
import { useState, useEffect } from "react"
import DogIcon from "../../config/images/DogIcon.jpg"

const LitterPage = () => {

    // PATCH function to update a dog when added to THE litter
    const [updateDog, {
        isLoading: isUpdateLoading,
        isSuccess: isUpdateSuccess,
        isError: isUpdateError,
        error: updateError
    }] = useUpdateDogMutation()

    // DELETE function for THE litter
    const [deleteLitter, {
        isLoading: isDelLoading,
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delError
    }] = useDeleteLitterMutation()

    // POST function for THE father proposal
    const [addNewFatherPropose, {
        isLoading: isAddFatherProposeLoading,
        isSuccess: isAddFatherProposeSuccess,
        isError: isAddFatherProposeError,
        error: addFatherProposeError
    }] = useAddNewFatherProposeMutation()

    // POST function for THE puppy proposal
    const [addNewPuppyPropose, {
        isLoading: isAddPuppyProposeLoading,
        isSuccess: isAddPuppyProposeSuccess,
        isError: isAddPuppyProposeError,
        error: addPuppyProposeError
    }] = useAddNewPuppyProposeMutation()

    // PATCH function to add a father to the litter
    const [updateLitter, {
        isLoading: isLitterLoading,
        isSuccess: isLitterSuccess,
        isError: isLitterError,
        error: litterError
    }] = useUpdateLitterMutation()

    const [selectedDog, setSelectedDog] = useState('')
    const [selectedFather, setSelectedFather] = useState('')
    const [selectedProposeFather, setSelectedProposeFather] = useState('')
    const [selectedProposePuppy, setSelectedProposePuppy] = useState('')
    const [confirmDelete, setConfirmDelete] = useState('')
    const [deletionVisible, setDeletionVisible] = useState(false)
    const [confirmRemove, setConfirmRemove] = useState('')
    const [removalVisible, setRemovalVisible] = useState(false)

    const navigate = useNavigate()

    const { userId } = useAuth()

    const { litterid } = useParams()

    const day = 1000 * 60 * 60 * 24

    // GET the litter with all of it's .values
    const { litter } = useGetLittersQuery("littersList", {
        selectFromResult: ({ data }) => ({
            litter: data?.entities[litterid]
        }),
    })

    // GET the dog that's the mother of THE litter
    const { mother } = useGetDogsQuery("dogsList", {
        selectFromResult: ({ data }) => ({
            mother: data?.entities[litter?.mother?.toString()]
        }),
    })

    // GET the dog that's the father of THE litter
    const { father } = useGetDogsQuery("dogsList", {
        selectFromResult: ({ data }) => ({
            father: data?.entities[litter?.father?.toString()]
        }),
    })

    // GET all the dogs
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

    // GET all the father proposals
    const {
        data: fatherProposes,
        isLoading: isAllFatherProposesLoading,
        isSuccess: isAllFatherProposesSuccess,
        isError: isAllFatherProposesError,
        error: allFatherProposesError
    } = useGetFatherProposesQuery('fatherProposesList', {
        pollingInterval: 75000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    // GET all the puppy proposals
    const {
        data: puppyProposes,
        isLoading: isAllPuppyProposesLoading,
        isSuccess: isAllPuppyProposesSuccess,
        isError: isAllPuppyProposesError,
        error: allPuppyProposesError
    } = useGetPuppyProposesQuery('puppyProposesList', {
        pollingInterval: 75000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    // Go to litters page if THE litter has been deleted successfully
    useEffect(() => {
        if (isDelSuccess) {
            navigate('/litters')
        }
    }, [isDelSuccess, navigate])
    
    let dogContent
    let optionsContent
    let fatherOptionsContent
    let filteredDogs
    let filteredUserDogs
    
    if (isLoading || isDelLoading || isUpdateLoading || isLitterLoading || isAllFatherProposesLoading 
        || isAddFatherProposeLoading || isAddPuppyProposeLoading || isAllPuppyProposesLoading) dogContent = <p>Loading...</p>
    
    if (isError) dogContent = <p>{error?.data?.message}</p>
    if (isUpdateError) dogContent = <p>{updateError?.data?.message}</p>
    if (isDelError) dogContent = <p>{delError?.data?.message}</p>
    if (isLitterError) dogContent = <p>{litterError?.data?.message}</p>
    if (isAllFatherProposesError) dogContent = <p>{allFatherProposesError?.data?.message}</p>
    if (isAllPuppyProposesError) dogContent = <p>{allPuppyProposesError?.data?.message}</p>
    if (isAddFatherProposeError) dogContent = <p>{addFatherProposeError?.data?.message}</p>
    if (isAddPuppyProposeError) dogContent = <p>{addPuppyProposeError?.data?.message}</p>

    let filteredFathers
    let proposedFatherContent
    let proposedPuppyContent
    
    if ((isSuccess && isAllPuppyProposesSuccess && isAllFatherProposesSuccess) 
        || isUpdateSuccess || isAddFatherProposeSuccess || isAddPuppyProposeSuccess 
        || isLitterSuccess) {

        const { ids, entities } = dogs

        const { ids: fatherProposalIds, entities: fatherProposalEntities } = fatherProposes

        const { ids: puppyProposalIds, entities: puppyProposalEntities } = puppyProposes

        // Filter all the IDs of dogs whose litter is THE litter
        const filteredIds = ids.filter(dogId => entities[dogId].litter === litter?.id)

        // Filter all the IDs of father proposals whose litter is THE litter
        const filteredFatherProposalIds = fatherProposalIds.filter(fatherProposalId => 
            fatherProposalEntities[fatherProposalId].litter === litter?.id)

        // Filter all the IDs of puppy proposals whose litter is THE litter
        const filteredPuppyProposalIds = puppyProposalIds.filter(puppyProposalId => 
            puppyProposalEntities[puppyProposalId].litter === litter?.id)

        let filteredFatherProposals
        let filteredPuppyProposals

        // Convert IDs to objects with .values
        if (filteredFatherProposalIds?.length) {
            filteredFatherProposals = filteredFatherProposalIds.map(proposalId => fatherProposalEntities[proposalId].father)
        }

        if (filteredPuppyProposalIds?.length) {
            filteredPuppyProposals = filteredPuppyProposalIds.map(proposalId => puppyProposalEntities[proposalId].puppy)
        }
        
        // Filter all the IDs of dogs whose administrative user is the logged in user
        // AND is neither the mother or the father of THE litter
        // AND either matches the breed or is 'Mixed breed' if the parents of THE litter are different breeds
        // AND is not already added to this litter
        // AND was born at earliest on the day of the litter, and at latest, 7 days after that
        // These dogs are the ones the logged in user is able to add to the litter
        const filteredUserIds = ids.filter(dogId => entities[dogId].user === userId 
                && entities[dogId].id !== mother?.id
                && entities[dogId].id !== father?.id
                && entities[dogId].breed === litter?.breed
                && new Date(entities[dogId].birth).getTime() >= new Date(litter?.born).getTime() 
                && new Date(entities[dogId].birth).getTime() <= new Date(new Date(litter?.born).getTime() + 7 * day).getTime()
                && !filteredPuppyProposals?.includes(entities[dogId].id)
                && !filteredFatherProposals?.includes(entities[dogId].id)
                && !filteredIds.includes(entities[dogId].id))


        // Filter the dogs whose administrative user is the logged in user
        // AND is neither the father or the mother of the litter
        // AND is not already added to the litter
        // AND was born more than 30 days before the litter
        // AND is a male dog
        // These are the dogs that the user is able to add as the father of the litter
        const filteredFatherIds = ids.filter(dogId => entities[dogId].user === userId 
                && entities[dogId].id !== father?.id
                && entities[dogId].female === false
                && new Date(entities[dogId].birth).getTime() < new Date(new Date(litter?.born).getTime() - 30 * day)
                && !filteredFatherProposals?.includes(entities[dogId].id)
                && !filteredPuppyProposals?.includes(entities[dogId].id)
                && ((entities[dogId].breed !== 'Mixed breed' && entities[dogId].breed !== mother?.breed && litter?.breed === 'Mixed breed') 
                    || (entities[dogId].breed === 'Mixed breed' && litter?.breed === 'Mixed breed')
                    || (entities[dogId].breed === litter?.breed && litter?.breed === mother?.breed))
                && !filteredIds.includes(entities[dogId].id))

        // Convert IDs to objects with .values
        if (filteredIds?.length) filteredDogs = filteredIds.map(dogId => entities[dogId])
        if (filteredFatherIds?.length) filteredFathers = filteredFatherIds.map(dogId => entities[dogId])
        if (filteredUserIds?.length) filteredUserDogs = filteredUserIds.map(dogId => entities[dogId])

        if (userId === mother?.user) {
            proposedFatherContent = filteredFatherProposals?.map(proposal => {
                return <option value={proposal} key={proposal}>{entities[proposal]?.name}</option>
            })

            proposedPuppyContent = filteredPuppyProposals?.map(proposal => {
                return <option value={proposal} key={proposal}>{entities[proposal]?.name}</option>
            })
        }

        // Variable to store the LitterDog component for each dog belonging to the litter
        let tableContent

        if (filteredDogs?.length) {
            tableContent = filteredDogs.map(dog => (
               <Dog key={dog.id} dogId={dog.id} />
            ))
        }

        // List of <option>s for each dog the user is able to add to the litter
        if (filteredUserDogs?.length) {
            optionsContent = filteredUserDogs.map(dog => (
               <option value={dog.id} key={dog.id}>{dog.name}</option>
            ))
        }

        // List of <option>s for each dog the user is able to add as the father of the litter
        if (filteredFathers?.length) {
            fatherOptionsContent = filteredFathers.map(dog => (
               <option value={dog.id} key={dog.id}>{dog.name}</option>
            ))
        }
      
        dogContent = tableContent

    }

    if (!litter || !mother) return null

    let content = null

    // DELETE THE litter
    async function handleDeleteLitter() {
        await deleteLitter({ id: litterid })
        setDeletionVisible(false)
        setConfirmDelete('')
    }

    // Option to DELETE the litter only for the user that is the administrative user of the litter's mother dog
    if (mother?.user === userId) {
        content = (
            <>
                <br />
                <button
                    title="Delete Litter"
                    className="black-button three-hundred"
                    onClick={() => setDeletionVisible(!deletionVisible)}
                >
                    Delete Litter
                </button>
                {deletionVisible === false ? null 
                    : <>
                    <br />
                    <br />
                    <form onSubmit={(e) => e.preventDefault()}>
                        <label htmlFor="confirm-delete">
                            <b>Type "confirmdelete" and click on the Confirm Deletion button to delete your dog's litter from the database.</b>
                        </label>
                        <br />
                        <input className="three-hundred" name="confirm-delete" type="text" value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} />
                        <br />
                        <br />
                    </form>
                    <button
                        className="black-button three-hundred"
                        title="Confirm Deletion"
                        disabled={confirmDelete !== 'confirmdelete'}
                        style={confirmDelete !== 'confirmdelete' ? {backgroundColor: "grey", cursor: "default"} : null}
                        onClick={() => handleDeleteLitter()}
                    >
                        Confirm Deletion
                    </button>
                </>}
            </>
        )
    }

    // Add litter to the user's dog
    async function addToLitter() {
        await updateDog({ "id": selectedDog, "litter": litterid })
        setSelectedDog('')
    }

    // Add litter to the proposed puppy
    const addProposedPuppyToLitter = async () => {
        await updateDog({ "id": selectedProposePuppy, "litter": litterid })
        setSelectedProposePuppy('')
    }

    // Add father dog to the litter
    const addFatherToLitter = async () => {
        await updateLitter({ "id": litterid, "father": selectedFather })
        setSelectedFather('')
    }

    // Propose father dog to the litter
    const proposeFatherToLitter = async () => {
        await addNewFatherPropose({ "litter": litterid, "father": selectedFather })
        setSelectedFather('')
    }

    // Propose puppy dog to the litter
    const proposePuppyToLitter = async () => {
        await addNewPuppyPropose({ "litter": litterid, "puppy": selectedDog })
        setSelectedDog('')
    }

    // Add proposed father to the litter
    const addProposedFatherToLitter = async () => {
        await updateLitter({ "id": litterid, "father": selectedProposeFather })
        setSelectedProposeFather('')
    }

    const handleRemoveFather = async () => {
        await updateLitter({ "id": litterid, "removeFather": true })
        setConfirmRemove('')
        setRemovalVisible(false)
    }

    // Boolean to control the style and 'disabled' value of the ADD FATHER button
    const canSaveFather = selectedFather?.length && !isLoading
    const fatherButtonStyle = !canSaveFather ? {backgroundColor: "grey", cursor: "default"} : null

    const fatherContent = father?.id?.length || !filteredFathers?.length
        ? null
        : <><form onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="pick-your-dog"><b>{userId === mother?.user ? 'Add ' : 'Propose '}Father to Litter</b></label>
                <br />
                <select name="pick-your-dog" value={selectedFather} onChange={(e) => setSelectedFather(e.target.value)}>
                    <option value="">Pick Your Dog</option>
                    {fatherOptionsContent}
                </select>
                <br />
                <br />
                <button
                    title={userId === mother?.user ? 'Add Father' : 'Propose Father'}
                    className="black-button three-hundred"
                    style={fatherButtonStyle}
                    disabled={!canSaveFather}
                    onClick={userId === mother?.user ? addFatherToLitter : proposeFatherToLitter}
                >
                    {userId === mother?.user ? 'Add ' : 'Propose '}Father
                </button>
                <br />
                <br />
            </form></>

    const addProposedFatherContent = proposedFatherContent?.length && !father?.id?.length
        ? <><form onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="add-proposed-father"><b>Add Proposed Father</b></label>
            <br />
            <select name="add-proposed-father" value={selectedProposeFather} onChange={(e) => setSelectedProposeFather(e.target.value)}>
                <option value="">--</option>
                {proposedFatherContent}
            </select>
            <br />
            <br />
            <button
                title="Add Proposed Father"
                className="black-button three-hundred"
                style={!selectedProposeFather?.length ? {backgroundColor: "grey", cursor: "default"} : null}
                disabled={!selectedProposeFather?.length}
                onClick={addProposedFatherToLitter}
            >
                Add Father
            </button>
            <br />
            <br />
        </form></>
        : null

    const addProposedPuppyContent = proposedPuppyContent?.length && (litter?.children > filteredDogs?.length || !filteredDogs?.length)
        ? <><form onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="add-proposed-puppy"><b>Add Proposed Puppy</b></label>
            <br />
            <select name="add-proposed-puppy" value={selectedProposePuppy} onChange={(e) => setSelectedProposePuppy(e.target.value)}>
                <option value="">--</option>
                {proposedPuppyContent}
            </select>
            <br />
            <br />
            <button
                title="Add Proposed Puppy"
                className="black-button three-hundred"
                style={!selectedProposePuppy?.length ? {backgroundColor: "grey", cursor: "default"} : null}
                disabled={!selectedProposePuppy?.length}
                onClick={addProposedPuppyToLitter}
            >
                Add Puppy
            </button>
            <br />
            <br />
        </form></>
        : null

    const addPuppyContent = filteredUserDogs?.length && (litter?.children > filteredDogs?.length || !filteredDogs?.length)
        ? <><form onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="pick-dog"><b>{userId === mother?.user ? 'Add ' : 'Propose '}Puppy to Litter</b></label>
            <br />
            <select name="pick-dog" value={selectedDog} onChange={(e) => setSelectedDog(e.target.value)}>
                <option value="">Pick Your Dog</option>
                {optionsContent}
            </select>
            <br />
            <br />
            <button
                title={userId === mother?.user ? 'Add Dog' : 'Propose Dog'}
                className="black-button three-hundred"
                disabled={selectedDog?.length ? false : true}
                style={selectedDog?.length ? null : {backgroundColor: "grey", cursor: "default"}}
                onClick={userId === mother?.user ? () => addToLitter() : proposePuppyToLitter}
            >
                {userId === mother?.user ? 'Add ' : 'Propose '}Puppy
            </button>
            <br />
            <br />
        </form></>
        : null

    const deleteFatherContent = father?.id?.length && (userId === mother?.user || userId === father?.user)
        ? <><button
            title="Remove Father from Litter"
            className="black-button three-hundred"
            onClick={() => setRemovalVisible(!removalVisible)}
        >
            Remove Father
        </button>
        <br />
        <br />
        {removalVisible === false ? null 
            : <>
            <form onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="confirm-remove">
                    <b>Type "confirmremove" and click on the Confirm Removal button to remove your dog from the litter's father position</b>
                </label>
                <br />
                <input className="three-hundred" name="confirm-remove" type="text" value={confirmRemove} onChange={(e) => setConfirmRemove(e.target.value)} />
                <br />
                <br />
            </form>
            <button
                className="black-button three-hundred"
                title="Confirm Removal"
                disabled={confirmRemove !== 'confirmremove'}
                style={confirmRemove !== 'confirmremove' ? {backgroundColor: "grey", cursor: "default"} : null}
                onClick={handleRemoveFather}
            >
                Confirm Removal
            </button>
            <br />
            <br />
        </>}
        </>
        : null

    return (
        <>
            <div className="litter-parents-div">
                <div className="litter-mother-div">
                    {mother?.image?.length && mother?.image !== 'none ' 
                        ? <img width="150px" height="150px" className="dog-profile-picture" src={mother?.image} alt="Mother" />
                        : <img width="150px" height="150px" className="dog-profile-picture" src={DogIcon} alt="Mother" />
                    }

                    <br />

                    <span className="litter-mother-span">Mother<br />
                    <Link className="orange-link" to={`/dogs/${mother.id}`}><b>{mother?.name}</b></Link>
                    <br /></span>
                </div>

                <div className="litter-father-div">
                    {father?.image?.length && father?.image !== 'none ' 
                        ? <img width="150px" height="150px" className="dog-profile-picture" src={father?.image} alt="Father" />
                        : <img width="150px" height="150px" className="dog-profile-picture" src={DogIcon} alt="Father" />
                    }

                    <br />

                    <span className="litter-father-span">
                    Father
                    <br />
                    {father?.id?.length 
                        ? <Link className="orange-link" to={`/dogs/${father?.id}`}><b>{father?.name}</b></Link>
                        : 'Not Added'}
                    <br /></span>
                </div>
            </div>
            <p><b>Puppies' Breed </b>{litter?.breed}</p>
            <p><b>Born </b>{litter?.born?.split(' ').slice(1, 4).join(' ')}</p>
            <p><b>In </b>{litter?.region?.length && litter?.region !== 'none ' ? `${litter?.region}, ` : null}{litter?.country}</p>
            <p><b>{litter?.children} {litter?.children === 1 ? 'Puppy' : 'Puppies'}</b></p>
            <br />
            {deleteFatherContent}
            {fatherContent}
            {addProposedFatherContent}
            {addPuppyContent}
            {addProposedPuppyContent}
            {filteredDogs?.length 
                ? <><p><b>Puppies</b></p>
                    <br />
                    {dogContent}</>
                : <p>No puppies have been added to this litter yet</p>
            }
            {content}
        </>
    )
}

export default LitterPage
