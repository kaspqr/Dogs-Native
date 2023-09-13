import { useGetDogsQuery, useDeleteDogMutation } from "../components/dogs/dogsApiSlice"
import { useGetUsersQuery } from "../components/users/usersApiSlice"
import { useGetLittersQuery } from "../components/litters/littersApiSlice"

import useAuth from "../hooks/useAuth"
import { Image, ScrollView, TouchableOpacity, Text, View, StyleSheet } from "react-native"

import { COLORS } from "../constants"

const DogPage = ({ route, navigation }) => {

    const { userId, isAdmin, isSuperAdmin } = useAuth()
    const { dogid } = route.params

    let filteredLitters
    let childrenLitterIds
    let allChildren
    let siblings
    let filteredParents
    let parentDogs
    let littersContent

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
            <View key={litter?.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('LitterPage', { navigation, litterid: litter?.id })} key={litter?.id}>
                        <Text style={styles.orangeLink}>Litter</Text>
                    </TouchableOpacity>
                    {(dog?.female === true && litter?.father?.length) || (dog?.female === false && litter?.mother?.length) 
                        ? <Text>{' with '}</Text> 
                        : null
                    } 
                    {dog?.female === true 
                        ? <TouchableOpacity onPress={() => navigation.navigate('DogPage', { navigation, dogid: litter?.father })} key={litter?.father}>
                            <Text style={styles.orangeLink}>{parentDogs?.find(parent => parent?.id === litter?.father)?.name}</Text>
                        </TouchableOpacity> 
                        : null
                    }
                    {dog?.female === false 
                        ? <TouchableOpacity onPress={() => navigation.navigate('DogPage', { navigation, dogid: litter?.mother })} key={litter?.mother}>
                            <Text style={styles.orangeLink}>{parentDogs?.find(parent => parent?.id === litter?.mother)?.name}</Text>
                        </TouchableOpacity> 
                        : null
                    }
                    {litter?.born?.length 
                        ? <Text>{' '}born on{' '}<Text style={{ fontWeight: 'bold' }}>{litter?.born?.split(' ').slice(1, 4).join(' ')}</Text></Text> 
                        : null
                    }
                </View>

                {!allChildren?.length ? <Text>This litter doesn't have any puppies added to it</Text> : null}
                {allChildren?.map(child => child?.litter === litter?.id 
                    ? <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }} key={child.id}>
                        {child?.female === true 
                            ? <Text>Daughter </Text> 
                            : <Text>Son </Text>
                        }
                        <TouchableOpacity onPress={() => navigation.navigate('DogPage', { navigation, dogid: child?.id })}>
                            <Text style={styles.orangeLink} key={child?.id}>{child?.name}</Text>
                        </TouchableOpacity>
                    </View>
                    : null
                )}
            </View> 
        )
    }

    if (!dog) return <Text style={{ margin: 10 }}>Dog not found</Text>

    const content = userId === dog?.user 
        ? <View style={{ marginTop: 10 }}>
            <TouchableOpacity
                style={styles.blackButtonWide}
                onPress={() => navigation.navigate('EditDogForm', { navigation, dogid })}
            >
                <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
        </View>
        : null

    const fatherContent = father
        ? <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <Text>Father{' '}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DogPage', { navigation, dogid: father?.id })}>
                <Text style={styles.orangeLink}>{father?.name}</Text>
            </TouchableOpacity>
        </View>
        : null

    const parentsContent = parentLitter 
        ? <View style={{ marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>Mother{' '}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('DogPage', { navigation, dogid: mother?.id })}>
                    <Text style={styles.orangeLink}>{mother?.name}</Text>
                </TouchableOpacity>
            </View>
            {fatherContent}
        </View>
        : <Text>{dog?.name} is not added to any litter and therefore has no parents in the database</Text>

    const siblingsContent = siblings?.length 
        ? siblings.map(sibling => <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }} key={sibling.id}>
            {sibling?.female === true 
                ? <Text>Sister{' '}</Text> 
                : <Text>Brother{' '}</Text>
            }
            <TouchableOpacity onPress={() => navigation.navigate('DogPage', { navigation, dogid: sibling?.id })}>
                <Text style={styles.orangeLink}>{sibling?.name}</Text>
            </TouchableOpacity>
        </View>)
        : parentLitter 
            ? <Text>{dog?.name} is not connected to any siblings through it's litter in the database</Text>
            : null

    const handleAdminDelete = async () => {
        await deleteDog({ id: dog?.id })
    }

    if (isLoading || isDelLoading || isDogsLoading) return <Text style={{ margin: 10 }}>Loading...</Text>
    if (isError) littersContent = <Text style={{ margin: 10 }}>{error?.data?.message}</Text>
    if (isDelError) return <Text style={{ margin: 10 }}>{delerror?.data?.message}</Text>
    if (isDogsError) return <Text style={{ margin: 10 }}>{dogsError?.data?.message}</Text>

    if (isDelSuccess) return

    return (
        <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
            <View style={styles.mainView}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{dog?.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text>Administered by{' '}</Text>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('UserPage', { navigation, id: user?.id })} 
                    >
                        <Text style={styles.orangeLink}>{user?.username}</Text>
                    </TouchableOpacity>
                </View>

                {dog?.image?.length 
                    ? <View style={{ marginTop: 10 }}>
                        <Image 
                            style={{ width: 300, height: 300, borderRadius: 150 }} 
                            source={{ uri: `${dog?.image}` }} 
                        />
                    </View> 
                    : null
                }
                <Text style={{ fontWeight: 'bold', marginTop: 10, marginBottom: 15, fontSize: 18 }}>Main Info</Text>

                <Text style={{ fontWeight: 'bold' }}>Good {dog?.female === true ? 'Girl' : 'Boy'}</Text>

                <Text style={{ fontWeight: 'bold' }}>{dog?.breed}</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold' }}>Born </Text>
                    <Text>{dog?.birth?.split(' ').slice(1, 4).join(' ')}</Text>
                </View>

                {dog?.death?.length && dog?.death !== 'none ' 
                    ? <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold' }}>Entered Dog Heaven on </Text>
                        <Text>{dog?.death?.split(' ').slice(1, 4).join(' ')}</Text>
                    </View> 
                    : null
                }

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold' }}>From </Text>
                    {dog?.region?.length && dog?.region !== 'none ' 
                        ? <Text>{dog?.region}, </Text> 
                        : null
                    }
                    {dog?.country?.length 
                        ? <Text>{dog?.country}</Text> 
                        : null
                    }
                </View>

                <Text style={{ fontWeight: 'bold', marginTop: 10 }}>{dog?.passport === true ? 'Has a Passport' : 'Does Not Have a Passport'}</Text>

                <Text style={{ fontWeight: 'bold' }}>{dog?.sterilized === true ? null : 'Not '}{dog?.female === true ? 'Sterilized' : 'Castrated'}</Text>

                {dog?.female === true && dog?.sterilized === false 
                    ? <Text style={{ fontWeight: 'bold' }}>{dog?.heat === true 
                        ? 'Currently in Heat' 
                        : 'Currently Not in Heat'}</Text> 
                    : null
                }

                <Text style={{ fontWeight: 'bold' }}>{dog?.microchipped === true ? 'Microchipped' : 'Not Microchipped'}</Text>

                {dog?.microchipped === true && dog?.chipnumber?.length && dog?.chipnumber !== 'none ' 
                    ? <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold' }}>Chipnumber </Text>
                        <Text>{dog?.chipnumber}</Text>
                    </View> 
                    : null
                }

                {dog?.info && dog?.info !== 'none ' 
                    ? <View style={{ marginTop: 10 }}><Text style={{ fontWeight: 'bold' }}>Additional Info</Text>
                        <Text>{dog?.info}</Text>
                    </View> 
                    : null
                }

                <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 15 }}>Instant Family Tree</Text>

                {parentLitter 
                    ? <View style={{ marginTop: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{dog?.name}'s</Text>
                            {dog?.litter 
                                ? <TouchableOpacity onPress={() => navigation.navigate('LitterPage', { navigation, litterid: dog?.litter })}>
                                    <Text style={[styles.orangeLink, { fontSize: 16 }]}> Litter</Text>
                                </TouchableOpacity> 
                                : 'Litter'
                            }
                        </View>

                        {parentsContent}
                    </View> 
                    : <Text style={{ marginTop: 10 }}>
                        {dog?.name} is not added to any litter and therefore has no parents or siblings in the database
                    </Text>
                }

                {siblings?.length 
                    ? <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(200, 200, 200, 0.5)', marginTop: 5 }}>{siblingsContent}</View>
                    : null
                }

                {filteredLitters?.length 
                    ? <Text style={{ fontWeight: 'bold', marginTop: 15, fontSize: 16 }}>{dog?.name}'s litters and each litter's puppies</Text> 
                    : null
                }

                {filteredLitters?.length 
                    ? littersContent 
                    : <Text style={{ marginTop: 15 }}>{dog?.name} has no litters and therefore has no puppies in the database</Text>
                }

                {content}

                {userId?.length && dog?.user !== userId
                    ? <View style={{ marginTop: 10 }}>
                        <TouchableOpacity 
                            style={styles.blackButtonWide}
                            onPress={() => {}}
                        >
                            <Text style={styles.buttonText}>Report Dog</Text>
                        </TouchableOpacity>
                    </View>
                    : null
                }

                {isAdmin || isSuperAdmin
                    ? <View style={{ marginTop: 10 }}>
                        <TouchableOpacity 
                            onPress={handleAdminDelete}
                            style={styles.blackButtonWide}
                        >
                            <Text style={styles.buttonText}>Delete as Admin</Text>
                        </TouchableOpacity>
                    </View>
                    : null
                }
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

export default DogPage
