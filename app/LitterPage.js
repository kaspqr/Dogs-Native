import { useGetLittersQuery, useUpdateLitterMutation, useDeleteLitterMutation } from "../components/litters/littersApiSlice"
import { useGetFatherProposesQuery, useAddNewFatherProposeMutation } from "../components/litters/fatherProposesApiSlice"
import { useGetPuppyProposesQuery, useAddNewPuppyProposeMutation } from "../components/litters/puppyProposesApiSlice"
import { useGetDogsQuery, useUpdateDogMutation } from "../components/dogs/dogsApiSlice"
import useAuth from "../hooks/useAuth"
import Dog from '../components/dogs/Dog'
import { useEffect, useState } from "react"
import DogIcon from "../assets/images/DogIcon.jpg"
import { Image, ScrollView, TouchableOpacity, Text, View, StyleSheet, TextInput } from "react-native"

import { COLORS } from "../constants"
import RNPickerSelect from 'react-native-picker-select'

const LitterPage = ({ navigation, route }) => {

    const { litterid } = route.params

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

    const { userId } = useAuth()

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

    useEffect(() => {
        if (isDelSuccess) navigation.navigate('LittersList')
    }, [isDelSuccess, navigation])
    
    let dogContent
    let optionsContent
    let fatherOptionsContent
    let filteredDogs
    let filteredUserDogs
    
    if (isLoading || isDelLoading || isUpdateLoading || isLitterLoading || isAllFatherProposesLoading 
        || isAddFatherProposeLoading || isAddPuppyProposeLoading 
        || isAllPuppyProposesLoading) dogContent = <Text style={{ margin: 10 }}>Loading...</Text>
    
    if (isError) dogContent = <Text style={{ margin: 10 }}>{error?.data?.message}</Text>
    if (isUpdateError) dogContent = <Text style={{ margin: 10 }}>{updateError?.data?.message}</Text>
    if (isDelError) dogContent = <Text style={{ margin: 10 }}>{delError?.data?.message}</Text>
    if (isLitterError) dogContent = <Text style={{ margin: 10 }}>{litterError?.data?.message}</Text>
    if (isAllFatherProposesError) dogContent = <Text style={{ margin: 10 }}>{allFatherProposesError?.data?.message}</Text>
    if (isAllPuppyProposesError) dogContent = <Text style={{ margin: 10 }}>{allPuppyProposesError?.data?.message}</Text>
    if (isAddFatherProposeError) dogContent = <Text style={{ margin: 10 }}>{addFatherProposeError?.data?.message}</Text>
    if (isAddPuppyProposeError) dogContent = <Text style={{ margin: 10 }}>{addPuppyProposeError?.data?.message}</Text>

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
            proposedFatherContent = filteredFatherProposals?.map(proposal => ({ label: `${entities[proposal]?.name}`, value: proposal }))

            proposedPuppyContent = filteredPuppyProposals?.map(proposal => ({ label: `${entities[proposal]?.name}`, value: proposal }))
        }

        // Variable to store the LitterDog component for each dog belonging to the litter
        let tableContent

        if (filteredDogs?.length) {
            tableContent = filteredDogs.map(dog => (
               <Dog navigation={navigation} key={dog.id} dogId={dog.id} />
            ))
        }

        // List of <option>s for each dog the user is able to add to the litter
        if (filteredUserDogs?.length) {
            optionsContent = filteredUserDogs.map(dog => (
                { label: dog.name, value: dog.id }
            ))
        }

        // List of <option>s for each dog the user is able to add as the father of the litter
        if (filteredFathers?.length) {
            fatherOptionsContent = filteredFathers.map(dog => (
                { label: dog.name, value: dog.id }
            ))
        }
      
        dogContent = tableContent

    }

    if (!litter || !mother) return <Text style={{ margin: 10 }}>Litter not found</Text>

    let content = null

    // DELETE THE litter
    const handleDeleteLitter = async () => {
        await deleteLitter({ id: litterid })
        setDeletionVisible(false)
        setConfirmDelete('')
    }

    // Option to DELETE the litter only for the user that is the administrative user of the litter's mother dog
    if (mother?.user === userId) {
        content = (
            <View>
                <View style={{ marginTop: 10 }}>
                    <TouchableOpacity
                        onPress={() => setDeletionVisible(!deletionVisible)}
                        style={styles.blackButtonWide}
                    >
                        <Text style={styles.buttonText}>Delete Litter</Text>
                    </TouchableOpacity>
                </View>

                {deletionVisible === false ? null 
                    : <View>

                        <Text>
                            Type "confirmdelete" and click on the Confirm Deletion button to delete your dog's litter from the database.
                        </Text>

                        <TextInput 
                            value={confirmDelete} 
                            onChangeText={(value) => setConfirmDelete(value)} 
                            style={styles.textInputWide}
                        />

                        <View>
                            <TouchableOpacity
                                disabled={confirmDelete !== 'confirmdelete'}
                                style={confirmDelete !== 'confirmdelete' ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                                onPress={handleDeleteLitter}
                            >
                                <Text style={styles.buttonText}>Confirm Deletion</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            </View>
        )
    }

    // Add litter to the user's dog
    const addToLitter = async () => {
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
    const fatherButtonStyle = !canSaveFather ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide

    const fatherContent = father?.id?.length || !filteredFathers?.length
        ? null
        : <View>
            <Text style={{ fontWeight: 'bold' }}>{userId === mother?.user ? 'Add ' : 'Propose '}Father to Litter</Text>

            <View style={styles.selectInputWide}>
                <RNPickerSelect 
                    value={selectedFather} 
                    onValueChange={(value) => setSelectedFather(value)}
                    placeholder={{ label: 'Pick Your Dog', value: '' }}
                    items={fatherOptionsContent}
                />
            </View>

            <View>
                <TouchableOpacity
                    style={fatherButtonStyle}
                    disabled={!canSaveFather}
                    onPress={userId === mother?.user ? addFatherToLitter : proposeFatherToLitter}
                >
                    <Text style={styles.buttonText}>{userId === mother?.user ? 'Add ' : 'Propose '}Father</Text>
                </TouchableOpacity>
            </View>

        </View>

    const addProposedFatherContent = proposedFatherContent?.length && !father?.id?.length
        ? <View>
            <Text style={{ fontWeight: 'bold' }}>Add Proposed Father</Text>

            <View style={styles.selectInputWide}>
                <RNPickerSelect 
                    value={selectedProposeFather} 
                    onValueChange={(value) => setSelectedProposeFather(value)}
                    placeholder={{ label: 'Pick Your Dog', value: '' }}
                    items={proposedFatherContent}
                />
            </View>

            <View>
                <TouchableOpacity
                    style={!selectedProposeFather?.length ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                    disabled={!selectedProposeFather?.length}
                    onPress={addProposedFatherToLitter}
                >
                    <Text>Add Father</Text>
                </TouchableOpacity>
            </View>
        </View>
        : null

    const addProposedPuppyContent = proposedPuppyContent?.length && (litter?.children > filteredDogs?.length || !filteredDogs?.length)
        ? <View>
            <Text style={{ fontWeight: 'bold' }}>Add Proposed Puppy</Text>

            <View style={styles.selectInputWide}>
                <RNPickerSelect 
                    value={selectedProposePuppy} 
                    onValueChange={(value) => setSelectedProposePuppy(value)}
                    placeholder={{ label: 'Pick Your Dog', value: '' }}
                    items={proposedPuppyContent}
                />
            </View>

            <View>
                <TouchableOpacity
                    style={!selectedProposePuppy?.length ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                    disabled={!selectedProposePuppy?.length}
                    onPress={addProposedPuppyToLitter}
                >
                    <Text style={styles.buttonText}>Add Puppy</Text>
                </TouchableOpacity>
            </View>
        </View>
        : null

    const addPuppyContent = filteredUserDogs?.length && (litter?.children > filteredDogs?.length || !filteredDogs?.length)
        ? <View>
            <Text style={{ fontWeight: 'bold' }}>{userId === mother?.user ? 'Add ' : 'Propose '}Puppy to Litter</Text>

            <View style={styles.selectInputWide}>
                <RNPickerSelect 
                    value={selectedDog} 
                    onValueChange={(value) => setSelectedDog(value)}
                    placeholder={{ label: 'Pick Your Dog', value: '' }}
                    items={optionsContent}
                />
            </View>

            <View>
                <TouchableOpacity
                    disabled={selectedDog?.length ? false : true}
                    style={selectedDog?.length ? styles.blackButtonWide : [styles.blackButtonWide, styles.greyButton]}
                    onPress={userId === mother?.user ? addToLitter : proposePuppyToLitter}
                >
                    <Text style={styles.buttonText}>{userId === mother?.user ? 'Add ' : 'Propose '}Puppy</Text>
                </TouchableOpacity>
            </View>
        </View>
        : null

    const deleteFatherContent = father?.id?.length && (userId === mother?.user || userId === father?.user)
        ? <View>
            <View style={{ marginTop: 10 }}>
                <TouchableOpacity
                    style={styles.blackButtonWide}
                    onPress={() => setRemovalVisible(!removalVisible)}
                >
                    <Text style={styles.buttonText}>Remove Father</Text>
                </TouchableOpacity>
            </View>

            {removalVisible === false ? null 
                : <View>
                    <Text style={{ fontWeight: 'bold' }}>
                        Type "confirmremove" and click on the Confirm Removal button to remove your dog from the litter's father position
                    </Text>

                    <TextInput 
                        style={styles.textInputWide} 
                        value={confirmRemove} 
                        onChangeText={(value) => setConfirmRemove(value)} 
                    />

                    <View>
                        <TouchableOpacity
                            disabled={confirmRemove !== 'confirmremove'}
                            style={confirmRemove !== 'confirmremove' ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                            onPress={handleRemoveFather}
                        >
                            <Text style={styles.buttonText}>Confirm Removal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }
        </View>
        : null

    return (
        <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
            <View style={styles.mainView}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ marginRight: 10 }}>
                        <View>
                            {mother?.image?.length && mother?.image !== 'none ' 
                                ? <Image 
                                    style={{ width: 150, height: 150, borderRadius: 75 }} 
                                    source={{ uri: `${mother?.image}`}} 
                                />
                                : <Image 
                                    style={{ width: 150, height: 150, borderRadius: 75 }} 
                                    source={DogIcon} 
                                />
                            }
                        </View>

                        <View style={{ alignItems: 'center' }}>
                            <Text>Mother</Text>

                            <View>
                                <TouchableOpacity onPress={() => navigation.navigate('DogPage', { dogid: mother?.id })}>
                                    <Text style={styles.orangeLink}>{mother?.name}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View>
                        {father?.image?.length && father?.image !== 'none ' 
                            ? <Image 
                                style={{ width: 150, height: 150, borderRadius: 75 }} 
                                source={{ uri: `${father?.image}`}} 
                            />
                            : <Image 
                                style={{ width: 150, height: 150, borderRadius: 75 }} 
                                source={DogIcon} 
                            />
                        }

                        <View style={{ alignItems: 'center' }}>
                            <Text>Father</Text>

                            {father?.id?.length 
                                ? <View>
                                    <TouchableOpacity onPress={() => navigation.navigate('DogPage', { dogid: father?.id })}>
                                        <Text style={styles.orangeLink}>{father?.name}</Text>
                                    </TouchableOpacity>
                                </View>
                                : <Text>Not Added</Text>
                            }
                        </View>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                    <Text style={{ fontWeight: 'bold' }}>Puppies' Breed </Text>
                    <Text>{litter?.breed}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold' }}>Born </Text>
                    <Text>{litter?.born?.split(' ').slice(1, 4).join(' ')}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold' }}>In </Text>
                    <Text>{litter?.region?.length && litter?.region !== 'none ' ? `${litter?.region}, ` : null}{litter?.country}</Text>
                </View>

                <Text style={{ fontWeight: 'bold' }}>{litter?.children} {litter?.children === 1 ? 'Puppy' : 'Puppies'}</Text>

                {deleteFatherContent}
                {fatherContent}
                {addProposedFatherContent}
                {addPuppyContent}
                {addProposedPuppyContent}
                {filteredDogs?.length 
                    ? <View style={{ marginTop: 15 }}>
                        <Text style={{ fontWeight: 'bold' }}>Puppies</Text>

                        {dogContent}
                    </View>
                    : <Text style={{ marginVertical: 10 }}>No puppies have been added to this litter yet</Text>
                }
                {content}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    mainView: {
        marginHorizontal: 10,
        marginBottom: 30,
        marginTop: 10,
    },
    orangeLink: {
        color: 'orange',
        fontWeight: 'bold',
    },
    blackButtonWide: {
      backgroundColor: '#000000',
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
    },
    greyButton: {
      backgroundColor: 'lightgrey',
    },
    buttonText: {
      color: '#ffffff',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    textInputWide: {
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 5,
      paddingVertical: 13,
      marginBottom: 10,
    },
    selectInputWide: {
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 10,
    },
  })

export default LitterPage
