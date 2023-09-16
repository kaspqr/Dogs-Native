import { useState, useEffect } from "react"
import { useUpdateAdvertisementMutation, useDeleteAdvertisementMutation, useGetAdvertisementsQuery } from "../components/advertisements/advertisementsApiSlice"
import { Currencies } from "../assets/currencies"
import * as ImagePicker from 'expo-image-picker'
import { ScrollView, TouchableOpacity, View, Text, StyleSheet, TextInput, Image, Dimensions } from "react-native"
import RNPickerSelect from 'react-native-picker-select'
import { COLORS } from "../constants"
import { backendApi } from "./api/apiSlice"

const EditAdvertisementForm = ({ route, navigation }) => {

    const { advertisementId } = route.params

    // GET the advertisement with all of it's .values
    const { advertisement } = useGetAdvertisementsQuery("advertisementsList", {
        selectFromResult: ({ data }) => ({
            advertisement: data?.entities[advertisementId]
        }),
    })

    // PATCH method to update the advertisement
    const [updateAdvertisement, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useUpdateAdvertisementMutation()

    // DELETE method to delete the advertisement
    const [deleteAdvertisement, {
        isLoading: isDelLoading,
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteAdvertisementMutation()

    const PRICE_REGEX = /^[1-9]\d{0,11}$/
    const TITLE_REGEX = /^(?!^\s*$)(?:[\w.,!?:]+(?:\s|$))+$/

    const [title, setTitle] = useState(advertisement?.title)
    const [price, setPrice] = useState(advertisement?.price)
    const [validPrice, setValidPrice] = useState(PRICE_REGEX.test(price))
    const [currency, setCurrency] = useState(advertisement?.currency)
    const [info, setInfo] = useState(advertisement?.info)
    const [previewSource, setPreviewSource] = useState(null)
    const [base64Value, setBase64Value] = useState(null)
    const [uploadMessage, setUploadMessage] = useState('')
    const [uploadLoading, setUploadLoading] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState('')
    const [deletionVisible, setDeletionVisible] = useState(false)
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

    useEffect(() => {

        if (previewSource) {
            // Get the screen width
            const screenWidth = Dimensions.get('window').width - 20
        
            // Use Image.getSize to get the original image dimensions
            Image.getSize(previewSource, (originalWidth, originalHeight) => {
            // Calculate the height while maintaining the aspect ratio
            const aspectRatio = originalWidth / originalHeight
            const calculatedHeight = screenWidth / aspectRatio
        
            setImageDimensions({ width: screenWidth, height: calculatedHeight })
            })   
        }
      }, [previewSource])

    useEffect(() => {
        setValidPrice(PRICE_REGEX.test(price))
    }, [price])


    useEffect(() => {
        if (isDelSuccess) {
            // If the advertisement is DELETEd, go back to homepage
            navigation.navigate('AdvertisementsList')
        } else if (isSuccess) {
            // If the advertisement is PATCHed, go to the page of said advertisement
            navigation.navigate('AdvertisementPage', { advertisementId })
        }
    }, [isSuccess, isDelSuccess, navigation])

    // PATCH function
    const handleSaveAdvertisementClicked = async () => {
        await updateAdvertisement({ id: advertisement.id, title, info, price, currency })
    }

    // DELETE function
    const handleDeleteAdvertisementClicked = async () => {
        await deleteAdvertisement({ id: advertisement.id })
        setDeletionVisible(false)
        setConfirmDelete('')
    }

    // Function to handle image selection
    const handleFileClicked = async () => {
        setUploadMessage('')

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
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
            await fetch(`${backendApi}/advertisementimages`, {
                method: 'POST',
                body: JSON.stringify({ 
                    data: base64EncodedImage,
                    advertisement_id: `${advertisement?.id}`
                }),
                headers: {'Content-type': 'application/json'}
            })

            setPreviewSource(null)
            setUploadMessage('Advertisement Picture Updated!')
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

    // Boolean to control the style and 'disabled' of the SAVE button
    let canSave = title?.length && info?.length && (validPrice || advertisement?.type === 'Found' || advertisement?.type === 'Lost') && !isLoading

    if (isLoading || isDelLoading) return <Text style={{ margin: 10 }}>Loading...</Text>
    if (isError) return <Text style={{ margin: 10 }}>{error?.data?.message}</Text>
    if (isDelError) return <Text style={{ margin: 10 }}>{delerror?.data?.message}</Text>

    const content = (
        <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
            <View style={styles.mainView}>
                <Text style={{ marginBottom: 15, fontSize: 20, fontWeight: 'bold' }}>Edit Advertisement</Text>

                <Text style={styles.inputTitle}>Title</Text>

                <TextInput 
                    maxLength={50}
                    style={styles.textInputWide}
                    value={title}
                    onChangeText={(value) => {
                        if (TITLE_REGEX.test(value) || value === '') {
                            setTitle(value)}
                        }
                    }
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
                    ? <Image 
                        style={{height: imageDimensions.height, width: imageDimensions.width, borderRadius: 5, marginBottom: 5}} 
                        source={{ uri: previewSource }} 
                    />
                    : null
                }

                {advertisement?.type !== 'Found' && advertisement?.type !== 'Lost'
                    ? <View>
                        <Text style={styles.inputTitle}>Price</Text>

                        <TextInput 
                            value={price.toString()}
                            style={styles.textInputWide}
                            onChangeText={(value) => {
                                if (PRICE_REGEX.test(value) || value === '') {
                                    setPrice(value)}
                                }
                            }
                        />
                        
                        <Text style={styles.inputTitle}>Currency</Text>

                        <View style={styles.selectInputWide}>
                            <RNPickerSelect 
                                value={currency}
                                items={Currencies}
                                placeholder={{ label: '--', value: '' }}
                                onValueChange={(value) => setCurrency(value)}
                            />
                        </View>
                    </View>
                    : null
                }

                <Text style={styles.inputTitle}>Info</Text>

                <TextInput 
                    style={styles.textInputWide}
                    multiline={true}
                    numberOfLines={5}
                    maxLength={500}
                    value={info}
                    onChangeText={(value) => setInfo(value)}
                />
                
                <View>
                    <TouchableOpacity
                        onPress={handleSaveAdvertisementClicked}
                        style={!canSave ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                        disabled={!canSave}
                    >
                        <Text style={styles.buttonText}>Save Advertisement</Text>
                    </TouchableOpacity>
                </View>

                <View>
                    <TouchableOpacity
                        onPress={() => setDeletionVisible(!deletionVisible)}
                        style={styles.blackButtonWide}
                    >
                        <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                </View>

                {deletionVisible === false ? null 
                    : <View>
                        <Text style={styles.inputTitle}>
                            Type "confirmdelete" and click on the Confirm Deletion button 
                            to delete your advertisement from the database.
                        </Text>

                        <TextInput 
                            value={confirmDelete} 
                            style={styles.textInputWide}
                            onChangeText={(value) => setConfirmDelete(value)} 
                        />

                        <View>
                            <TouchableOpacity
                                disabled={confirmDelete !== 'confirmdelete'}
                                style={confirmDelete !== 'confirmdelete' ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                                onPress={handleDeleteAdvertisementClicked}
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
    inputTitle: {
        fontWeight: 'bold',
    },
})

export default EditAdvertisementForm

