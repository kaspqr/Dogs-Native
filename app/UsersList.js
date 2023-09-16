import { useGetUsersQuery } from "../components/users/usersApiSlice"
import User from "../components/users/User"
import { useState } from "react"
import { Countries } from "../assets/countries"
import { bigCountries } from "../assets/bigCountries"
import { Regions } from "../assets/regions"

import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { COLORS } from "../constants"

import RNPickerSelect from 'react-native-picker-select'

const UsersList = () => {

  const [username, setUsername] = useState('')
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const [filteredIds, setFilteredIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [newPage, setNewPage] = useState('')

  const [filterViewVisible, setFilterViewVisible] = useState(false)
  const toggleFilterView = () => setFilterViewVisible(!filterViewVisible)

  // GET all the users
  const {
    data: users,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetUsersQuery('usersList', {
    pollingInterval: 75000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true
  })

  const handleSearchClicked = () => {

    setCurrentPage(1)

    // Go through all the filters
    const filteredUsers = username?.length
      ? Object.values(users?.entities)?.filter((user) => {
        return user.username.includes(username)
      })
      : Object.values(users?.entities)

    const filteredRegion = region?.length
      ? filteredUsers?.filter((user) => {
          return user.region === region
        })
      : filteredUsers

    const filteredCountry = country?.length
      ? filteredRegion?.filter((user) => {
          return user.country === country
        })
      : filteredRegion

    if (!filteredCountry?.length) alert("Unfortunately, no matching user has been found")

    const filteredIds = filteredCountry?.reverse().map((user) => {
      return user._id
    })

    setFilteredIds(filteredIds || [])
    
  }

  if (isLoading) return <Text style={{ margin: 10 }}>Loading...</Text>

  if (isError) return <Text style={{ margin: 10 }}>{error?.data?.message}</Text>

  if (isSuccess) {

    // Newer users first
    const reversedNewIds = Object.values(users?.entities)?.reverse().map((user) => {
      return user._id
    })

    const itemsPerPage = 20

    const maxPage = Math.ceil(filteredIds?.length ? filteredIds?.length / itemsPerPage : reversedNewIds?.length / itemsPerPage)

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    // Users to display on current page
    const usersToDisplay = filteredIds?.length
      ? filteredIds.slice(startIndex, endIndex)
      : reversedNewIds.slice(startIndex, endIndex)

    const goToPageButtonDisabled = newPage < 1 || newPage > maxPage || parseInt(newPage) === currentPage

    // User component for each user
    const tableContent = usersToDisplay.map(userId => (
      <User key={userId} userId={userId} />
    ))

    if (!reversedNewIds?.length) return <Text>There are currently no active users</Text>

    return (
      <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>

        <View style={styles.mainView}>
          <TouchableOpacity
            style={styles.blackButtonWide}
            onPress={toggleFilterView}
          >
            <Text style={styles.buttonText}>Toggle Search View</Text>
          </TouchableOpacity>

          <View style={filterViewVisible ? styles.filterViewVisible : styles.filterViewHidden}>

              <Text style={styles.inputTitle}>Username</Text>

              <TextInput 
                style={styles.textInputWide}
                value={username}
                onChangeText={(value) => setUsername(value)}
              />

              <Text style={styles.inputTitle}>Country</Text>

              <View style={styles.selectInputWide}>
                <RNPickerSelect 
                  value={country}
                  items={Countries}
                  placeholder={{ label: '--', value: '' }} 
                  onValueChange={(value) => {
                    setRegion('')
                    setCountry(value)
                  }}
                />
              </View>
              
              <Text style={styles.inputTitle}>Region</Text>

              <View style={styles.selectInputWide}>
                <RNPickerSelect 
                  disabled={!bigCountries?.includes(country)}
                  placeholder={{ label: '--', value: '' }} 
                  items={bigCountries?.includes(country) ? Regions[country] : []}
                  value={region}
                  onValueChange={(value) => setRegion(value)}
                />
              </View>

            <TouchableOpacity 
              onPress={handleSearchClicked}
              style={styles.blackButtonWide}
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
      </ScrollView>
    )
  }
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
})

export default UsersList
