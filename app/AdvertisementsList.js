import { useGetAdvertisementsQuery } from "../components/advertisements/advertisementsApiSlice"
import Advertisement from "../components/advertisements/Advertisement"
import useAuth from "../hooks/useAuth"
import { AdvertisementTypes } from "../assets/advertisementTypes"
import { Countries } from "../assets/countries"
import { bigCountries } from "../assets/bigCountries"
import { Regions } from "../assets/regions"
import { Currencies } from "../assets/currencies"
import { useState } from "react"
import { Breeds } from "../assets/breeds"

import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'

import { COLORS } from "../constants"

import RNPickerSelect from 'react-native-picker-select'

const AdvertisementsList = ({ navigation }) => {

  const [filterViewVisible, setFilterViewVisible] = useState(false)
  const toggleFilterView = () => setFilterViewVisible(!filterViewVisible)

  const [title, setTitle] = useState('')
  const [type, setType] = useState('')
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const [currency, setCurrency] = useState('')
  const [breed, setBreed] = useState('')
  const [lowestPrice, setLowestPrice] = useState('')
  const [highestPrice, setHighestPrice] = useState('')
  const [filteredIds, setFilteredIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [newPage, setNewPage] = useState('')
  const [sort, setSort] = useState('')

  const { userId } = useAuth()

  const PRICE_REGEX = /^[1-9]\d{0,11}$/

  const breeds = [ ...Object.values(Breeds) ]
  const breedOptions = breeds.map(breed => (
      { label: breed, value: breed }
  ))

  const currencyDisabled = type === 'Found' || type === 'Lost' || type === ''

  // GET all the advertisements
  const {
    data: advertisements,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetAdvertisementsQuery('advertisementsList', {
    pollingInterval: 75000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true
  })
  
  const handleCountryChanged = (value) => {
    // New country doesn't have the regions of the old one, so reset the region first
    setRegion('')
    setCountry(value)
  }

  const handleTypeChanged = (value) => {
    if (value === '' || value === 'Found' || value === 'Lost') {
      // Cannot have a currency nor price with above types
      setCurrency('')
      setLowestPrice('')
      setHighestPrice('')
      setSort('')
    }

    if (value !== 'Require Female Dog' && value !== 'Require Male Dog') {
      setBreed('')
    }

    setType(value)
  }

  const handleSearchClicked = () => {

    if (lowestPrice?.length && highestPrice?.length && highestPrice < lowestPrice) {
      return alert("Highest price cannot be lower than lowest price")
    }

    setCurrentPage(1)
  
    // Go through each filter
    const filteredAdsTitle = Object.values(advertisements?.entities)?.filter((ad) => {
      return ad.title?.includes(title)
    })
  
    const filteredAdsRegion = region?.length
      ? filteredAdsTitle?.filter((ad) => {
        return ad.region === region
      })
      : filteredAdsTitle
  
    const filteredAdsCountry = country?.length
      ? filteredAdsRegion?.filter((ad) => {
        return ad.country === country
      })
      : filteredAdsRegion

    const filteredAdsType = type?.length
      ? filteredAdsCountry?.filter((ad) => {
        return ad.type === type
      })
      : filteredAdsCountry

    const filteredAdsBreed = breed?.length
      ? filteredAdsType?.filter((ad) => {
        return ad.breed === breed
      })
      : filteredAdsType
  
    const filteredAdsCurrency = currency?.length
      ? filteredAdsBreed?.filter((ad) => {
        return ad.currency === currency
      })
      : filteredAdsBreed
  
    const filteredAdsLowestPrice = lowestPrice?.length
      ? filteredAdsCurrency?.filter((ad) => {
        return ad.price >= parseInt(lowestPrice)
      })
      : filteredAdsCurrency
  
    const filteredAdsHighestPrice = highestPrice?.length
      ? filteredAdsLowestPrice?.filter((ad) => {
        return ad.price <= parseInt(highestPrice)
      })
      : filteredAdsLowestPrice

    const finalFilteredAds = !sort?.length 
      ? filteredAdsHighestPrice
      : sort === 'ascending'
        ? filteredAdsHighestPrice.sort((a, b) => b.price - a.price)
        : sort === 'descending'
          ? filteredAdsHighestPrice.sort((a, b) => a.price - b.price)
          : filteredAdsHighestPrice

    if (!finalFilteredAds?.length) alert("Unfortunately, no matching advertisement has been found")

    // Reverse in order to get newest ads first
    const filteredIds = finalFilteredAds?.reverse().map((ad) => {
      return ad._id
    })

    setFilteredIds(filteredIds || [])
  }

  // Variable for displaying either an error or the content if the fetch was sucessful
  let content

  if (isLoading) content = <Text style={{ margin: 10 }}>Loading...</Text>

  if (isError) {
    content = <Text style={{ margin: 10 }}>{error?.data?.message}</Text>
  }

  if (isSuccess) {

    // Reverse initial ads (without filters) in order to display the newest ones first
    const reversedNewIds = Object.values(advertisements?.entities)?.reverse().map((ad) => {
      return ad._id
    })

    const itemsPerPage = 20

    const maxPage = Math.ceil(filteredIds?.length ? filteredIds?.length / itemsPerPage : reversedNewIds?.length / itemsPerPage)

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    // What to display on the current page
    const advertisementsToDisplay = filteredIds?.length
      ? filteredIds.slice(startIndex, endIndex)
      : reversedNewIds.slice(startIndex, endIndex)

    const goToPageButtonDisabled = newPage < 1 || newPage > maxPage || parseInt(newPage) === currentPage

    // Advertisement component for each advertisement
    const tableContent = advertisementsToDisplay.map(advertisementId => (
      <Advertisement key={advertisementId} advertisementId={advertisementId} />
    ))

    content = (
      <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
      
        <View style={styles.mainView}>
          {userId?.length 
            ? <View>
              <TouchableOpacity
                style={styles.blackButtonWide}
                onPress={() => navigation.navigate('NewAdvertisementForm')}
              >
                <Text style={styles.buttonText}>Post an Advertisement</Text>
              </TouchableOpacity>
            </View> 
            : null
          }

          {!reversedNewIds?.length 
            ? <Text>There are currently no advertisements</Text>
            : <View>

                <TouchableOpacity
                  style={styles.blackButtonWide}
                  onPress={toggleFilterView}
                >
                  <Text style={styles.buttonText}>Toggle Search View</Text>
                </TouchableOpacity>

                <View style={filterViewVisible ? styles.filterViewVisible : styles.filterViewHidden}>

                  <Text style={styles.inputTitle}>Title</Text>

                  <TextInput 
                    style={styles.textInputWide}
                    value={title}
                    onChangeText={(text) => setTitle(text)}
                  />
                  
                  <Text style={styles.inputTitle}>Type</Text>

                  <View style={styles.selectInputWide}>
                    <RNPickerSelect
                      placeholder={{ label: '--', value: '' }} 
                      items={AdvertisementTypes}
                      value={type}
                      style={styles.pickerSelectStyles}
                      onValueChange={value => handleTypeChanged(value)}
                    />
                  </View>

                  <Text style={styles.inputTitle}>Breed Required</Text>

                  <View style={styles.selectInputWide}>
                    <RNPickerSelect 
                      placeholder={{ label: '--', value: '' }}
                      items={breedOptions}
                      disabled={type !== 'Require Female Dog' && type !== 'Require Male Dog'}
                      value={breed}
                      style={styles.pickerSelectStyles}
                      onValueChange={(value) => setBreed(value)}
                    />
                  </View>
                  
                  <Text style={styles.inputTitle}>Country</Text>

                  <View style={styles.selectInputWide}>
                    <RNPickerSelect 
                      value={country}
                      items={Countries}
                      placeholder={{ label: '--', value: '' }}
                      style={styles.pickerSelectStyles}
                      onValueChange={handleCountryChanged}
                    />
                  </View>
                  
                  <Text style={styles.inputTitle}>Region</Text>

                  <View style={styles.selectInputWide}>
                    <RNPickerSelect 
                      disabled={!bigCountries.includes(country)}
                      style={styles.pickerSelectStyles}
                      value={region}
                      placeholder={{ label: '--', value: '' }}
                      items={bigCountries?.includes(country)
                        ? Regions[country]
                        : [{ label: '--', value: '' }]
                      }
                      onValueChange={(value) => setRegion(value)}
                    />
                  </View>

                  <Text style={styles.inputTitle}>Currency</Text>

                  <View style={styles.selectInputWide}>
                    <RNPickerSelect 
                      value={currency}
                      style={styles.pickerSelectStyles}
                      placeholder={{ label: '--', value: '' }}
                      items={Currencies}
                      onValueChange={value => setCurrency(value)}
                      disabled={currencyDisabled}
                    />
                  </View>

                  <Text style={styles.inputTitle}>Lowest Price</Text>

                  <TextInput 
                    value={lowestPrice}
                    style={styles.textInputWide}
                    keyboardType="numeric"
                    onChangeText={(value) => {
                      if (PRICE_REGEX.test(value) || value === '') {
                        setLowestPrice(value)}
                      }
                    }
                    editable={currency?.length > 0}
                  />

                  <Text style={styles.inputTitle}>Highest Price</Text>

                  <TextInput 
                    value={highestPrice}
                    style={styles.textInputWide}
                    keyboardType="numeric"
                    onChangeText={(value) => {
                      if (PRICE_REGEX.test(value) || value === '') {
                        setHighestPrice(value)}
                      }
                    }
                    editable={currency?.length > 0}
                  />

                  <Text style={styles.inputTitle}>Sort by Price</Text>

                  <View style={styles.selectInputWide}>
                    <RNPickerSelect 
                      value={sort}
                      style={styles.pickerSelectStyles}
                      placeholder={{ label: '--', value: '' }}
                      items={
                        [{ label: 'Ascending', value: 'ascending' },
                        { label: 'Descending', value: 'descending' }]
                      }
                      onValueChange={(value) => setSort(value)}
                      disabled={!currency?.length}
                    />
                  </View>

                  <TouchableOpacity 
                    style={styles.blackButtonWide}
                    onPress={handleSearchClicked}
                  >
                    <Text style={styles.buttonText}>Search</Text>
                  </TouchableOpacity>

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
                    onPress={() => {
                      setCurrentPage(currentPage + 1)
                    }}
                  >
                    <Text style={styles.buttonText}>{'->'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {tableContent}

              <View 
                style={maxPage === 1 
                  ? {display: "none"}
                  : [styles.paginationInputView, {marginBottom: 5}]
                }
              >

                <TextInput 
                  style={[styles.textInput, {height: 41, marginRight: 10}]}
                  onChangeText={(value) => setNewPage(value)} 
                  value={newPage} 
                  placeholder="Page #"
                />

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
          }
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

export default AdvertisementsList
