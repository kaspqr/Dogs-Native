import useAuth from "../hooks/useAuth"
import { useGetUsersQuery, useUpdateUserMutation } from "../components/users/usersApiSlice"
import { useGetDogsQuery, useUpdateDogMutation } from "../components/dogs/dogsApiSlice"
import { useGetConversationsQuery, useAddNewConversationMutation } from "../components/conversations/conversationsApiSlice"
import { useGetDogProposesQuery, useAddNewDogProposeMutation, useDeleteDogProposeMutation } from "../components/dogs/proposeDogApiSlice"
import { useGetFatherProposesQuery, useDeleteFatherProposeMutation } from "../components/litters/fatherProposesApiSlice"
import { useGetPuppyProposesQuery, useDeletePuppyProposeMutation } from "../components/litters/puppyProposesApiSlice"
import { useGetAdvertisementsQuery } from "../components/advertisements/advertisementsApiSlice"
import { useState, useEffect } from "react"
import UserDog from "../components/dogs/UserDog"
import UserAdvertisement from "../components/advertisements/UserAdvertisement"
import { TouchableOpacity, View, Text, ScrollView, TextInput, Image, StyleSheet } from "react-native"
import { COLORS, SIZES } from "../constants"
import RNPickerSelect from 'react-native-picker-select'

