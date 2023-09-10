import { useState, useEffect } from "react"
import { useAddNewLitterMutation } from "./littersApiSlice"
import { useNavigate } from "react-router-dom"
import { useGetDogsQuery } from "../dogs/dogsApiSlice"
import { Countries } from "../../config/countries"
import { bigCountries } from "../../config/bigCountries"
import { Regions } from "../../config/regions"
import useAuth from "../../hooks/useAuth"
import Calendar from "react-calendar"
import '../../styles/customCalendar.css'

const NewLitterForm = () => {

    const { userId } = useAuth()

    const PUPPIES_REGEX = /^[1-9]\d{0,1}$/

    const navigate = useNavigate()

    const [mother, setMother] = useState('')
    const [born, setBorn] = useState('')
    const [breed, setBreed] = useState('')
    const [children, setChildren] = useState('')
    const [validMother, setValidMother] = useState(false)
    const [breedOptions, setBreedOptions] = useState(null)
    const [country, setCountry] = useState('Argentina')
    const [region, setRegion] = useState('')

    const day = 1000 * 60 * 60 * 24

    // POST function for adding a new litter
    const [addNewLitter, {
        isLoading: isLitterLoading,
        isSuccess: isLitterSuccess,
        isError: isLitterError,
        error: litterError
    }] = useAddNewLitterMutation()

    // Clear the inputs if the litter has been successfully posted
    useEffect(() => {
        if (isLitterSuccess) {
            setBorn('')
            setMother('')
            setChildren('')
            setCountry('Argentina')
            setRegion('')
        }
    }, [isLitterSuccess, navigate])

    useEffect(() => {
        if (mother?.length) {
            setValidMother(true)
        } else {
            setValidMother(false)
        }
    }, [mother])

    const handleBornChanged = date => setBorn(date)
    const handleMotherChanged = e => {

        setBreed('')
        setBorn('')

        const { ids, entities } = dogs

        // Filter the mother's ID
        const motherId = ids.find(dogId => entities[dogId].id === e.target.value)

        // And get it's .values
        const mother = entities[motherId]

        if (mother?.breed === 'Mixed breed') {
            setBreedOptions(<option key='Mixed breed' value='Mixed breed'>Mixed breed</option>)
        } else {
            setBreedOptions(<>
                <option key='Mixed breed' value='Mixed breed'>Mixed breed</option>
                <option key={mother?.breed} value={mother?.breed}>{mother?.breed}</option>
            </>)
        }
        
        setMother(e.target.value)
    }

    const handleCountryChanged = (e) => {
        // New country doesn't have the regions of the old one, so reset the region first
        setRegion('')
        setCountry(e.target.value)
      }

    const handleSaveLitterClicked = async (e) => {
        e.preventDefault()
        if (canSave) {
            // Format the date
            let finalBorn = born !== '' ? new Date(born.getTime()).toDateString() : ''
            // POST the litter
            await addNewLitter({ mother, born: finalBorn, children, breed, country, region })
            navigate('/litters')
        }

        if (isLitterError) {
            console.log(litterError)
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
        dogsContent = <p>Loading...</p>
    }
    
    if (isError) {
        dogsContent = <p className="errmsg">{error?.data?.message}</p>
    }
    
    if (isSuccess) {

        const { ids, entities } = dogs

        // Filter all the female dog IDs who are administrated by the logged in user
        const filteredIds = ids.filter(dogId => entities[dogId].user === userId && entities[dogId].female === true 
            && new Date(entities[dogId].birth).getTime() < new Date().getTime() - 60 * day)
        // And get their .values
        const filteredDogs = filteredIds.map(dogId => entities[dogId])

        if (!filteredIds.length) return <p>You do not have female dogs who are old enough to have litters</p>

        // Create an <option>s list for each female dog administrated by the logged in user
        if (filteredDogs?.length) {
            ownedDogs = filteredDogs.map(dog => (
                <option
                    key={dog.id}
                    value={dog.id}
                >
                    {dog.name}
                </option>
            ))
        }
    }

    // Boolean to control the style and 'disabled' value of the SAVE button
    const canSave = validMother && born !== '' && !isLoading && children > 0 && children < 31 && breed !== '' && new Date(born) >= new Date(dogs?.entities[mother]?.birth)

    if (!dogs) return null

    const saveColor = !canSave ? {backgroundColor: "grey", cursor: "default"} : null

    const content = (
        <>
            {dogsContent}

            <form onSubmit={handleSaveLitterClicked}>
                <p className="register-litter-page-title">Register Litter</p>
                <br />
                
                <label htmlFor="mother">
                    <b>Litter's Mother</b>
                </label>
                <br />
                <select 
                    type="text" 
                    id="mother"
                    name="mother"
                    value={mother}
                    onChange={handleMotherChanged}
                >
                    <option
                        id="none"
                        name="none"
                        value=""
                        disabled={true}
                    >
                        Select dog
                    </option>
                    {ownedDogs}
                </select>
                <br />

                <label className="top-spacer" htmlFor="breed">
                    <b>Puppies' Breed</b>
                </label>
                <br />
                <select 
                    type="text" 
                    id="breed"
                    name="breed"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                >
                    <option value="" disabled={true}>Breed</option>
                    {breedOptions}
                </select>

                <br />

                <label className="top-spacer" htmlFor="puppies">
                    <b>Amount of Puppies Born</b>
                </label>
                <br />
                <input 
                    className="three-hundred"
                    value={children}
                    onChange={(e) => {
                        if (PUPPIES_REGEX.test(e.target.value) || e.target.value === '') {
                            setChildren(e.target.value)
                        }
                    }}
                    type="text" 
                    name="puppies"
                    id="puppies"
                    maxLength="2"
                />

                <br />

                <label className="top-spacer" htmlFor="country">
                    <b>Country</b>
                </label>
                <br />
                <select 
                    name="country" 
                    id="country"
                    value={country}
                    onChange={handleCountryChanged}
                >
                    {Countries}
                </select>
                <br />

                <label className="top-spacer" htmlFor="region">
                    <b>Region</b>
                </label>
                <br />
                <select 
                    disabled={!bigCountries?.includes(country)}
                    name="region" 
                    id="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                >
                    <option value="">--</option>
                    {bigCountries?.includes(country) ? Regions[country] : null}
                </select>
                <br />

                <label className="top-spacer" htmlFor="born">
                    <b>Born</b>
                </label>
                <br />
                <Calendar name="born" minDate={mother?.length ? new Date((new Date(dogs?.entities[mother]?.birth)).getTime() + 59 * day) : null} maxDate={new Date()} onChange={handleBornChanged} value={born} />
                <br />
                
            </form>
            <button
                onClick={handleSaveLitterClicked}
                className="black-button three-hundred"
                style={saveColor}
                title="Save"
                disabled={!canSave}
            >
                Save
            </button>
        </>
    )

  return content
}

export default NewLitterForm
