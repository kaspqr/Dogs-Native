import { useState, useEffect } from "react"
import { useAddNewDogMutation } from "../components/dogs/dogsApiSlice"
import { Breeds } from "../assets/breeds"
import useAuth from "../hooks/useAuth"
import { Countries } from "../assets/countries"
import { bigCountries } from "../assets/bigCountries"
import { Regions } from "../assets/regions"
import { Calendar } from 'react-native-calendars'
import { ScrollView, TouchableOpacity, View, Text, StyleSheet, TextInput, Switch, FlatList } from "react-native"
import RNPickerSelect from 'react-native-picker-select'
import { COLORS } from "../constants"
import dayjs from "dayjs"

const NewDogForm = ({ navigation }) => {

    const { userId } = useAuth()

    const NAME_REGEX = /^(?!^\s*$)(?:[a-zA-Z']+(\s|$))+$/
    const CHIPNUMBER_REGEX = /^(?!^\s)(?!.*\s{2,})[\s\S]*$/

    const [name, setName] = useState('')
    const [heat, setHeat] = useState(false)
    const [sterilized, setSterilized] = useState(false)
    const [birth, setBirth] = useState('')
    const [death, setDeath] = useState('')
    const [breed, setBreed] = useState('')
    const [female, setFemale] = useState(true)
    const [microchipped, setMicrochipped] = useState(false)
    const [chipnumber, setChipnumber] = useState('')
    const [passport, setPassport] = useState(false)
    const [info, setInfo] = useState('')
    const [country, setCountry] = useState('Argentina')
    const [region, setRegion] = useState('none ')
    const [years, setYears] = useState([])
    const [birthYearPickerVisible, setBirthYearPickerVisible] = useState(false)
    const [displayedBirthYearsCount, setDisplayedBirthYearsCount] = useState(30)
    const [birthMonth, setBirthMonth] = useState('')
    const [deathYearPickerVisible, setDeathYearPickerVisible] = useState(false)
    const [displayedDeathYearsCount, setDisplayedDeathYearsCount] = useState(30)
    const [deathMonth, setDeathMonth] = useState('')

    const breeds = [ ...Object.values(Breeds) ]
    const breedOptions = breeds.map(breed => (
        { label: breed, value: breed }
    ))

    const handleBreedChanged = value => setBreed(value)
    const handleInfoChanged = value => setInfo(value)
    const handleBirthChanged = date => setBirth(date)
    const handleDeathChanged = date => setDeath(date)

    const handleHeatChanged = () => setHeat(prev => !prev)
    const handleSterilizedChanged = () => setSterilized(prev => !prev)
    const handlePassportChanged = () => setPassport(prev => !prev)

    const handleMicrochippedChanged = () => {
        setChipnumber('')
        setMicrochipped(prev => !prev)
    }

    const handleFemaleChanged = value => {
        if (value === 'male') setHeat(false)
        setFemale(value === "female" ? true : false)
    }

    // Clear the region each time the country is changed in order to avoid having a region from the wrong country
    const handleCountryChanged = (value) => {
        setRegion('')
        setCountry(value)
    }

    // POST function to add a new dog
    const [addNewDog, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useAddNewDogMutation()

    useEffect(() => {
        for (let i = dayjs().year(); i > 1899; i--) {
            setYears((prev) => [...prev, i])
        }
    }, [])

    // Reset all inputs once a dog has been POSTed
    useEffect(() => {
        if (isSuccess) {
            setName('')
            setSterilized(false)
            setHeat(false)
            setPassport(false)
            setMicrochipped(false)
            setChipnumber('')
            setBirth('')
            setDeath('')
            setBreed('')
            setInfo('')
            setCountry('')
            setRegion('none ')
            setFemale(true)
            navigation.navigate('DogsList')
        }
    }, [isSuccess, navigation])

    // Boolean to control the style and 'disabled' value of the SAVE button
    const canSave = NAME_REGEX.test(name) && !isLoading && breed.length && typeof birth === 'object' && birth !== '' 
        && ((typeof death === 'object' && death.timestamp >= birth.timestamp) || death === '')

    const handleSaveDogClicked = async () => {
        if (canSave) {
            // Format the date
            let finalBirth = birth !== '' ? new Date(birth.timestamp).toDateString() : ''
            let finalDeath = death !== '' ? new Date(death.timestamp).toDateString() : ''
            // POST the dog
            await addNewDog({ name, country, region, breed, heat, sterilized, passport, 
                microchipped, chipnumber, birth: finalBirth, death: finalDeath, info, female, "user": userId })
        }
    }

    const saveColor = !canSave ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide

    const content = (
        <>
            <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
                <View style={styles.mainView}>
                    {isError ? <Text style={{ marginBottom: 10 }}>{error?.data?.message}</Text> : null}

                    <Text style={{ marginBottom: 15, fontSize: 20, fontWeight: 'bold' }}>Register Dog</Text>

                    <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Fields marked with * are required</Text>
                    
                    <Text style={styles.inputTitle}>Dog's Name (Max. 30 Characters)*</Text>

                    <TextInput 
                        style={styles.textInputWide}
                        maxLength={30}
                        value={name}
                        onChangeText={(value) => {
                            if (NAME_REGEX.test(value) || value === '') {
                                setName(value)}
                            }
                        }
                    />

                    <Text style={styles.inputTitle}>Breed*</Text>

                    <View style={styles.selectInputWide}>
                        <RNPickerSelect 
                            value={breed}
                            style={styles.pickerSelectStyles}
                            onValueChange={handleBreedChanged}
                            items={breedOptions}
                        />
                    </View>

                    <Text style={styles.inputTitle}>Good*</Text>

                    <View style={styles.selectInputWide}>
                        <RNPickerSelect 
                            onValueChange={handleFemaleChanged}
                            style={styles.pickerSelectStyles}
                            items={[{ label: 'Girl', value: 'female' }, { label: 'Boy', value: 'male' }]}
                        />
                    </View>

                    <Text style={styles.inputTitle}>Country*</Text>

                    <View style={styles.selectInputWide}>
                        <RNPickerSelect 
                            items={Countries}
                            style={styles.pickerSelectStyles}
                            value={country}
                            onValueChange={handleCountryChanged}
                        />
                    </View>

                    <Text style={styles.inputTitle}>Region</Text>

                    <View style={styles.selectInputWide}>
                        <RNPickerSelect 
                            disabled={!bigCountries?.includes(country)}
                            style={styles.pickerSelectStyles}
                            value={region}
                            onValueChange={(value) => setRegion(value)}
                            placeholder={{ label: '--', value: 'none ' }}
                            items={bigCountries?.includes(country) ? Regions[country] : []}
                        />
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.inputTitle}>Passport </Text>
                        <Switch onValueChange={handlePassportChanged} value={passport} />
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.inputTitle}>Heat </Text>
                        <Switch onValueChange={female ? handleHeatChanged : null} value={heat} />
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.inputTitle}>Fixed </Text>
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
                        maxLength={50}
                        value={chipnumber}
                        onChangeText={(value) => {
                            if (CHIPNUMBER_REGEX.test(value) || value === '') {
                                setChipnumber(value)}
                            }
                        }
                    />

                    <Text style={styles.inputTitle}>Date of Birth*</Text>

                    <TouchableOpacity style={{ marginTop: 10, marginBottom: 15 }} onPress={() => setBirthYearPickerVisible(true)}>
                        <Text style={{ textDecorationLine: 'underline' }}>Pick Year</Text>
                    </TouchableOpacity>

                    <Calendar 
                        maxDate={death.dateString || new Date().toDateString()} 
                        style={styles.calendar}
                        onDayPress={handleBirthChanged} 
                        key={birthMonth}
                        current={birthMonth}
                        markedDates={{
                            [birth.dateString]: {selected: true, disableTouchEvent: true, selectedColor: '#00adf5'}
                        }}
                    />

                    <Text style={[styles.inputTitle, { marginTop: 10 }]}>Date of Death (If Not Alive)</Text>

                    <TouchableOpacity style={{ marginTop: 10, marginBottom: 15 }} onPress={() => setDeathYearPickerVisible(true)}>
                        <Text style={{ textDecorationLine: 'underline' }}>Pick Year</Text>
                    </TouchableOpacity>

                    <Calendar 
                        minDate={birth.dateString || null} 
                        maxDate={new Date().toDateString()} 
                        style={styles.calendar}
                        key={'death ' + deathMonth}
                        current={deathMonth}
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

                    <Text style={styles.inputTitle}>Additional Info</Text>

                    <TextInput 
                        style={styles.textInputWide}
                        multiline={true}
                        numberOfLines={10}
                        maxLength={500}
                        value={info}
                        onChangeText={handleInfoChanged}
                    />

                    <View>
                        <TouchableOpacity
                            style={saveColor}
                            disabled={!canSave}
                            onPress={handleSaveDogClicked}
                        >
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <View style={birthYearPickerVisible ? styles.yearPicker : { display: 'none' }}>
                <View style={{ alignItems: 'flex-end' }}>
                    <TouchableOpacity onPress={() => setBirthYearPickerVisible(false)}>
                        <Text style={{ fontWeight: 'bold', fontSize: 20, marginRight: 20, marginVertical: 15 }}>X</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={years.slice(0, displayedBirthYearsCount)}
                    renderItem={({ item }) => (
                        <View key={item} style={styles.yearButtonView}>
                        <TouchableOpacity onPress={() => {
                            setBirthMonth(item + '-01')
                            setBirthYearPickerVisible(false)
                        }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item}</Text>
                        </TouchableOpacity>
                        </View>
                    )}
                    onEndReached={() => setDisplayedBirthYearsCount(displayedBirthYearsCount + 30)}
                    onEndReachedThreshold={0.2}
                />
            </View>
            <View style={deathYearPickerVisible ? styles.yearPicker : { display: 'none' }}>
                <View style={{ alignItems: 'flex-end' }}>
                    <TouchableOpacity onPress={() => setDeathYearPickerVisible(false)}>
                        <Text style={{ fontWeight: 'bold', fontSize: 20, marginRight: 20, marginVertical: 15 }}>X</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={years.slice(0, displayedDeathYearsCount)}
                    renderItem={({ item }) => (
                        <View key={item} style={styles.yearButtonView}>
                        <TouchableOpacity onPress={() => {
                            setDeathMonth(item + '-01')
                            setDeathYearPickerVisible(false)
                        }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item}</Text>
                        </TouchableOpacity>
                        </View>
                    )}
                    onEndReached={() => setDisplayedDeathYearsCount(displayedDeathYearsCount + 30)}
                    onEndReachedThreshold={0.2}
                />
            </View>
        </>
    )

  return content
}

const styles = StyleSheet.create({
    mainView: {
        marginHorizontal: 10,
        marginBottom: 30,
        marginTop: 10,
    },
    yearPicker: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: COLORS.lightWhite,
        zIndex: 1,
    },
    pickerSelectStyles: {
        inputIOS: {
          paddingVertical: 13,
          paddingHorizontal: 5,
        },
    },
    yearButtonView: {
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
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
    calendar: {
        borderWidth: 1,
        borderColor: 'lightgrey',
    },
})

export default NewDogForm