const UserPage = ({ route, navigation }) => {

    const { id } = route.params

    // User that's logged in
    const { userId, isAdmin, isSuperAdmin } = useAuth()

    const [selectedProposeDog, setSelectedProposeDog] = useState('')
    const [selectedAcceptDog, setSelectedAcceptDog] = useState('')

    const [currentAdvertisementPage, setCurrentAdvertisementPage] = useState(1)
    const [newAdvertisementPage, setNewAdvertisementPage] = useState('')

    const [currentDogPage, setCurrentDogPage] = useState(1)
    const [newDogPage, setNewDogPage] = useState('')

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
        || isLoadingNewDogPropose || isAdvertisementLoading) finalAdvertisementsContent = <Text>Loading...</Text>
    
    if (isError) finalAdvertisementsContent = <Text>{error?.data?.message}</Text>
    if (isPuppyProposeError) finalAdvertisementsContent = <Text>{puppyProposeError?.data?.message}</Text>
    if (isFatherProposeError) finalAdvertisementsContent = <Text>{fatherProposeError?.data?.message}</Text>
    if (isConversationError) finalAdvertisementsContent = <Text>{conversationError?.data?.message}</Text>
    if (isDogProposeError) finalAdvertisementsContent = <Text>{dogProposeError?.data?.message}</Text>
    if (isUpdateDogError) finalAdvertisementsContent = <Text>{updateDogError?.data?.message}</Text>
    if (isUpdateError) finalAdvertisementsContent = <Text>{updateError?.data?.message}</Text>
    if (isErrorDeleteDogPropose) finalAdvertisementsContent = <Text>{errorDeleteDogPropose?.data?.message}</Text>
    if (isErrorDeletePuppyPropose) finalAdvertisementsContent = <Text>{errorDeletePuppyPropose?.data?.message}</Text>
    if (isErrorDeleteFatherPropose) finalAdvertisementsContent = <Text>{errorDeleteFatherPropose?.data?.message}</Text>
    if (isErrorNewDogPropose) finalAdvertisementsContent = <Text>{errorNewDogPropose?.data?.message}</Text>
    if (isErrorNewConversation) finalAdvertisementsContent = <Text>{errorNewConversation?.data?.message}</Text>
    if (isAdvertisementError) finalAdvertisementsContent = <Text>{advertisementError?.data?.message}</Text>

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
                ? <TouchableOpacity 
                    style={styles.blackButtonWide}
                    onPress={() => filteredMadeDogProposes?.forEach((proposal) => {
                        handleDeleteDogProposal(proposal)
                    })}
                >
                    <Text style={styles.buttonText}>Delete Dog Proposals Made by Me</Text>
                </TouchableOpacity>
                : null

            const madeFatherProposesContent = filteredMadeFatherProposes?.length
                ? <TouchableOpacity 
                    style={styles.blackButtonWide}
                    onPress={() => filteredMadeFatherProposes?.forEach((proposal) => {
                        handleDeleteFatherProposal(proposal)
                    })}
                >
                    <Text style={styles.buttonText}>Delete Father Proposals Made by Me</Text>
                </TouchableOpacity>
                : null

            const madePuppyProposesContent = filteredMadePuppyProposes?.length
                ? <TouchableOpacity 
                    style={styles.blackButtonWide}
                    onPress={() => filteredMadePuppyProposes?.forEach((proposal) => {
                        handleDeletePuppyProposal(proposal)
                    })}
                >
                    <Text style={styles.buttonText}>Delete Puppy Proposals Made by Me</Text>
                </TouchableOpacity>
                : null

            deleteProposalsContent = <View>
                {madeDogProposesContent}
                {madeFatherProposesContent}
                {madePuppyProposesContent}
            </View>
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
            const proposeDogs = filteredProposeDogs?.map(dog => { return { label: `${dog?.name}`, value: `${dog?.id}` } })

            proposeDogContent = proposeDogs?.length
                ? <View>
                        <Text style={styles.bold}>Transfer Dog to {user?.username}</Text>

                        <View style={styles.selectInputWide}>
                            <RNPickerSelect 
                                items={proposeDogs}
                                placeholder={{ label: '--', value: '' }} 
                                value={selectedProposeDog} 
                                onValueChange={(value) => setSelectedProposeDog(value)}
                            />
                        </View>

                        <TouchableOpacity 
                            disabled={!selectedProposeDog?.length}
                            style={!selectedProposeDog?.length ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                            onPress={handleProposeDog}
                        >
                            <Text style={styles.buttonText}>Propose Transfer</Text>
                        </TouchableOpacity>
                </View>
                : null
        }

        if (myProposals?.length) {
            const acceptDogs = myProposals?.map(dog => { return { label: `${dog?.name}`, value: `${dog?.id}` } })

            myProposalsContent = acceptDogs?.length 
                ? <View>
                    <Text>Accept Dog{myProposals?.length > 1 ? 's' : null} Offered by {user?.username}</Text>

                    <View style={styles.selectInputWide}>
                        <RNPickerSelect 
                            value={selectedAcceptDog} 
                            items={acceptDogs}
                            placeholder={{ label: '--', value: '' }} 
                            onValueChange={(value) => setSelectedAcceptDog(value)}
                        />
                    </View>

                    <TouchableOpacity
                        disabled={!selectedAcceptDog?.length}
                        style={!selectedAcceptDog?.length ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                        onPress={handleAcceptDog}
                    >
                        <Text>Accept Dog</Text>
                    </TouchableOpacity>
                </View>
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

        finalAdvertisementsContent = !filteredAdvertisementIds?.length ? null : <View>
            <Text style={[styles.bold, { marginBottom: 10 }]}>{filteredAdvertisementIds?.length} Active Advertisement{filteredAdvertisementIds?.length === 1 ? null : 's'}</Text>

            <View>
                <View style={styles.paginationRow}>
                    <View style={{flex: 1}}>
                        <TouchableOpacity 
                            style={currentAdvertisementPage === 1 ? [styles.blackButton, styles.greyButton] : styles.blackButton}
                            disabled={currentAdvertisementPage === 1}
                            onPress={() => setCurrentAdvertisementPage(currentAdvertisementPage - 1)}
                        >
                            <Text style={styles.buttonText}>{'<-'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.paginationTextView}>
                        <Text>Page {currentAdvertisementPage} of {maxAdvertisementPage}</Text>
                    </View>

                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                        <TouchableOpacity 
                            style={currentAdvertisementPage === maxAdvertisementPage ? [styles.blackButton, styles.greyButton] : styles.blackButton}
                            disabled={currentAdvertisementPage === maxAdvertisementPage}
                            onPress={() => setCurrentAdvertisementPage(currentAdvertisementPage + 1)}
                        >
                            <Text style={styles.buttonText}>{'->'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>

            {tableAdvertisementContent}

            <View>

                <View 
                    style={maxAdvertisementPage === 1 
                        ? {display: "none"}
                        : [styles.paginationInputView]
                    }
                >

                    <TextInput 
                        style={[styles.textInput, {height: 41, marginRight: 10}]}
                        onChangeText={(value) => setNewAdvertisementPage(value)} 
                        value={newAdvertisementPage} 
                        placeholder="Page #"
                    />

                    <TouchableOpacity
                        style={goToAdvertisementPageButtonDisabled ? [styles.blackNewPageButton, styles.greyButton] : styles.blackNewPageButton}
                        disabled={goToAdvertisementPageButtonDisabled}
                        onPress={() => {
                            if (newAdvertisementPage >= 1 && newAdvertisementPage <= maxAdvertisementPage) {
                                setCurrentAdvertisementPage(parseInt(newAdvertisementPage))
                            }
                        }}
                    >
                        <Text style={styles.buttonText}>Go to Page</Text>
                    </TouchableOpacity>
                </View>

            </View>

        </View>


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

        dogPaginationContent = !filteredIds?.length ? null : <View style={{ marginTop: 20 }}>
            <Text style={[styles.bold, { marginBottom: 10 }]}>
                {filteredIds?.length} Dog{filteredIds?.length === 1 ? null : 's'} Administered
            </Text>

            <View style={styles.paginationRow}>
                    <View style={{flex: 1}}>
                        <TouchableOpacity 
                            style={currentDogPage === 1 ? [styles.blackButton, styles.greyButton] : styles.blackButton}
                            disabled={currentDogPage === 1}
                            onPress={() => setCurrentDogPage(currentDogPage - 1)}
                        >
                            <Text style={styles.buttonText}>{'<-'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.paginationTextView}>
                        <Text>Page {currentDogPage} of {maxDogPage}</Text>
                    </View>

                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                        <TouchableOpacity 
                            style={currentDogPage === maxDogPage ? [styles.blackButton, styles.greyButton] : styles.blackButton}
                            disabled={currentDogPage === maxDogPage}
                            onPress={() => setCurrentDogPage(currentDogPage + 1)}
                        >
                            <Text style={styles.buttonText}>{'->'}</Text>
                        </TouchableOpacity>  
                    </View>
                </View>

            {tableDogContent}

            <View 
                style={maxDogPage === 1 
                    ? {display: "none"}
                    : [styles.paginationInputView]
                }
            >

                <TextInput 
                    style={[styles.textInput, {height: 41, marginRight: 10}]}
                    onChangeText={(value) => setNewDogPage(value)} 
                    value={newDogPage} 
                    placeholder="Page #"
                />

                <TouchableOpacity
                    style={goToDogPageButtonDisabled ? [styles.blackNewPageButton, styles.greyButton] : styles.blackNewPageButton}
                    disabled={goToDogPageButtonDisabled}
                    onPress={() => {
                        if (newDogPage >= 1 && newDogPage <= maxDogPage) {
                            setCurrentDogPage(parseInt(newDogPage))
                        }
                    }}
                >
                    <Text style={styles.buttonText}>Go to Page</Text>
                </TouchableOpacity>
            </View>

        </View>
    }

    if (!user) return <Text>User not found</Text>

    // Only available when userId === id (the user visiting === the user whose page we're on)
    const handleEdit = () => navigation.navigate('EditUserForm', { user: userId })

    // If the user visiting is someone else, they can send a message instead
    const handleMessage = async () => {
        // If they already have a conversation started, navigate to it
        if (filteredConversation?.length) {
            navigation.navigate('ConversationPage', { conversationid: filteredConversation })
        } else {
            // Create a new conversation, then navigate to it
            const response = await addNewConversation({ sender: userId, receiver: id })

            if (response) { 
                navigation.navigate('ConversationPage', { conversationid: response?.data?.newConversationId })
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

    if (!isAdmin && !isSuperAdmin && user?.active === false) return <Text>This user is banned</Text>

    return (
        <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
            <View style={styles.mainView}>
                <Text style={styles.username}>{user?.username}</Text>
                {userId === id 
                    ? <TouchableOpacity
                        style={[styles.blackButtonWide, {marginTop: 10}]}
                        onPress={handleEdit}
                    >
                        <Text style={styles.buttonText}>Edit Profile</Text>
                    </TouchableOpacity> 
                    : null
                }
                {userId?.length && userId !== id 
                    ? <TouchableOpacity
                        style={[styles.blackButtonWide, {marginTop: 10}]}
                        onPress={handleMessage}
                    >
                        <Text style={styles.buttonText}>Message</Text>
                    </TouchableOpacity> 
                    : null
                }

                
                {user?.image?.length && user?.image !== 'none ' 
                    ? <View style={{ alignItems: 'center' }}>
                        <Image 
                            style={{ width: 300, height: 300, borderRadius: 150, marginTop: 10 }} 
                            source={{ uri: `${user.image}` }} 
                        />
                    </View>
                    : null
                }
                

                <Text style={[styles.bold, {marginTop: 10}]}>{user?.name}</Text>

                <Text style={{ marginBottom: 10 }}>From {user?.region && user?.region !== 'none ' ? `${user?.region}, ` : null}{user?.country}</Text>

                {user?.bio?.length && user?.bio !== 'none ' ? <View style={{ marginBottom: 10 }}><Text style={styles.bold}>Bio</Text><Text>{user.bio}</Text></View> : null}

                {proposeDogContent}
                {myProposalsContent}
                {deleteProposalsContent}

                {userId?.length && id !== userId
                    ? <TouchableOpacity 
                        style={styles.blackButtonWide}
                        onPress={() => navigation.navigate('UserReportPage', { userid: user?.id })}
                    >
                        <Text style={styles.buttonText}>Report User</Text>
                    </TouchableOpacity>
                    : null
                }

                {(isAdmin || isSuperAdmin) && !user?.roles?.includes("Admin", "SuperAdmin") && id !== userId
                    ? user?.active
                        ? <TouchableOpacity style={styles.blackButtonWide} onPress={handleBanUser}><Text style={styles.buttonText}>Ban User</Text></TouchableOpacity>
                        : <TouchableOpacity style={styles.blackButtonWide} onPress={handleUnbanUser}><Text style={styles.buttonText}>Unban User</Text></TouchableOpacity>
                    : null
                }

                {isSuperAdmin && !user?.roles?.includes("SuperAdmin") && id !== userId
                    ? !user?.roles?.includes("Admin")
                        ? <TouchableOpacity style={styles.blackButtonWide} onPress={handleMakeAdmin}><Text style={styles.buttonText}>Make Admin</Text></TouchableOpacity>
                        : <TouchableOpacity style={styles.blackButtonWide} onPress={handleRemoveAdmin}><Text style={styles.buttonText}>Remove Admin</Text></TouchableOpacity>
                    : null
                }

                {finalAdvertisementsContent}
                {dogPaginationContent}

            </View>
            <View style={{flex: 1, padding: SIZES.xSmall}} />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    username: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    bold: {
        fontWeight: 'bold',
    },
    adView: {
        flexDirection: 'row',
        wordWrap: 'wrap',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#d3d3d3',
        padding: 10,
        marginTop: 5,
        marginBottom: 5,
    },
    orangeLink: {
        color: '#eb9b34',
        fontWeight: 'bold',
    },
    mainView: {
        marginHorizontal: 10,
        marginBottom: 30,
        marginTop: 10,
    },
    blackButtonWide: {
      backgroundColor: '#000000',
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
    },
    blackButton: {
      padding: 10,
      borderRadius: 5,
      backgroundColor: '#000000',
      width: 50,
    },
    blackNewPageButton: {
      backgroundColor: '#000000',
      borderRadius: 5,
      padding: 10,
    },
    greyButton: {
      backgroundColor: 'lightgrey',
    },
    buttonText: {
      color: '#ffffff',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    filterViewVisible: {
      flex: 1,
    },
    filterViewHidden: {
      display: 'none',
    },
    textInputWide: {
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 5,
      paddingVertical: 13,
      marginBottom: 10,
    },
    textInput: {
      borderWidth: 1,
      borderRadius: 5,
      paddingLeft: 5,
      width: 60,
    },
    selectInputWide: {
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 10,
    },
    paginationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    paginationTextView: {
      flex: 1,
      alignItems: 'center',
    },
    paginationInputView: {
      flexDirection: 'row',
      marginTop: 5,
    },
    inputTitle: {
      fontWeight: 'bold',
    },
})

export default UserPage
