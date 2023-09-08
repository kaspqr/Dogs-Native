import { useState, useEffect } from "react"
import { useAddNewDogMutation } from "./dogsApiSlice"
import { useNavigate } from "react-router-dom"
import { Breeds } from "../../config/breeds"
import useAuth from "../../hooks/useAuth"
import Calendar from "react-calendar"
import '../../styles/customCalendar.css'
import { Countries } from "../../config/countries"
import { bigCountries } from "../../config/bigCountries"
import { Regions } from "../../config/regions"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons"

const NewDogForm = () => {

    const { userId } = useAuth()

    const NAME_REGEX = /^(?!^\s*$)(?:[a-zA-Z']+(\s|$))+$/
    const CHIPNUMBER_REGEX = /^(?!^\s)(?!.*\s{2,})[\s\S]*$/

    const navigate = useNavigate()

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

    const breeds = [ ...Object.values(Breeds) ]
    const breedOptions = breeds.map(breed => (
        <option key={breed} value={breed}>{breed}</option>
    ))

    const handleBreedChanged = e => setBreed(e.target.value)
    const handleInfoChanged = e => setInfo(e.target.value)
    const handleBirthChanged = date => setBirth(date)
    const handleDeathChanged = date => setDeath(date)

    const handleHeatChanged = () => setHeat(prev => !prev)
    const handleSterilizedChanged = () => setSterilized(prev => !prev)
    const handlePassportChanged = () => setPassport(prev => !prev)

    const handleMicrochippedChanged = () => {
        setChipnumber('')
        setMicrochipped(prev => !prev)
    }

    const handleFemaleChanged = e => {
        if (e.target.value === 'male') setHeat(false)
        setFemale(e.target.value === "female" ? true : false)
    }

    // Clear the region each time the country is changed in order to avoid having a region from the wrong country
    const handleCountryChanged = (e) => {
        setRegion('')
        setCountry(e.target.value)
    }

    // POST function to add a new dog
    const [addNewDog, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useAddNewDogMutation()

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
            navigate('/dogs')
        }
    }, [isSuccess, navigate])

    // Boolean to control the style and 'disabled' value of the SAVE button
    const canSave = NAME_REGEX.test(name) && !isLoading && breed.length && typeof birth === 'object' && birth !== '' 
        && ((typeof death === 'object' && death.getTime() >= birth.getTime()) || death === '')

    const handleSaveDogClicked = async (e) => {
        e.preventDefault()
        if (canSave) {
            // Format the date
            let finalBirth = birth !== '' ? new Date(birth.getTime()).toDateString() : ''
            let finalDeath = death !== '' ? new Date(death.getTime()).toDateString() : ''
            // POST the dog
            await addNewDog({ name, country, region, breed, heat, sterilized, passport, 
                microchipped, chipnumber, birth: finalBirth, death: finalDeath, info, female, "user": userId })
        }
    }

    const saveColor = !canSave ? {backgroundColor: "grey", cursor: "default"} : null

    const content = (
        <>
            {isError ? <p>{error?.data?.message}</p> : null}

            <form onSubmit={handleSaveDogClicked}>
                <div>
                    <p className="register-dog-title">Register Dog</p>
                </div>
                <br />
                <p>Fields marked with <b>*</b> are required</p>
                <br />
                
                <label htmlFor="dogname">
                    <b>Dog's Name (Max. 30 Characters)*</b>
                </label>
                <br />
                <input 
                    className="three-hundred"
                    type="text" 
                    maxLength="30"
                    id="dogname"
                    name="dogname"
                    autoComplete="off"
                    required
                    value={name}
                    onChange={(e) => {
                        if (NAME_REGEX.test(e.target.value) || e.target.value === '') {
                            setName(e.target.value)}
                        }
                    }
                />
                <br />

                <label className="top-spacer" htmlFor="breed">
                    <b>Breed*</b>
                </label>
                <br />
                <select 
                    type="text" 
                    id="breed"
                    name="breed"
                    value={breed}
                    onChange={handleBreedChanged}
                >
                    {breedOptions}
                </select>
                <br />

                <label className="top-spacer" htmlFor="isFemale">
                    <b>Good*</b>
                </label>
                <br />
                <select 
                    onChange={handleFemaleChanged}
                >
                  <option value="female">Girl</option>
                  <option value="male">Boy</option>
                </select>
                <br />

                <label className="top-spacer" htmlFor="country">
                    <b>Country*</b>
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
                    <option value="none ">--</option>
                    {bigCountries?.includes(country) ? Regions[country] : null}
                </select>
                <br />

                <label className="top-spacer" htmlFor="passport">
                    <b>Passport </b>
                    <FontAwesomeIcon name="passport" onClick={handlePassportChanged} size="xl" icon={passport ? faToggleOn : faToggleOff} color={passport ? 'rgb(23, 152, 207)' : 'grey'} />
                </label>
                <br />

                <label className="top-spacer" htmlFor="heat">
                    <b>Heat </b>
                    <FontAwesomeIcon name="heat" onClick={female ? handleHeatChanged : null} size="xl" icon={heat ? faToggleOn : faToggleOff} color={heat ? 'rgb(23, 152, 207)' : 'grey'} />
                </label>
                <br />

                <label className="top-spacer" htmlFor="sterilized">
                    <b>Fixed </b>
                    <FontAwesomeIcon name="sterilized" onClick={handleSterilizedChanged} size="xl" icon={sterilized ? faToggleOn : faToggleOff} color={sterilized ? 'rgb(23, 152, 207)' : 'grey'} />
                </label>
                <br />

                <label className="top-spacer" htmlFor="microchipped">
                    <b>Microchipped </b>
                    <FontAwesomeIcon name="microchipped" onClick={handleMicrochippedChanged} size="xl" icon={microchipped ? faToggleOn : faToggleOff} color={microchipped ? 'rgb(23, 152, 207)' : 'grey'} />
                </label>
                <br />

                <label className="top-spacer" htmlFor="chipnumber">
                    <b>Chipnumber</b>
                </label>
                <br />
                <input 
                    className="three-hundred"
                    disabled={microchipped === false}
                    type="text" 
                    id="chipnumber"
                    name="chipnumber"
                    maxLength="50"
                    value={chipnumber}
                    onChange={(e) => {
                        if (CHIPNUMBER_REGEX.test(e.target.value) || e.target.value === '') {
                            setChipnumber(e.target.value)}
                        }
                    }
                />
                <br />

                <label className="top-spacer" htmlFor="birth">
                    <b>Date of Birth*</b>
                </label>
                <br />
                <Calendar name="birth" maxDate={death || new Date()} onChange={handleBirthChanged} value={birth} />

                <label className="top-spacer" htmlFor="death">
                    <b>Date of Death (If Not Alive)</b>
                </label>
                <Calendar name="death" minDate={birth || null} maxDate={new Date()} onChange={handleDeathChanged} value={death} />
                <button 
                    title="Clear Date"
                    className="black-button"
                    style={death === '' ? {backgroundColor: "grey", cursor: "default"} : null}
                    disabled={death === ''}
                    onClick={() => setDeath('')}
                >
                    Clear Date
                </button>
                <br />

                <label className="top-spacer" htmlFor="info">
                    <b>Additional Info</b>
                </label>
                <br />
                <textarea 
                    className="three-hundred"
                    cols="30"
                    rows="10"
                    maxLength="500"
                    id="info"
                    name="info"
                    value={info}
                    onChange={handleInfoChanged}
                />
                <br />
                <br />

                <div>
                    <button
                        className="black-button three-hundred"
                        style={saveColor}
                        title="Save"
                        disabled={!canSave}
                    >
                        Save
                    </button>
                </div>
            </form>
        </>
    )

  return content
}

export default NewDogForm
