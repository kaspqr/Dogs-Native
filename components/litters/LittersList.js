import { useGetLittersQuery } from "./littersApiSlice"
import Litter from "./Litter"
import useAuth from "../../hooks/useAuth"
import { Link } from "react-router-dom"
import { Countries } from "../../config/countries"
import { bigCountries } from "../../config/bigCountries"
import { Regions } from "../../config/regions"
import { Breeds } from "../../config/breeds"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { useState, useEffect } from "react"
import Calendar from "react-calendar"
import '../../styles/customCalendar.css'

const LittersList = () => {

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

  const handleSearchClicked = () => {
    if (lowestPuppies?.length && highestPuppies?.length && highestPuppies < lowestPuppies) {
      return alert("Highest amount of puppies cannot be lower than lowest amount of puppies")
    }

    setCurrentPage(1)

    const finalBornEarliest = bornEarliest !== '' ? new Date(bornEarliest) : ''

    // Go through all the filters
    const filteredLittersBornEarliest = finalBornEarliest !== ''
      ? Object.values(litters?.entities)?.filter((litter) => {
        return new Date(litter.born) >= finalBornEarliest
      })
      : Object.values(litters?.entities)

    const finalBornLatest = bornLatest !== '' ? new Date(bornLatest) : ''

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

  if (isLoading) content = <p>Loading...</p>
  if (isError) content = <p>{error?.data?.message}</p>

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
      return <>
        {userId?.length ? <><Link to={'/litters/new'}><button title="Add a New Litter" className="black-button three-hundred">Add a New Litter</button></Link><br /><br /></> : null}
        <p>There are currently no litters in the database</p>
      </>
    }

    content = (
      <>
        {userId?.length ? <><Link to={'/litters/new'}><button title="Add a New Litter" className="black-button three-hundred">Add a New Litter</button></Link><br /><br /></> : null}
        
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
            <label htmlFor="born-at-earliest"><b>Born at Earliest</b></label>
            <br />
            <Calendar name="born-at-earliest" maxDate={bornLatest || new Date()} onChange={handleBornEarliestChanged} value={bornEarliest} />
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

            <label className="top-spacer" htmlFor="born-at-latest"><b>Born at Latest</b></label>
            <br />
            <Calendar name="born-at-latest" minDate={bornEarliest || null} maxDate={new Date()} onChange={handleBornLatestChanged} value={bornLatest} />
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

            <label className="top-spacer" htmlFor="litter-country"><b>Country</b></label>
            <br />
            <select 
              value={country}
              name="litter-country" 
              id="litter-country"
              onChange={handleCountryChanged}
            >
              <option value="">--</option>
              {Countries}
            </select>
            <br />
            
            <label className="top-spacer" htmlFor="litter-region"><b>Region</b></label>
            <br />
            <select 
              disabled={!bigCountries.includes(country)}
              value={region}
              name="litter-region" 
              id="litter-region"
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">--</option>
              {bigCountries?.includes(country)
                ? Regions[country]
                : null
              }
            </select>
            <br />

            <label className="top-spacer" htmlFor="litter-lowest-puppies-search-input"><b>Lowest Amount of Puppies</b></label>
            <br />
            <input 
              className="three-hundred"
              type="text"
              value={lowestPuppies}
              name="litter-lowest-puppies-search-input" 
              id="litter-lowest-puppies-search-input" 
              onChange={(e) => {
                if (PUPPIES_AMOUNT_REGEX.test(e.target.value) || e.target.value === '') {
                  setLowestPuppies(e.target.value)}
                }
              }
            />

            <br />

            <label className="top-spacer" htmlFor="litter-highest-puppies-search-input"><b>Highest Amount of Puppies</b></label>
            <br />
            <input 
              className="three-hundred"
              type="text"
              value={highestPuppies}
              name="litter-highest-puppies-search-input" 
              id="litter-highest-puppies-search-input" 
              onChange={(e) => {
                if (PUPPIES_AMOUNT_REGEX.test(e.target.value) || e.target.value === '') {
                  setHighestPuppies(e.target.value)}
                }
              }
            />

            <br />
            <br />

            <button 
              title="Search"
              onClick={handleSearchClicked}
              className="three-hundred black-button search-button"
              disabled={lowestPuppies?.length && highestPuppies?.length && parseInt(lowestPuppies) > parseInt(highestPuppies)}
              style={lowestPuppies?.length && highestPuppies?.length 
                && parseInt(lowestPuppies) > parseInt(highestPuppies) ? {backgroundColor: "grey", cursor: "default"} : null
              }
            >
              Search <FontAwesomeIcon color="rgb(235, 155, 52)" icon={faMagnifyingGlass} />
            </button>
            <br />
            <br />
          </form>
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
            <label htmlFor="page-number" className="off-screen">Page Number</label>
            <input 
              name="page-number"
              onChange={(e) => setNewPage(e.target.value)} 
              value={newPage} 
              type="number" 
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
            <label htmlFor="another-page-number" className="off-screen">Page Number</label>
            <input 
              name="another-page-number"
              onChange={(e) => setNewPage(e.target.value)} 
              value={newPage} 
              type="number" 
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

export default LittersList
