import { useGetDogsQuery } from "../components/dogs/dogsApiSlice"
import Dog from "../components/dogs/Dog"
import useAuth from "../hooks/useAuth"
import { Countries } from "../assets/countries"
import { bigCountries } from "../assets/bigCountries"
import { Regions } from "../assets/regions"
import { Breeds } from "../assets/breeds"
import { useState } from "react"
import { Calendar } from 'react-native-calendars'
import { ScrollView, TouchableOpacity, View, Text, StyleSheet, TextInput } from "react-native"
import RNPickerSelect from 'react-native-picker-select'
import { COLORS } from "../constants"

const DogsList = ({ navigation }) => {

  const { userId } = useAuth()

  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const [breed, setBreed] = useState('')
  const [chipnumber, setChipnumber] = useState('')
  const [gender, setGender] = useState('')
  const [heat, setHeat] = useState('')
  const [chipped, setChipped] = useState('')
  const [passport, setPassport] = useState('')
  const [fixed, setFixed] = useState('')
  const [bornEarliest, setBornEarliest] = useState('')
  const [bornLatest, setBornLatest] = useState('')
  const [filteredIds, setFilteredIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [newPage, setNewPage] = useState('')
  const [inputsVisible, setInputsVisible] = useState(false)


  const breeds = [ ...Object.values(Breeds) ]
  const breedOptions = breeds.map(breed => (
    { label: breed, value: breed }
  ))

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

  const handleBornEarliestChanged = date => setBornEarliest(date)
  const handleBornLatestChanged = date => setBornLatest(date)

  const handleCountryChanged = (value) => {
    setRegion('')
    setCountry(value)
  }

  const handleChippedChanged = (value) => {
    // Clear chipnumber if dog is not chipped, as the input will be disabled
    if (value !== 'yes') setChipnumber('')
    setChipped(value)
  }

  const handleGenderChanged = (value) => {
    // Clear heat if dog is not female, as the input will be disabled
    if (value !== 'female') setHeat('')
    setGender(value)
  }

  const handleToggleFilterView = () => setInputsVisible(!inputsVisible)

  const handleSearchClicked = () => {

    setCurrentPage(1)

    // Go through all filters
    const finalBornEarliest = bornEarliest !== '' ? new Date(bornEarliest.timestamp) : ''

    const filteredDogsBornEarliest = finalBornEarliest !== ''
      ? Object.values(dogs?.entities)?.filter((dog) => {
        return new Date(dog.birth) >= finalBornEarliest
      })
      : Object.values(dogs?.entities)

    const finalBornLatest = bornLatest !== '' ? new Date(bornLatest.timestamp) : ''

    const filteredDogsBornLatest = finalBornLatest !== ''
      ? filteredDogsBornEarliest?.filter((dog) => {
        return new Date(dog.birth) <= finalBornLatest
      })
      : filteredDogsBornEarliest

    const filteredDogsName = name?.length
      ? filteredDogsBornLatest?.filter((dog) => {
        return dog.name?.includes(name)
      })
      : filteredDogsBornLatest
  
    const filteredDogsChipnumber = chipnumber?.length
      ? filteredDogsName?.filter((dog) => {
        return dog.chipnumber === chipnumber
      })
      : filteredDogsName
  
    const filteredDogsRegion = region?.length
      ? filteredDogsChipnumber?.filter((dog) => {
        return dog.region === region
      })
      : filteredDogsChipnumber
  
    const filteredDogsCountry = country?.length
      ? filteredDogsRegion?.filter((dog) => {
        return dog.country === country
      })
      : filteredDogsRegion
  
    const filteredDogsBreed = breed?.length
      ? filteredDogsCountry?.filter((dog) => {
        return dog.breed === breed
      })
      : filteredDogsCountry
  
    const filteredDogsGender = gender?.length
      ? filteredDogsBreed?.filter((dog) => {
        if (gender === 'female') {
          return dog.female === true
        } else {
          return dog.female === false
        }
      })
      : filteredDogsBreed
  
    const filteredDogsChipped = chipped?.length
      ? filteredDogsGender?.filter((dog) => {
        if (chipped === 'yes') {
          return dog.microchipped === true
        } else {
          return dog.microchipped === false
        }
      })
      : filteredDogsGender
  
    const filteredDogsPassport = passport?.length
      ? filteredDogsChipped?.filter((dog) => {
        if (passport === 'yes') {
          return dog.passport === true
        } else {
          return dog.passport === false
        }
      })
      : filteredDogsChipped
  
    const filteredDogsFixed = fixed?.length
      ? filteredDogsPassport?.filter((dog) => {
        if (fixed === 'yes') {
          return dog.sterilized === true
        } else {
          return dog.sterilized === false
        }
      })
      : filteredDogsPassport
  
    const filteredDogsHeat = heat?.length
      ? filteredDogsFixed?.filter((dog) => {
        if (heat === 'yes') {
          return dog.heat === true
        } else {
          return dog.heat === false
        }
      })
      : filteredDogsFixed

    const finalFilteredDogs = filteredDogsHeat

    if (!finalFilteredDogs?.length) alert("Unfortunately, no matching dog has been found")

    const filteredIds = finalFilteredDogs?.reverse().map((dog) => {
      return dog._id
    })

    setFilteredIds(filteredIds || [])
    
  }

  // Variable for errors and content
  let content

  if (isLoading) content = <Text style={{ margin: 10 }}>Loading...</Text>

  if (isError) {
    content = <Text style={{ margin: 10 }}>{error?.data?.message}</Text>
  }

  if (isSuccess) {

    // Newest dogs first
    const reversedNewIds = Object.values(dogs?.entities)?.reverse().map((ad) => {
      return ad._id
    })

    const itemsPerPage = 20

    const maxPage = Math.ceil(filteredIds?.length ? filteredIds?.length / itemsPerPage : reversedNewIds?.length / itemsPerPage)

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    // Which dogs to display on current page
    const dogsToDisplay = filteredIds?.length
      ? filteredIds.slice(startIndex, endIndex)
      : reversedNewIds.slice(startIndex, endIndex)

    const goToPageButtonDisabled = newPage < 1 || newPage > maxPage || parseInt(newPage) === currentPage

    // Dog component for each dog
    const tableContent = dogsToDisplay.map(dogId => (
      <Dog key={dogId} dogId={dogId} />
    ))

    if (!reversedNewIds?.length) {
      return <View>
        {userId?.length 
          ? <View>
            <TouchableOpacity style={styles.blackButtonWide}>
              <Text style={styles.buttonText}>
                Add a New Dog
              </Text>
            </TouchableOpacity>
          </View> 
          : null
        }
        <Text style={{ margin: 10 }}>There are currently no dogs in the database</Text>
      </View>
    }

    content = (
      <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>

        <View style={styles.mainView}>
          {userId?.length 
            ? <View>
              <TouchableOpacity style={styles.blackButtonWide} onPress={() => navigation.navigate('NewDogForm')}>
                <Text style={styles.buttonText}>
                  Add a New Dog
                </Text>
              </TouchableOpacity>
            </View> 
            : null
          }

          <View>
            <TouchableOpacity
              style={styles.blackButtonWide}
              onPress={handleToggleFilterView}
            >
              <Text style={styles.buttonText}>Toggle Search View</Text>
            </TouchableOpacity>
          </View>

          <View style={inputsVisible ? styles.filterViewVisible : styles.filterViewHidden}>
            <Text style={styles.inputTitle}>Name</Text>

            <TextInput 
              value={name}
              onChangeText={(value) => setName(value)}
              style={styles.textInputWide}
            />

            <Text style={styles.inputTitle}>Breed</Text>

            <View style={styles.selectInputWide}>
              <RNPickerSelect 
                onValueChange={(value) => setBreed(value)}
                value={breed}
                items={breedOptions}
                placeholder={{ label: '--', value: '' }} 
              />
            </View>

            <Text style={styles.inputTitle}>Born at Earliest</Text>

            <Calendar 
              maxDate={bornLatest.dateString || new Date().toDateString()} 
              onDayPress={handleBornEarliestChanged} 
              style={styles.calendar}
              markedDates={{
                [bornEarliest.dateString]: {selected: true, disableTouchEvent: true, selectedColor: '#00adf5'}
              }}
            />

            <View style={{ marginTop: 10 }}>
              <TouchableOpacity 
                disabled={bornEarliest === ''}
                style={bornEarliest === '' ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                onPress={() => setBornEarliest('')}
              >
                <Text style={styles.buttonText}>Clear Date</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputTitle}>Born at Latest</Text>

            <Calendar 
              minDate={bornEarliest.dateString || null} 
              maxDate={new Date().toDateString()} 
              onDayPress={handleBornLatestChanged} 
              style={styles.calendar}
              markedDates={{
                [bornLatest.dateString]: {selected: true, disableTouchEvent: true, selectedColor: '#00adf5'}
              }}
            />

            <View style={{ marginTop: 10 }}>
              <TouchableOpacity 
                disabled={bornLatest === ''}
                style={bornLatest === '' ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide}
                onPress={() => setBornLatest('')}
              >
                <Text style={styles.buttonText}>Clear Date</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputTitle}>Country</Text>

            <View style={styles.selectInputWide}>
              <RNPickerSelect 
                value={country}
                onValueChange={handleCountryChanged}
                placeholder={{ label: '--', value: '' }}
                items={Countries}
              />
            </View>
            
            <Text style={styles.inputTitle}>Region</Text>

            <View style={styles.selectInputWide}>
              <RNPickerSelect 
                disabled={!bigCountries?.includes(country)}
                value={region}
                onValueChange={(value) => setRegion(value)}
                placeholder={{ label: '--', value: '' }}
                items={bigCountries?.includes(country) ? Regions[country] : []}
              />
            </View>

            <Text style={styles.inputTitle}>Passport</Text>

            <View style={styles.selectInputWide}>
              <RNPickerSelect
                value={passport} 
                onValueChange={(value) => setPassport(value)}
                items={[{ label: '--', value: '' }, 
                  { label: 'Documented', value: 'yes' }, 
                  { label: 'Not Documented', value: 'no' } 
                ]}
              />
            </View>

            <Text style={styles.inputTitle}>Fixed</Text>

            <View style={styles.selectInputWide}>
              <RNPickerSelect 
                value={fixed} 
                onValueChange={(value) => setFixed(value)}
                items={[{ label: '--', value: '' }, 
                  { label: 'Fixed', value: 'yes' }, 
                  { label: 'Not Fixed', value: 'no' } 
                ]}
              />
            </View>

            <Text style={styles.inputTitle}>Good</Text>

            <View style={styles.selectInputWide}>
              <RNPickerSelect
                value={gender} 
                onValueChange={handleGenderChanged}
                items={[{ label: '--', value: '' }, 
                  { label: 'Girl', value: 'female' }, 
                  { label: 'Boy', value: 'male' } 
                ]}
              />
            </View>

            <Text style={styles.inputTitle}>Currently in Heat</Text>

            <View style={styles.selectInputWide}>
              <RNPickerSelect
                disabled={gender !== 'female'}
                value={heat} 
                onValueChange={(value) => setHeat(value)}
                items={[{ label: '--', value: '' }, 
                  { label: 'Yes', value: 'yes' }, 
                  { label: 'No', value: 'no' } 
                ]}
              />
            </View>

            <Text style={styles.inputTitle}>Chipped</Text>

            <View style={styles.selectInputWide}>
              <RNPickerSelect
                value={chipped} 
                onValueChange={handleChippedChanged}
                items={[{ label: '--', value: '' }, 
                  { label: 'Yes', value: 'yes' }, 
                  { label: 'No', value: 'no' } 
                ]}
              />
            </View>

            <Text style={styles.inputTitle}>Chipnumber</Text>

            <TextInput 
              editable={chipped === 'yes'}
              value={chipnumber} 
              onChangeText={(value) => setChipnumber(value)}
              style={styles.textInputWide}
            />

            <View>
              <TouchableOpacity 
                onPress={handleSearchClicked}
                style={styles.blackButtonWide}
              >
                <Text style={styles.buttonText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={maxPage === 1 ? { display: 'none' } : [styles.paginationRow]}>
            <View style={{flex: 1}}>
              <TouchableOpacity 
                style={currentPage === 1 ? [styles.blackButton, styles.greyButton] : styles.blackButton}
                disabled={currentPage === 1}
                onPress={() => setCurrentPage(currentPage - 1)}
              >
                <Text style={styles.buttonText}>{'<-'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.paginationTextView}>
              <Text>Page {currentPage} of {maxPage}</Text>
            </View>

            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <TouchableOpacity 
                style={currentPage === maxPage ? [styles.blackButton, styles.greyButton] : styles.blackButton}
                disabled={currentPage === maxPage}
                onPress={() => setCurrentPage(currentPage + 1)}
              >
                <Text style={styles.buttonText}>{'->'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {tableContent}

          <View>

            <View 
              style={maxPage === 1 ? {display: "none"} : [styles.paginationInputView, {marginBottom: 5}]}
            >

              <TextInput 
                onChangeText={(value) => setNewPage(value)} 
                value={newPage} 
                placeholder="Page #"
                style={[styles.textInput, {height: 41, marginRight: 10}]}
              />

              <View>
                <TouchableOpacity
                  style={goToPageButtonDisabled ? [styles.blackNewPageButton, styles.greyButton] : styles.blackNewPageButton}
                  disabled={goToPageButtonDisabled}
                  onPress={() => {
                    if (newPage >= 1 && newPage <= maxPage) {
                      setCurrentPage(parseInt(newPage))
                    }
                  }}
                >
                  <Text style={styles.buttonText}>Go to Page</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    )
  }

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
  calendar: {
    borderWidth: 1,
    borderColor: 'lightgrey',
  },
})

export default DogsList
