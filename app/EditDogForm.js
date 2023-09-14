import { useState, useEffect } from "react"
import { useUpdateDogMutation, useDeleteDogMutation, useGetDogsQuery } from "../components/dogs/dogsApiSlice"
import { Countries } from "../assets/countries"
import { bigCountries } from "../assets/bigCountries"
import { Regions } from "../assets/regions"
import { Calendar } from 'react-native-calendars'
import { ScrollView, TouchableOpacity, View, Text, StyleSheet, TextInput, Switch, Image } from "react-native"
import RNPickerSelect from 'react-native-picker-select'
import { COLORS } from "../constants"
import * as ImagePicker from 'expo-image-picker'

const EditDogForm = ({ route, navigation }) => {

    const { dogid } = route.params

    // GET the dog with all of it's .values
    const { dog } = useGetDogsQuery("dogsList", {
        selectFromResult: ({ data }) => ({
            dog: data?.entities[dogid]
        }),
    })

    const NAME_REGEX = /^(?!^\s*$)(?:[a-zA-Z']+(\s|$))+$/

    const [heat, setHeat] = useState(typeof dog?.heat === 'boolean' ? dog.heat : false)
    const [sterilized, setSterilized] = useState(dog?.sterilized)
    const [death, setDeath] = useState(dog?.death?.length && dog?.death !== 'none ' ? dog.death : '')
    const [name, setName] = useState(dog?.name)
    const [microchipped, setMicrochipped] = useState(typeof dog?.microchipped === 'boolean' ? dog.microchipped : false)
    const [chipnumber, setChipnumber] = useState(dog?.chipnumber?.length && dog?.chipnumber !== 'none ' ? dog.chipnumber : '')
    const [passport, setPassport] = useState(typeof dog?.passport === 'boolean' ? dog.passport : false)
    const [info, setInfo] = useState(dog?.info?.length ? dog.info : '')
    const [country, setCountry] = useState(dog?.country?.length ? dog.country : 'Argentina')
    const [region, setRegion] = useState(dog?.region?.length ? dog.region : 'none ')
    const [instagram, setInstagram] = useState(dog?.instagram?.length && dog?.instagram !== 'none ' ? dog.instagram : '')
    const [facebook, setFacebook] = useState(dog?.facebook?.length && dog?.facebook !== 'none ' ? dog.facebook : '')
    const [youtube, setYoutube] = useState(dog?.youtube?.length && dog?.youtube !== 'none ' ? dog.youtube : '')
    const [tiktok, setTiktok] = useState(dog?.tiktok?.length && dog?.tiktok !== 'none ' ? dog.tiktok : '')
    const [previewSource, setPreviewSource] = useState(null)
    const [base64Value, setBase64Value] = useState(null)
    const [uploadMessage, setUploadMessage] = useState('')
    const [confirmDelete, setConfirmDelete] = useState('')
    const [uploadLoading, setUploadLoading] = useState(false)
    const [deletionVisible, setDeletionVisible] = useState(false)

    // Clear the region each time the country is changed to avoid having a region from another country
    const handleCountryChanged = (value) => {
        setCountry(value)
        setRegion('')
    }

    const handleDeathChanged = date => setDeath(date)
    const handleChipnumberChanged = value => setChipnumber(value)
    const handleInfoChanged = value => setInfo(value)
    const handleInstagramChanged = value => setInstagram(value)
    const handleFacebookChanged = value => setFacebook(value)
    const handleYoutubeChanged = value => setYoutube(value)
    const handleTiktokChanged = value => setTiktok(value)

    const handleHeatChanged = () => setHeat(prev => !prev)
    const handleSterilizedChanged = () => setSterilized(prev => !prev)
    const handlePassportChanged = () => setPassport(prev => !prev)

    // PATCH function for updating THE dog
    const [updateDog, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useUpdateDogMutation()

    // DELETE function for THE dog
    const [deleteDog, {
        isLoading: isDelLoading,
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteDogMutation()

    useEffect(() => {
        if (isSuccess) navigation.navigate('DogPage', { navigation, dogid: dog?.id })
    }, [isSuccess, navigation, dog?.id])

    const handleMicrochippedChanged = () => {
        if (microchipped === true) setChipnumber('')
        setMicrochipped(prev => !prev)
    }

    // DELETE the dog
    const handleDeleteDogClicked = async () => {
        await deleteDog({ id: dog?.id })
        setConfirmDelete('')
        setDeletionVisible(false)
    }

    const handleRemoveLitter = async () => {
        await updateDog({ id: dog?.id, litter: 'none ' })
    }

    const handleSaveDogClicked = async () => {
        let updatedInstagram = instagram
        let updatedFacebook = facebook
        let updatedYoutube = youtube
        let updatedTiktok = tiktok
        let updatedRegion = region
        let updatedInfo = info
        let updatedChipnumber = chipnumber

        // Values that can be cleared need to be changed to 'none '
        // They need to have a length in order to PATCH them in the backend
        // That is due to the fact that dogs are also PATCHed when they are added to litters
        // Adding to litters only provides the dog's ID and the litter's ID
        if (!instagram?.length) {
            updatedInstagram = 'none '
        }

        if (!facebook?.length) {
            updatedFacebook = 'none '
        }

        if (!youtube?.length) {
            updatedYoutube = 'none '
        }

        if (!tiktok?.length) {
            updatedTiktok = 'none '
        }

        if (!region?.length) {
            updatedRegion = 'none '
        }

        if (!info?.length) {
            updatedInfo = 'none '
        }

        if (!chipnumber?.length) {
            updatedChipnumber = 'none '
        }

        let finalDeath = death !== '' ? new Date(death.timestamp).toDateString() : 'none '

        // PATCH the dog
        await updateDog({ id: dog.id, name,
            country, region: updatedRegion, death: finalDeath, sterilized, passport, microchipped, 
            chipnumber: updatedChipnumber, info: updatedInfo, heat,
            instagram: updatedInstagram, facebook: updatedFacebook, 
            youtube: updatedYoutube, tiktok: updatedTiktok 
        })
    }

    // Function to handle image selection
    const handleFileClicked = async () => {
        setUploadMessage('')

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            base64: true,
        })

        if (!result.canceled) {
            setPreviewSource(result.assets[0].uri)
            setBase64Value('data:image/jpeg;base64,' + result.assets[0].base64)
        }
    }

    const uploadImage = async (base64EncodedImage) => {
        setUploadLoading(true)

        try {
            setUploadMessage('')
            await fetch('https://b4eb-81-90-125-79.ngrok-free.app/dogimages', {
                method: 'POST',
                body: JSON.stringify({ 
                    data: base64EncodedImage,
                    dog_id: `${dog?.id}`
                }),
                headers: {'Content-type': 'application/json'}
            })

            setPreviewSource(null)
            setUploadMessage('Picture Updated!')
        } catch (error) {
            console.error(error)
            setUploadMessage('Something went wrong')
        }

        setUploadLoading(false)
    }

    const handleSubmitFile = () => {
        if (!base64Value) return
        return uploadImage(base64Value)
    }

    if (isDelSuccess) navigation.navigate('DogsList', { navigation })
    if (isLoading || isDelLoading) return <Text style={{ margin: 10 }}>Loading...</Text>

    // Boolean to control the 'disabled' value of the SAVE button
    const canSave = !isLoading && NAME_REGEX.test(name)

    const errContent = (error?.data?.message || delerror?.data?.message) ?? ''

    const removeLitterContent = dog?.litter?.length && dog?.litter !== 'none '
        ? <View>
            <TouchableOpacity
                style={styles.blackButtonWide}
                onPress={handleRemoveLitter}
            >
                <Text>Remove Litter</Text>
            </TouchableOpacity>
        </View>
        : null

    const content = (
        <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
            <View style={styles.mainView}>

                {isError || isDelError ? <Text style={{ marginBottom: 10 }}>{errContent}</Text> : null} 

                <Text style={{ marginBottom: 15, fontSize: 20, fontWeight: 'bold' }}>Edit Dog</Text>

                <Text style={styles.inputTitle}>Dog's Name (Max. 30 Letters) - Required</Text>

                <TextInput 
                    style={styles.textInputWide}
                    maxLength={30}
                    value={name}
                    onChangeText={(value) => setName(value)}
                />

                <View>
                    <TouchableOpacity style={styles.blackButtonWide} onPress={() => handleFileClicked()}>
                        <Text style={styles.buttonText}>Browse Picture</Text>
                    </TouchableOpacity>
                </View>

                <View>
                    <TouchableOpacity 
                        onPress={handleSubmitFile}
                        disabled={!previewSource || uploadLoading === true}
                        style={!previewSource || uploadLoading === true ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                    >
                        <Text style={styles.buttonText}>Update Picture</Text>
                    </TouchableOpacity>
                </View>

                {uploadLoading === true ? <Text style={{ marginVertical: 10 }}>Uploading...</Text> : null}
                {uploadLoading === false && uploadMessage?.length ? <Text style={{ marginVertical: 10 }}>{uploadMessage}</Text> : null}

                {previewSource 
                    ? <Image style={{height: 300, width: 300, borderRadius: 150}} source={{ uri: previewSource }} />
                    : null
                }

                <Text style={styles.inputTitle}>Country</Text>
                
                <View style={styles.selectInputWide}>
                    <RNPickerSelect 
                        value={country}
                        onValueChange={handleCountryChanged}
                        items={Countries}
                    />
                </View>

                <Text style={styles.inputTitle}>Region</Text>

                <View style={styles.selectInputWide}>
                    <RNPickerSelect 
                        disabled={!bigCountries?.includes(country)}
                        value={region}
                        onValueChange={(value) => setRegion(value)}
                        items={bigCountries?.includes(country) ? Regions[country] : []}
                        placeholder={{ label: '--', value: 'none ' }}
                    />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.inputTitle}>Passport </Text>
                    <Switch onValueChange={handlePassportChanged} value={passport} />
                </View>

                {dog?.female === false
                    ? null
                    : <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.inputTitle}>Heat </Text>
                        <Switch onValueChange={female ? handleHeatChanged : null} value={heat} />
                    </View>
                }

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.inputTitle}>{dog?.female === true ? 'Sterilized ' : 'Castrated '}</Text>
                    <Switch onValueChange={handleSterilizedChanged} value={sterilized} />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.inputTitle}>Microchipped </Text>
                    <Switch onValueChange={handleMicrochippedChanged} value={microchipped} />
                </View>

                <Text style={styles.inputTitle}>Chipnumber</Text>

                <TextInput 
                    style={styles.textInputWide}
                    editable={microchipped}
                    value={chipnumber}
                    onChangeText={handleChipnumberChanged}
                />
                
                <Text style={styles.inputTitle}>Instagram Username</Text>

                <TextInput 
                    style={styles.textInputWide}
                    value={instagram}
                    onChangeText={handleInstagramChanged}
                />
                
                <Text style={styles.inputTitle}>Facebook Username</Text>

                <TextInput 
                    value={facebook}
                    style={styles.textInputWide}
                    onChangeText={handleFacebookChanged}
                />
                
                <Text style={styles.inputTitle}>Youtube Username</Text>

                <TextInput 
                    value={youtube}
                    style={styles.textInputWide}
                    onChangeText={handleYoutubeChanged}
                />
                
                <Text style={styles.inputTitle}>TikTok Username</Text>

                <TextInput 
                    value={tiktok}
                    style={styles.textInputWide}
                    onChangeText={handleTiktokChanged}
                />

                <Text style={styles.inputTitle}>Date of Death</Text>
                
                <Calendar 
                    style={styles.calendar}
                    minDate={dog?.birth || null} 
                    maxDate={new Date()} 
                    onDayPress={handleDeathChanged} 
                    markedDates={{
                        [death.dateString]: {selected: true, disableTouchEvent: true, selectedColor: '#00adf5'}
                    }} 
                />

                <View style={{ marginTop: 10 }}>
                    <TouchableOpacity 
                        style={death === '' ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                        disabled={death === ''}
                        onPress={() => setDeath('')}
                    >
                        <Text style={styles.buttonText}>Clear Date</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.inputTitle}>Info</Text>

                <TextInput
                    style={styles.textInputWide}
                    multiline={true}
                    numberOfLines={10}
                    maxLength={500}
                    value={info !== 'none ' ? info : ''}
                    onChangeText={handleInfoChanged} 
                />

                <View>
                    <TouchableOpacity
                        onPress={handleSaveDogClicked}
                        disabled={!canSave}
                        style={!canSave ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                    >
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                </View>

                {removeLitterContent}

                <View>
                    <TouchableOpacity
                        style={styles.blackButtonWide}
                        onPress={() => setDeletionVisible(!deletionVisible)}
                    >
                        <Text style={styles.buttonText}>Delete Dog</Text>
                    </TouchableOpacity>
                </View>

                {deletionVisible === false ? null 
                    : <View>
                        <Text style={{ fontWeight: 'bold', marginTop: 10 }}>
                            Type "confirmdelete" and click on the Confirm Deletion button 
                            to delete your dog from the database.
                        </Text>

                        <TextInput 
                            style={styles.textInputWide}
                            value={confirmDelete} 
                            onChangeText={(value) => setConfirmDelete(value)} 
                        />

                        <View>
                            <TouchableOpacity
                                disabled={confirmDelete !== 'confirmdelete'}
                                style={confirmDelete !== 'confirmdelete' ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                                onPress={handleDeleteDogClicked}
                            >
                                <Text style={styles.buttonText}>Confirm Deletion</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            </View>
        </ScrollView>
    )

  return content
}

const styles = StyleSheet.create({
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
    errMsg: {
        color: 'red',
    },
    successMsg: {
        color: 'green',
        marginHorizontal: 10,
        fontWeight: 'bold',
    },
    calendar: {
        borderWidth: 1,
        borderColor: 'lightgrey',
    },
})

export default EditDogForm
