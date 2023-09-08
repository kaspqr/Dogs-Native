import { useGetDogsQuery } from "./dogsApiSlice"
import Dog from "./Dog"
import { Link } from "react-router-dom"
import useAuth from "../../hooks/useAuth"
import { Countries } from "../../config/countries"
import { bigCountries } from "../../config/bigCountries"
import { Regions } from "../../config/regions"
import { Breeds } from "../../config/breeds"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { useState, useEffect } from "react"
import Calendar from "react-calendar"
import '../../styles/customCalendar.css'

const DogsList = () => {

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
      <option key={breed} value={breed}>{breed}</option>
  ))

  // State for checking how wide is the user's screen
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  // Function for handling the resizing of screen
  const handleResize = () => {
    setWindowWidth(window.innerWidth)
  }

  // Always check if a window is being resized
  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

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

  const handleCountryChanged = (e) => {
    setRegion('')
    setCountry(e.target.value)
  }

  const handleChippedChanged = (e) => {
    // Clear chipnumber if dog is not chipped, as the input will be disabled
    if (e.target.value !== 'Yes') setChipnumber('')
    setChipped(e.target.value)
  }

  const handleGenderChanged = (e) => {
    // Clear heat if dog is not female, as the input will be disabled
    if (e.target.value !== 'female') setHeat('')
    setGender(e.target.value)
  }

  const handleToggleFilterView = () => setInputsVisible(!inputsVisible)

  const handleSearchClicked = () => {

    setCurrentPage(1)

    // Go through all filters
    const finalBornEarliest = bornEarliest !== '' ? new Date(bornEarliest) : ''

    const filteredDogsBornEarliest = finalBornEarliest !== ''
      ? Object.values(dogs?.entities)?.filter((dog) => {
        return new Date(dog.birth) >= finalBornEarliest
      })
      : Object.values(dogs?.entities)

    const finalBornLatest = bornLatest !== '' ? new Date(bornLatest) : ''

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

  if (isLoading) content = <p>Loading...</p>

  if (isError) {
    content = <p>{error?.data?.message}</p>
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
      return <>
        {userId?.length ? <><Link to={'/dogs/new'}><button title="Add a New Dog" className="black-button three-hundred">Add a New Dog</button></Link><br /><br /></> : null}
        <p>There are currently no dogs in the database</p>
      </>
    }

    content = (
      <>
        {userId?.length ? <><Link to={'/dogs/new'}><button title="Add a New Dog" className="black-button three-hundred">Add a New Dog</button></Link><br /><br /></> : null}

        <button
          title="Toggle Search View"
          className="black-button three-hundred"
          onClick={handleToggleFilterView}
        >
          Toggle Search View
        </button>

        <br />
        <br />

        <div style={{display: inputsVisible ? 'block' : 'none'}}>
          <form onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="dog-name-search-input"><b>Name</b></label>
            <br />
            <input 
              className="three-hundred"
              value={name}
              name="dog-name-search-input" 
              id="dog-name-search-input" 
              onChange={(e) => setName(e.target.value)}
            />
            <br />

            <label className="top-spacer" htmlFor="dogs-filter-breed-select"><b>Breed</b></label>
            <br />
            <select 
              onChange={(e) => setBreed(e.target.value)}
              value={breed}
              name="dogs-filter-breed-select" 
              id="dogs-filter-breed-select"
            >
              <option value="">--</option>
              {breedOptions}
            </select>

            <br />

            <label className="top-spacer" htmlFor="born-at-earliest-calendar-input"><b>Born at Earliest</b></label>
            <br />
            <Calendar name="born-at-earliest-calendar-input" maxDate={bornLatest || new Date()} onChange={handleBornEarliestChanged} value={bornEarliest} />
            <button 
              title="Clear Date for Born at Earliest"
              className="black-button"
              disabled={bornEarliest === ''}
              style={bornEarliest === '' ? {backgroundColor: "grey", cursor: "default"} : null}
              onClick={() => setBornEarliest('')}
            >
              Clear Date
            </button>

            <br />

            <label className="top-spacer" htmlFor="born-at-latest-calendar-input"><b>Born at Latest</b></label>
            <br />
            <Calendar name="born-at-latest-calendar-input" minDate={bornEarliest || null} maxDate={new Date()} onChange={handleBornLatestChanged} value={bornLatest} />
            <button 
              title="Clear Date for Born at Latest"
              className="black-button"
              disabled={bornLatest === ''}
              style={bornLatest === '' ? {backgroundColor: "grey", cursor: "default"} : null}
              onClick={() => setBornLatest('')}
            >
              Clear Date
            </button>

            <br />

            <label className="top-spacer" htmlFor="dog-country"><b>Country</b></label>
            <br />
            <select 
              value={country}
              name="dog-country" 
              id="dog-country"
              onChange={handleCountryChanged}
            >
              <option value="">--</option>
              {Countries}
            </select>
            <br />
            
            <label className="top-spacer" htmlFor="dog-region"><b>Region</b></label>
            <br />
            <select 
              disabled={!bigCountries?.includes(country)}
              value={region}
              name="dog-region" 
              id="dog-region"
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">--</option>
              {bigCountries?.includes(country)
                ? Regions[country]
                : null
              }
            </select>
            <br />

            <label className="top-spacer" htmlFor="passport"><b>Passport</b></label>
            <br />
            <select 
              value={passport} 
              onChange={(e) => setPassport(e.target.value)}
              name="passport" 
              id="passport"
            >
              <option value="">--</option>
              <option value="yes">Documented</option>
              <option value="no">Not Documented</option>
            </select>
            <br />

            <label className="top-spacer" htmlFor="fixed"><b>Fixed</b></label>
            <br />
            <select 
              value={fixed} 
              onChange={(e) => setFixed(e.target.value)}
              name="fixed" 
              id="fixed"
            >
              <option value="">--</option>
              <option value="yes">Fixed</option>
              <option value="no">Not Fixed</option>
            </select>
            <br />

            <label className="top-spacer" htmlFor="gender"><b>Good</b></label>
            <br />
            <select 
              value={gender} 
              onChange={handleGenderChanged}
              name="gender" 
              id="gender"
            >
              <option value="">--</option>
              <option value="female">Girl</option>
              <option value="male">Boy</option>
            </select>
            <br />

            <label className="top-spacer" htmlFor="heat"><b>Currently in Heat</b></label>
            <br />
            <select 
              disabled={gender !== 'female'}
              value={heat} 
              onChange={(e) => setHeat(e.target.value)}
              name="heat" 
              id="heat"
            >
              <option value="">--</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <br />

            <label className="top-spacer" htmlFor="chipped"><b>Chipped</b></label>
            <br />
            <select 
              value={chipped} 
              onChange={handleChippedChanged}
              name="chipped" 
              id="chipped"
            >
              <option value="">--</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <br />

            <label className="top-spacer" htmlFor="chipnumber"><b>Chipnumber</b></label>
            <br />
            <input 
              className="three-hundred"
              disabled={chipped !== 'yes'}
              value={chipnumber} 
              onChange={(e) => setChipnumber(e.target.value)}
              name="chipnumber" 
              id="chipnumber"
            />

            <br />
            <br />

            <button 
              title="Search"
              onClick={handleSearchClicked}
              className="black-button search-button three-hundred"
            >
              Search <FontAwesomeIcon color="rgb(235, 155, 52)" icon={faMagnifyingGlass} />
            </button>
          </form>
          <br />
        </div>

        <p>
          <button 
            title="Go to Previous Page"
            style={currentPage === 1 ? {display: "none"} : null}
            disabled={currentPage === 1}
            className="pagination-button"
            onClick={() => {
              setCurrentPage(currentPage - 1)
            }}
          >
            <FontAwesomeIcon color="rgb(235, 155, 52)" icon={faArrowLeft} />
          </button>

          {` Page ${currentPage} of ${maxPage} `}

          <button 
            title="Go to Next Page"
            className="pagination-button"
            style={currentPage === maxPage ? {display: "none"} : null}
            disabled={currentPage === maxPage}
            onClick={() => {
              setCurrentPage(currentPage + 1)
            }}
          >
            <FontAwesomeIcon color="rgb(235, 155, 52)" icon={faArrowRight} />
          </button>

          {windowWidth > 600 || maxPage === 1 ? null : <><br /><br /></>}

          <span 
            className="new-page-input-span"
            style={maxPage === 1 
              ? {display: "none"}
              : windowWidth > 600 
                ? null 
                : {float: "none"}
            }
          >
            <label className="off-screen" htmlFor="page-number">Page Number</label>
            <input 
              onChange={(e) => setNewPage(e.target.value)} 
              value={newPage} 
              type="number" 
              name="page-number"
              className="new-page-input"
              placeholder="Page no."
            />
            <button
              title="Go to the Specified Page"
              style={goToPageButtonDisabled ? {backgroundColor: "grey", cursor: "default"} : null}
              disabled={goToPageButtonDisabled}
              onClick={() => {
                if (newPage >= 1 && newPage <= maxPage) {
                  setCurrentPage(parseInt(newPage))
                }
              }}
              className="black-button"
            >
              Go to Page
            </button>
          </span>

        </p>

        <br />
        
        {tableContent}

        <br />

        <p>
          <button 
            title="Go to Previous Page"
            style={currentPage === 1 ? {display: "none"} : null}
            disabled={currentPage === 1}
            className="pagination-button"
            onClick={() => {
              setCurrentPage(currentPage - 1)
            }}
          >
            <FontAwesomeIcon color="rgb(235, 155, 52)" icon={faArrowLeft} />
          </button>

          {` Page ${currentPage} of ${maxPage} `}

          <button 
            title="Go to Next Page"
            className="pagination-button"
            style={currentPage === maxPage ? {display: "none"} : null}
            disabled={currentPage === maxPage}
            onClick={() => {
              setCurrentPage(currentPage + 1)
            }}
          >
            <FontAwesomeIcon color="rgb(235, 155, 52)" icon={faArrowRight} />
          </button>

          {windowWidth > 600 || maxPage === 1 ? null : <><br /><br /></>}

          <span 
            className="new-page-input-span"
            style={maxPage === 1 
              ? {display: "none"}
              : windowWidth > 600 
                ? null 
                : {float: "none"}
            }
          >
            <label className="off-screen" htmlFor="another-page-number">Page Number</label>
            <input 
              onChange={(e) => setNewPage(e.target.value)} 
              value={newPage} 
              type="number" 
              name="another-page-number"
              className="new-page-input"
              placeholder="Page no."
            />
            <button
              title="Go to the Specified Page"
              style={goToPageButtonDisabled ? {backgroundColor: "grey", cursor: "default"} : null}
              disabled={goToPageButtonDisabled}
              onClick={() => {
                if (newPage >= 1 && newPage <= maxPage) {
                  setCurrentPage(parseInt(newPage))
                }
              }}
              className="black-button"
            >
              Go to Page
            </button>
          </span>
        </p>
      </>
    )
  }

  return content
}

export default DogsList
