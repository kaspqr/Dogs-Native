import { useGetAdvertisementsQuery } from "./advertisementsApiSlice"
import Advertisement from "./Advertisement"
import useAuth from "../../hooks/useAuth"
import { Link } from "react-router-dom"
import { AdvertisementTypes } from "../../assets/advertisementTypes"
import { Countries } from "../../assets/countries"
import { bigCountries } from "../../assets/bigCountries"
import { Regions } from "../../assets/regions"
import { Currencies } from "../../assets/currencies"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { useState, useEffect } from "react"
import { Breeds } from "../../assets/breeds"

import { View, Text, Image } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import styles from "../header/screenheader.style"

import RNPickerSelect from 'react-native-picker-select'

const AdvertisementsList = () => {

  const { userId } = useAuth()

  const PRICE_REGEX = /^[1-9]\d{0,11}$/

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

  const breeds = [ ...Object.values(Breeds) ]
  const breedOptions = breeds.map(breed => (
      <option key={breed} value={breed}>{breed}</option>
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
  
  const handleCountryChanged = (e) => {
    // New country doesn't have the regions of the old one, so reset the region first
    setRegion('')
    setCountry(e.target.value)
  }

  const handleCurrencyChanged = (e) => {
    if (e.target.value === '') { // Cannot have a price without currency
      setLowestPrice('')
      setHighestPrice('')
      setSort('')
    }
    setCurrency(e.target.value)
  }

  const handleTypeChanged = (e) => {
    if (e.target.value === '' || e.target.value === 'Found' || e.target.value === 'Lost') {
      // Cannot have a currency nor price with above types
      setCurrency('')
      setLowestPrice('')
      setHighestPrice('')
      setSort('')
    }

    if (e.target.value !== 'Require Female Dog' && e.target.value !== 'Require Male Dog') {
      setBreed('')
    }

    setType(e.target.value)
  }

  const handleToggleFilterView = () => {
    const filterDiv = document.getElementById('ad-filter-div')
    if (filterDiv?.style?.display === 'none') {
      filterDiv.style.display = 'block'
    } else {
      filterDiv.style.display = 'none'
    }
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

  if (isLoading) content = <Text>Loading...</Text>

  if (isError) {
    content = <Text>{error?.data?.message}</Text>
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
      <View>
        {userId?.length 
          ? <View><TouchableOpacity onPress={() => {}}>Post an Advertisement</TouchableOpacity></View> 
          : null
        }

        {!reversedNewIds?.length 
          ? <Text>There are currently no advertisements</Text>
          : <View>

              <TouchableOpacity
                onPress={handleToggleFilterView}
              >
                Toggle Search View
              </TouchableOpacity>

              <View style={{display: "none"}}>

                <Text>Title</Text>

                <TextInput 
                  value={title}
                  onChangeText={(text) => setTitle(text)}
                />
                
                <Text>Type</Text>

                <RNPickerSelect
                  placeholder={{ label: '--', value: '' }} 
                  items={AdvertisementTypes}
                  value={type}
                  onValueChange={value => handleTypeChanged(value)}
                  style={{
                    inputIOS: {
                      borderWidth: 1,
                      borderColor: 'gray',
                      padding: 10,
                    },
                    inputAndroid: {
                      borderWidth: 1,
                      borderColor: 'gray',
                      padding: 10,
                    },
                  }}
                />

                <Text>Breed Required</Text>

                <RNPickerSelect 
                  placeholder={{ label: '--', value: '' }}
                  items={breedOptions}
                  disabled={type !== 'Require Female Dog' && type !== 'Require Male Dog'}
                  value={breed}
                  onValueChange={(value) => setBreed(value)}
                />
                
                <Text>Country</Text>

                <RNPickerSelect 
                  value={country}
                  items={Countries}
                  
                  onValueChange={handleCountryChanged}
                />
                
                <Text>Region</Text>

                <RNPickerSelect 
                  disabled={!bigCountries.includes(country)}
                  value={region}
                  placeholder={{ label: '--', value: '' }}
                  items={bigCountries?.includes(country)
                    ? Regions[country]
                    : null
                  }
                  onValueChange={(value) => setRegion(value)}
                />

                <Text>Currency</Text>

                <RNPickerSelect 
                  value={currency}
                  placeholder={{ label: '--', value: '' }}
                  items={Currencies}
                  onValueChange={value => setCurrency(value)}
                  disabled={currencyDisabled}
                />

                <Text>Lowest Price</Text>

                <TextInput 
                  value={lowestPrice}
                  keyboardType="numeric"
                  onChangeText={(value) => {
                    if (PRICE_REGEX.test(value) || value === '') {
                      setLowestPrice(value)}
                    }
                  }
                  disabled={!currency?.length}
                />

                <Text>Highest Price</Text>

                <TextInput 
                  value={highestPrice}
                  keyboardType="numeric"
                  onChangeText={(value) => {
                    if (PRICE_REGEX.test(value) || value === '') {
                      setHighestPrice(value)}
                    }
                  }
                  disabled={!currency?.length}
                />

                <Text>Sort by Price</Text>

                <RNPickerSelect 
                  value={sort}
                  placeholder={{ label: '--', value: '' }}
                  items={
                    [{ label: 'Ascending', value: 'ascending' },
                    { label: 'Descending', value: 'descending' }]
                  }
                  onValueChange={(value) => setSort(value)}
                  disabled={!currency?.length}
                />

                <TouchableOpacity 
                  onPress={handleSearchClicked}
                >
                  Search
                </TouchableOpacity>

              </View>


            <View>
              <TouchableOpacity 
                style={currentPage === 1 ? {display: "none"} : null}
                disabled={currentPage === 1}
                onPress={() => {
                  setCurrentPage(currentPage - 1)
                }}
              >
                <FontAwesomeIcon color="rgb(235, 155, 52)" icon={faArrowLeft} />
              </TouchableOpacity>

              <Text>{' '}Page {currentPage} of {maxPage}{' '}</Text>

              <TouchableOpacity 
                style={currentPage === maxPage ? {display: "none"} : null}
                disabled={currentPage === maxPage}
                onPress={() => {
                  setCurrentPage(currentPage + 1)
                }}
              >
                <FontAwesomeIcon color="rgb(235, 155, 52)" icon={faArrowRight} />
              </TouchableOpacity>

              <View 
                style={maxPage === 1 
                  ? {display: "none"}
                  : null
                }
              >

                <TextInput 
                  onChangeText={(value) => setNewPage(value)} 
                  value={newPage} 
                />

                <TouchableOpacity
                  style={goToPageButtonDisabled ? {backgroundColor: "grey"} : null}
                  disabled={goToPageButtonDisabled}
                  onPress={() => {
                    if (newPage >= 1 && newPage <= maxPage) {
                      setCurrentPage(parseInt(newPage))
                    }
                  }}
                >
                  Go to Page
                </TouchableOpacity>
              </View>

            </View>

            {tableContent}

            <View>
              <TouchableOpacity 
                style={currentPage === 1 ? {display: "none"} : null}
                disabled={currentPage === 1}
                onPress={() => {
                  setCurrentPage(currentPage - 1)
                }}
              >
                <FontAwesomeIcon color="rgb(235, 155, 52)" icon={faArrowLeft} />
              </TouchableOpacity>

              <Text>{' '}Page {currentPage} of {maxPage}{' '}</Text>

              <TouchableOpacity 
                style={currentPage === maxPage ? {display: "none"} : null}
                disabled={currentPage === maxPage}
                onPRess={() => {
                  setCurrentPage(currentPage + 1)
                }}
              >
                <FontAwesomeIcon color="rgb(235, 155, 52)" icon={faArrowRight} />
              </TouchableOpacity>

              <View 
                className="new-page-input-span"
                style={maxPage === 1 
                  ? {display: "none"}
                  : null
                }
              >

                <TextInput 
                  onChangeText={(value) => setNewPage(value)} 
                  value={newPage} 
                />

                <TouchableOpacity
                  style={goToPageButtonDisabled ? {backgroundColor: "grey", cursor: "default"} : null}
                  disabled={goToPageButtonDisabled}
                  onPress={() => {
                    if (newPage >= 1 && newPage <= maxPage) {
                      setCurrentPage(parseInt(newPage))
                    }
                  }}
                >
                  Go to Page
                </TouchableOpacity>
              </View>

            </View>
          </View>
        }
      </View>
    )
  }

  return content
}

export default AdvertisementsList
