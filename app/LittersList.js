import { useGetLittersQuery } from "../components/litters/littersApiSlice"
import Litter from "../components/litters/Litter"
import useAuth from "../hooks/useAuth"
import { Countries } from "../assets/countries"
import { bigCountries } from "../assets/bigCountries"
import { Regions } from "../assets/regions"
import { Breeds } from "../assets/breeds"
import React, { useState, useEffect } from "react"
import { Calendar } from 'react-native-calendars'
import { ScrollView, TouchableOpacity, View, Text, StyleSheet, TextInput, FlatList } from "react-native"
import RNPickerSelect from 'react-native-picker-select'
import dayjs from "dayjs"
import { COLORS } from "../constants"

const LittersList = ({ navigation }) => {

  const { userId } = useAuth()

  const PUPPIES_AMOUNT_REGEX = /^[1-9]\d{0,1}$/

  const [bornEarliest, setBornEarliest] = useState('')
  const [bornLatest, setBornLatest] = useState('')
  const [lowestPuppies, setLowestPuppies] = useState('')
  const [highestPuppies, setHighestPuppies] = useState('')
  const [filteredIds, setFilteredIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [newPage, setNewPage] = useState('')
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const [breed, setBreed] = useState('')
  const [inputsVisible, setInputsVisible] = useState(false)
  const [years, setYears] = useState([])
  const [earliestYearPickerVisible, setEarliestYearPickerVisible] = useState(false)
  const [displayedEarliestYearsCount, setDisplayedEarliestYearsCount] = useState(30)
  const [earliestMonth, setEarliestMonth] = useState('')
  const [latestYearPickerVisible, setLatestYearPickerVisible] = useState(false)
  const [displayedLatestYearsCount, setDisplayedLatestYearsCount] = useState(30)
  const [latestMonth, setLatestMonth] = useState('')

  const breeds = [ ...Object.values(Breeds) ]
  const breedOptions = breeds.map(breed => (
      { label: breed, value: breed }
  ))

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

  const handleBornEarliestChanged = date => setBornEarliest(date)
  const handleBornLatestChanged = date => setBornLatest(date)

  const handleCountryChanged = (e) => {
    // New country doesn't have the regions of the old one, so reset the region first
    setRegion('')
    setCountry(e.target.value)
  }

  const handleToggleFilterView = () => setInputsVisible(!inputsVisible)

  useEffect(() => {
    for (let i = dayjs().year(); i > 1899; i--) {
        setYears((prev) => [...prev, i])
    }
  }, [])

  const handleSearchClicked = () => {
    if (lowestPuppies?.length && highestPuppies?.length && highestPuppies < lowestPuppies) {
      return alert("Highest amount of puppies cannot be lower than lowest amount of puppies")
    }

    setInputsVisible(!inputsVisible)

    setCurrentPage(1)

    const finalBornEarliest = bornEarliest !== '' ? new Date(bornEarliest.timestamp) : ''

    // Go through all the filters
    const filteredLittersBornEarliest = finalBornEarliest !== ''
      ? Object.values(litters?.entities)?.filter((litter) => {
        return new Date(litter.born) >= finalBornEarliest
      })
      : Object.values(litters?.entities)

    const finalBornLatest = bornLatest !== '' ? new Date(bornLatest.timestamp) : ''

    const filteredLittersBornLatest = finalBornLatest !== ''
      ? filteredLittersBornEarliest?.filter((litter) => {
        return new Date(litter.born) <= finalBornLatest
      })
      : filteredLittersBornEarliest

    const filteredLittersRegion = region?.length
      ? filteredLittersBornLatest?.filter((litter) => {
        return litter.region === region
      })
      : filteredLittersBornLatest
  
    const filteredLittersCountry = country?.length
      ? filteredLittersRegion?.filter((litter) => {
        return litter.country === country
      })
      : filteredLittersRegion
  
    const filteredLittersLowestPuppies = lowestPuppies?.length
      ? filteredLittersCountry?.filter((litter) => {
        return litter.children >= parseInt(lowestPuppies)
      })
      : filteredLittersCountry

    const filteredLittersBreed = breed?.length
      ? filteredLittersLowestPuppies?.filter((litter) => {
        return litter.breed === breed
      })
      : filteredLittersLowestPuppies
  
    const filteredLittersHighestPuppies = highestPuppies?.length
      ? filteredLittersBreed?.filter((litter) => {
        return litter.children <= parseInt(highestPuppies)
      })
      : filteredLittersBreed

    const finalFilteredLitters = filteredLittersHighestPuppies

    if (!finalFilteredLitters?.length) alert("Unfortunately, no matching litter has been found")

    // Reverse to get newest to oldest
    const filteredIds = finalFilteredLitters?.reverse().map((litter) => {
      return litter._id
    })

    setFilteredIds(filteredIds || [])
    
  }

  // Variable for error messages and content
  let content

  if (isLoading) content = <Text style={{ margin: 10 }}>Loading...</Text>
  if (isError) content = <Text style={{ margin: 10 }}>{error?.data?.message}</Text>

  if (isSuccess) {
    // Reverse original ids (without filters) to have newest come first
    const reversedNewIds = Object.values(litters?.entities)?.reverse().map((litter) => {
      return litter._id
    })

    const itemsPerPage = 20

    const maxPage = Math.ceil(filteredIds?.length ? filteredIds?.length / itemsPerPage : reversedNewIds?.length / itemsPerPage)

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    // Litters to display on the current page
    const littersToDisplay = filteredIds?.length
      ? filteredIds.slice(startIndex, endIndex)
      : reversedNewIds.slice(startIndex, endIndex)

    const goToPageButtonDisabled = newPage < 1 || newPage > maxPage || parseInt(newPage) === currentPage

    // Litter component for each litter
    const tableContent = littersToDisplay.map(litterId => (
      <Litter key={litterId} litterId={litterId} />
    ))

    if (!reversedNewIds?.length) {
      return <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
        <View style={styles.mainView}>
          {userId?.length 
            ? <View>
              <TouchableOpacity style={styles.blackButtonWide}>
                <Text style={styles.buttonText}>Add a New Litter</Text>
              </TouchableOpacity>
            </View> 
            : null
          }
          <Text style={{ margin: 10 }}>There are currently no litters in the database</Text>
        </View>
      </ScrollView>
    }

    content = (
      <>
        <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
          <View style={styles.mainView}>
            {userId?.length 
              ? <View>
                <TouchableOpacity onPress={() => navigation.navigate('NewLitterForm')} style={styles.blackButtonWide}>
                  <Text style={styles.buttonText}>Add a New Litter</Text>
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

              <Text style={styles.inputTitle}>Born at Earliest</Text>

              <TouchableOpacity style={{ marginTop: 10, marginBottom: 15 }} onPress={() => setEarliestYearPickerVisible(true)}>
                <Text style={{ textDecorationLine: 'underline' }}>Pick Year</Text>
              </TouchableOpacity>

              <Calendar 
                maxDate={bornLatest.dateString || new Date().toDateString()} 
                onDayPress={handleBornEarliestChanged} 
                style={styles.calendar}
                key={earliestMonth}
                current={earliestMonth}
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

              <TouchableOpacity style={{ marginTop: 10, marginBottom: 15 }} onPress={() => setLatestYearPickerVisible(true)}>
                <Text style={{ textDecorationLine: 'underline' }}>Pick Year</Text>
              </TouchableOpacity>

              <Calendar 
                minDate={bornEarliest.dateString || null} 
                maxDate={new Date().toDateString()} 
                style={styles.calendar}
                key={'latest ' + latestMonth}
                current={latestMonth}
                onDayPress={handleBornLatestChanged} 
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

              <Text style={styles.inputTitle}>Breed</Text>

              <View style={styles.selectInputWide}>
                <RNPickerSelect 
                  onValueChange={(value) => setBreed(value)}
                  style={styles.pickerSelectStyles}
                  value={breed}
                  placeholder={{ label: '--', value: '' }}
                  items={breedOptions}
                />
              </View>

              <Text style={styles.inputTitle}>Country</Text>

              <View style={styles.selectInputWide}>
                <RNPickerSelect 
                  value={country}
                  style={styles.pickerSelectStyles}
                  onValueChange={handleCountryChanged}
                  placeholder={{ label: '--', value: '' }}
                  items={Countries}
                />
              </View>
              
              <Text style={styles.inputTitle}>Region</Text>

              <View style={styles.selectInputWide}>
                <RNPickerSelect 
                  disabled={!bigCountries.includes(country)}
                  style={styles.pickerSelectStyles}
                  value={region}
                  onValueChange={(value) => setRegion(value)}
                  placeholder={{ label: '--', value: '' }}
                  items={bigCountries?.includes(country)
                    ? Regions[country]
                    : []
                  }
                />
              </View>

              <Text style={styles.inputTitle}>Lowest Amount of Puppies</Text>

              <TextInput 
                style={styles.textInputWide}
                value={lowestPuppies}
                onChangeText={(value) => {
                  if (PUPPIES_AMOUNT_REGEX.test(value) || value === '') {
                    setLowestPuppies(value)}
                  }
                }
              />

              <Text style={styles.inputTitle}>Highest Amount of Puppies</Text>

              <TextInput 
                value={highestPuppies}
                style={styles.textInputWide}
                onChangeText={(value) => {
                  if (PUPPIES_AMOUNT_REGEX.test(value) || value === '') {
                    setHighestPuppies(value)}
                  }
                }
              />

              <View>
                <TouchableOpacity 
                  onPress={handleSearchClicked}
                  disabled={lowestPuppies?.length > 0 && highestPuppies?.length > 0 && parseInt(lowestPuppies) > parseInt(highestPuppies)}
                  style={lowestPuppies?.length > 0 && highestPuppies?.length > 0
                    && parseInt(lowestPuppies) > parseInt(highestPuppies) ? [styles.blackButtonWide, styles.greyButton] : styles.blackButtonWide
                  }
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
        <View style={earliestYearPickerVisible ? styles.yearPicker : { display: 'none' }}>
          <View style={{ alignItems: 'flex-end' }}>
            <TouchableOpacity onPress={() => setEarliestYearPickerVisible(false)}>
              <Text style={{ fontWeight: 'bold', fontSize: 20, marginRight: 20, marginVertical: 15 }}>X</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={years.slice(0, displayedEarliestYearsCount)}
            renderItem={({ item }) => (
              <View key={item} style={styles.yearButtonView}>
                <TouchableOpacity onPress={() => {
                  setEarliestMonth(item + '-01')
                  setEarliestYearPickerVisible(false)
                }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item}</Text>
                </TouchableOpacity>
              </View>
            )}
            onEndReached={() => setDisplayedEarliestYearsCount(displayedEarliestYearsCount + 30)}
            onEndReachedThreshold={0.2}
          />
        </View>
        <View style={latestYearPickerVisible ? styles.yearPicker : { display: 'none' }}>
          <View style={{ alignItems: 'flex-end' }}>
            <TouchableOpacity onPress={() => setLatestYearPickerVisible(false)}>
              <Text style={{ fontWeight: 'bold', fontSize: 20, marginRight: 20, marginVertical: 15 }}>X</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={years.slice(0, displayedLatestYearsCount)}
            renderItem={({ item }) => (
              <View key={item} style={styles.yearButtonView}>
                <TouchableOpacity onPress={() => {
                  setLatestMonth(item + '-01')
                  setLatestYearPickerVisible(false)
                }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item}</Text>
                </TouchableOpacity>
              </View>
            )}
            onEndReached={() => setDisplayedLatestYearsCount(displayedLatestYearsCount + 30)}
            onEndReachedThreshold={0.2}
          />
        </View>
      </>
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
  blackButtonWide: {
    backgroundColor: '#000000',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  pickerSelectStyles: {
    inputIOS: {
      paddingVertical: 13,
      paddingHorizontal: 5,
    },
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

export default LittersList
