import { useState, useEffect } from "react"
import { useAddNewAdvertisementMutation } from "../components/advertisements/advertisementsApiSlice"
import useAuth from "../hooks/useAuth"
import { Countries } from "../assets/countries"
import { bigCountries } from "../assets/bigCountries"
import { Regions } from "../assets/regions"
import { AdvertisementTypes } from "../assets/advertisementTypes"
import { Currencies } from "../assets/currencies"
import { Breeds } from "../assets/breeds"
import * as ImagePicker from 'expo-image-picker'
import { ScrollView, TouchableOpacity, View, Text, StyleSheet, TextInput } from "react-native"
import RNPickerSelect from 'react-native-picker-select'

import { COLORS } from "../constants"

const NewAdvertisementForm = ({ navigation }) => {

    const { userId } = useAuth()

    const breeds = [ ...Object.values(Breeds) ]
    const breedOptions = breeds.map(breed => (
        { label: breed, value: breed }
    ))

    // POST method for a new advertisement
    const [addNewAdvertisement, {
        isLoading: isAdvertisementLoading,
        isSuccess: isAdvertisementSuccess,
        isError: isAdvertisementError,
        error: advertisementError
    }] = useAddNewAdvertisementMutation()

    const PRICE_REGEX = /^[1-9]\d{0,11}$/
    const TITLE_REGEX = /^(?!^\s*$)(?:[\w.,!?:]+(?:\s|$))+$/

    const [title, setTitle] = useState('')
    const [type, setType] = useState('For Sale')
    const [price, setPrice] = useState('')
    const [currency, setCurrency] = useState('$')
    const [country, setCountry] = useState('Argentina')
    const [region, setRegion] = useState('')
    const [breed, setBreed] = useState('')
    const [info, setInfo] = useState('')
    const [previewSource, setPreviewSource] = useState(null)
    const [base64Value, setBase64Value] = useState(null)

    useEffect(() => {
        // Once POSTed, set everything back to default
        if (isAdvertisementSuccess) {
            setTitle('')
            setType('For Sale')
            setPrice('')
            setCurrency('$')
            setCountry('Argentina')
            setRegion('')
            setBreed('')
            setInfo('')
            navigation.navigate('AdvertisementsList', { navigation })
        }
    }, [isAdvertisementSuccess, navigation])

    if (isAdvertisementError) return <Text style={{ margin: 10 }}>{advertisementError}</Text>

    // Boolean to control the style and 'disabled' value of the SAVE button
    const canSave = title?.length && type?.length && info?.length && !isAdvertisementLoading
        && (type === 'Found' || type === 'Lost' || (price?.length && currency?.length)) 

    // Function to handle image selection
    const handleFileClicked = async () => {

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

    const handleSaveAdvertisementClicked = async () => {
        if (canSave) {
            // POST method for an advertisement
            await addNewAdvertisement({ poster: userId, title, price, type, info, currency, country, region, breed, image: base64Value })
        }
    }

    // Clear the region every time the country is changed to prevent having a region from a different country
    const handleCountryChanged = (value) => {
        setRegion('')
        setCountry(value)
    }

    const handleTypeChanged = (value) => {
        if (value === 'Lost' || value === 'Found') {
            // Price nor currency is allowed with above types
            setPrice('')
            setCurrency('')
        } else if (currency === '') {
            setCurrency('$')
        }

        if (value !== 'Require Female Dog' && value !== 'Require Male Dog') {
            setBreed('')
        }

        setType(value)
    }

    const content = (
        <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
            <View style={styles.mainView}>
                <Text style={{ marginBottom: 15, fontSize: 20, fontWeight: 'bold' }}>Post Advertisement</Text>
                
                <Text style={styles.inputTitle}>Title</Text>

                <TextInput 
                    style={styles.textInputWide}
                    maxLength={50}
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

                {previewSource 
                    ? <Image style={{height: 300, width: 300, borderRadius: 150}} source={{ uri: previewSource }} />
                    : null
                }

                <Text style={styles.inputTitle}>Type</Text>

                <View style={styles.selectInputWide}>
                    <RNPickerSelect 
                        value={type}
                        onValueChange={handleTypeChanged}
                        items={AdvertisementTypes}
                    />
                </View>

                <Text style={styles.inputTitle}>Breed Required</Text>

                <View style={styles.selectInputWide}>
                    <RNPickerSelect 
                        disabled={type !== 'Require Female Dog' && type !== 'Require Male Dog'}
                        value={breed}
                        onValueChange={(value) => setBreed(value)}
                        placeholder={{ label: '--', value: '' }}
                        items={breedOptions}
                    />
                </View>
                
                <Text style={styles.inputTitle}>Price</Text>

                <TextInput 
                    value={price}
                    style={styles.textInputWide}
                    editable={type !== 'Found' && type !== 'Lost'}
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
                        disabled={type === 'Found' || type === 'Lost'}
                        placeholder={{ label: '--', value: '' }}
                        onValueChange={(value) => setCurrency(value)}
                    />
                </View>

                <Text style={styles.inputTitle}>Country</Text>

                <View style={styles.selectInputWide}>
                    <RNPickerSelect 
                        value={country}
                        items={Countries}
                        onValueChange={handleCountryChanged}
                    />
                </View>

                <Text style={styles.inputTitle}>Region</Text>

                <View style={styles.selectInputWide}>
                    <RNPickerSelect 
                        disabled={!bigCountries?.includes(country)}
                        items={bigCountries?.includes(country) ? Regions[country] : []}
                        value={region}
                        onValueChange={(value) => setRegion(value)}
                        placeholder={{ label: '--', value: '' }}
                    />
                </View>

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
                        <Text style={styles.buttonText}>Post Advertisement</Text>
                    </TouchableOpacity>
                </View>
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
})

export default NewAdvertisementForm
