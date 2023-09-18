import { useState, useEffect } from "react"
import { useAddNewLitterMutation } from "../components/litters/littersApiSlice"
import { useGetDogsQuery } from "../components/dogs/dogsApiSlice"
import { Countries } from "../assets/countries"
import { bigCountries } from "../assets/bigCountries"
import { Regions } from "../assets/regions"
import useAuth from "../hooks/useAuth"
import { Calendar } from 'react-native-calendars'
import { ScrollView, TouchableOpacity, View, Text, StyleSheet, TextInput, FlatList } from "react-native"
import RNPickerSelect from 'react-native-picker-select'
import dayjs from "dayjs"
import { COLORS } from "../constants"

const NewLitterForm = ({ navigation }) => {

    const { userId } = useAuth()

    const PUPPIES_REGEX = /^[1-9]\d{0,1}$/

    const [mother, setMother] = useState('')
    const [born, setBorn] = useState('')
    const [breed, setBreed] = useState('')
    const [children, setChildren] = useState('')
    const [validMother, setValidMother] = useState(false)
    const [breedOptions, setBreedOptions] = useState([])
    const [country, setCountry] = useState('Argentina')
    const [region, setRegion] = useState('')
    const [years, setYears] = useState([])
    const [yearPickerVisible, setYearPickerVisible] = useState(false)
    const [displayedYearsCount, setDisplayedYearsCount] = useState(30)
    const [month, setMonth] = useState('')

    const day = 1000 * 60 * 60 * 24

    // POST function for adding a new litter
    const [addNewLitter, {
        isLoading: isLitterLoading,
        isSuccess: isLitterSuccess,
        isError: isLitterError,
        error: litterError
    }] = useAddNewLitterMutation()

    useEffect(() => {
        for (let i = dayjs().year(); i > 1899; i--) {
            setYears((prev) => [...prev, i])
        }
    }, [])

    // Clear the inputs if the litter has been successfully posted
    useEffect(() => {
        if (isLitterSuccess) {
            setBorn('')
            setMother('')
            setChildren('')
            setCountry('Argentina')
            setRegion('')
        }
    }, [isLitterSuccess])

    useEffect(() => {
        if (mother?.length) {
            setValidMother(true)
        } else {
            setValidMother(false)
        }
    }, [mother])

    const handleBornChanged = date => setBorn(date)
    const handleMotherChanged = value => {

        setBreed('')
        setBorn('')

        const { ids, entities } = dogs

        // Filter the mother's ID
        const motherId = ids.find(dogId => entities[dogId].id === value)

        // And get it's .values
        const mother = entities[motherId]

        if (mother?.breed === 'Mixed breed') {
            setBreedOptions({ label: 'Mixed breed', value: 'Mixed breed' })
        } else {
            setBreedOptions([
                { label: 'Mixed breed', value: 'Mixed breed' },
                { label: `${mother?.breed}`, value: `${mother?.breed}` }
            ])
        }
        
        setMother(value)
    }

    const handleCountryChanged = (value) => {
        // New country doesn't have the regions of the old one, so reset the region first
        setRegion('')
        setCountry(value)
      }

    const handleSaveLitterClicked = async () => {
        
        if (canSave) {
            // Format the date
            let finalBorn = born !== '' ? new Date(born.timestamp).toDateString() : ''
            // POST the litter
            await addNewLitter({ mother, born: finalBorn, children, breed, country, region })
            navigation.navigate('LittersList')
        }

        if (isLitterError) {
            return <Text style={{ margin: 10 }}>{litterError?.data?.message}</Text>
        }
    }

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
    
    let dogsContent
    let ownedDogs
    
    if (isLoading || isLitterLoading) {
        dogsContent = <Text style={{ margin: 10 }}>Loading...</Text>
    }
    
    if (isError) {
        dogsContent = <Text style={{ margin: 10 }}>{error?.data?.message}</Text>
    }
    
    if (isSuccess) {

        const { ids, entities } = dogs

        // Filter all the female dog IDs who are administrated by the logged in user
        const filteredIds = ids.filter(dogId => entities[dogId].user === userId && entities[dogId].female === true 
            && new Date(entities[dogId].birth).getTime() < new Date().getTime() - 60 * day)
        // And get their .values
        const filteredDogs = filteredIds.map(dogId => entities[dogId])

        if (!filteredIds.length) return <Text style={{ margin: 10 }}>You do not have female dogs who are old enough to have litters</Text>

        // Create an <option>s list for each female dog administrated by the logged in user
        if (filteredDogs?.length) {
            ownedDogs = filteredDogs.map(dog => ({ label: dog?.name, value: dog?.id }))
        }
    }

    // Boolean to control the style and 'disabled' value of the SAVE button
    const canSave = validMother && born !== '' && !isLoading && children > 0 && children < 31 && breed !== '' && born.timestamp >= Date.parse(dogs?.entities[mother]?.birth)

    if (!dogs) return null

    const saveColor = !canSave ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide

    const content = (
        <>
            <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
                <View style={styles.mainView}>
                    {dogsContent}
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Register Litter</Text>
                    
                    <Text style={styles.inputTitle}>Litter's Mother</Text>

                    <View style={styles.selectInputWide}>
                        <RNPickerSelect 
                            value={mother}
                            style={styles.pickerSelectStyles}
                            onValueChange={handleMotherChanged}
                            placeholder={{ label: 'Select Dog', value: '' }}
                            items={ownedDogs}
                        />
                    </View>

                    <Text style={styles.inputTitle}>Puppies' Breed</Text>

                    <View style={styles.selectInputWide}>
                        <RNPickerSelect 
                            value={breed}
                            style={styles.pickerSelectStyles}
                            onValueChange={(value) => setBreed(value)}
                            placeholder={{ label: '--', value: '' }}
                            items={breedOptions}
                        />
                    </View>

                    <Text style={styles.inputTitle}>Amount of Puppies Born</Text>

                    <TextInput 
                        style={styles.textInputWide}
                        value={children}
                        onChangeText={(value) => {
                            if (PUPPIES_REGEX.test(value) || value === '') {
                                setChildren(value)
                            }
                        }}
                    />

                    <Text style={styles.inputTitle}>Country</Text>

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
                            value={region}
                            style={styles.pickerSelectStyles}
                            onValueChange={(value) => setRegion(value)}
                            placeholder={{ label: '--', value: '' }}
                            items={bigCountries?.includes(country) ? Regions[country] : []}
                        />
                    </View>

                    <Text style={styles.inputTitle}>Born</Text>

                    <TouchableOpacity style={{ marginTop: 10, marginBottom: 15 }} onPress={() => setYearPickerVisible(true)}>
                        <Text style={{ textDecorationLine: 'underline' }}>Pick Year</Text>
                    </TouchableOpacity>

                    <Calendar 
                        minDate={mother?.length 
                            ? new Date(Date.parse(dogs?.entities[mother]?.birth) + 59 * day).toString()
                            : null
                        } 
                        maxDate={new Date().toDateString()} 
                        onDayPress={handleBornChanged} 
                        key={month}
                        current={month}
                        markedDates={{
                            [born.dateString]: {selected: true, disableTouchEvent: true, selectedColor: '#00adf5'}
                        }}
                        style={styles.calendar}
                    />

                    <View style={{ marginTop: 10 }}>
                        <TouchableOpacity
                            onPress={handleSaveLitterClicked}
                            style={saveColor}
                            disabled={!canSave}
                        >
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <View style={yearPickerVisible ? styles.yearPicker : { display: 'none' }}>
                <View style={{ alignItems: 'flex-end' }}>
                    <TouchableOpacity onPress={() => setYearPickerVisible(false)}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20, marginRight: 20, marginVertical: 15 }}>X</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={years.slice(0, displayedYearsCount)}
                    renderItem={({ item }) => (
                        <View key={item} style={styles.yearButtonView}>
                            <TouchableOpacity onPress={() => {
                                setMonth(item + '-01')
                                setYearPickerVisible(false)
                            }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    onEndReached={() => setDisplayedYearsCount(displayedYearsCount + 30)}
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
    yearButtonView: {
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    pickerSelectStyles: {
        inputIOS: {
          paddingVertical: 13,
          paddingHorizontal: 5,
        },
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

export default NewLitterForm
