import { useState, useEffect, useRef } from "react"
import { useAddNewAdvertisementMutation } from "./advertisementsApiSlice"
import { useNavigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth"
import { Countries } from "../../config/countries"
import { bigCountries } from "../../config/bigCountries"
import { Regions } from "../../config/regions"
import { AdvertisementTypes } from "../../config/advertisementTypes"
import { Currencies } from "../../config/currencies"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUpload } from "@fortawesome/free-solid-svg-icons"
import { Breeds } from "../../config/breeds"

const NewAdvertisementForm = () => {

    const { userId } = useAuth()

    const breeds = [ ...Object.values(Breeds) ]
    const breedOptions = breeds.map(breed => (
        <option key={breed} value={breed}>{breed}</option>
    ))

    // POST method for a new advertisement
    const [addNewAdvertisement, {
        isLoading: isAdvertisementLoading,
        isSuccess: isAdvertisementSuccess,
        isError: isAdvertisementError,
        error: advertisementError
    }] = useAddNewAdvertisementMutation()

    const navigate = useNavigate()

    const PRICE_REGEX = /^[1-9]\d{0,11}$/
    const TITLE_REGEX = /^(?!^\s*$)(?:[\w.,!?:]+(?:\s|$))+$/

    const [title, setTitle] = useState('')
    const [type, setType] = useState('For Sale')
    const [price, setPrice] = useState('')
    const [currency, setCurrency] = useState('$')
    const [country, setCountry] = useState('Argentina')
    const [region, setRegion] = useState('')
    const [breed, setBreed] = useState('')
    const [info, setInfo] = useState('')
    const [previewSource, setPreviewSource] = useState()
    const fileInputRef = useRef(null)

    useEffect(() => {
        // Once POSTed, set everything back to default
        if (isAdvertisementSuccess) {
            setTitle('')
            setType('For Sale')
            setPrice('')
            setCurrency('$')
            setCountry('Argentina')
            setRegion('')
            setBreed('')
            setInfo('')
            navigate('/')
        }
    }, [isAdvertisementSuccess, navigate])

    useEffect(() => {

    }, [previewSource])

    if (isAdvertisementError) return <p>{advertisementError}</p>

    // Boolean to control the style and 'disabled' value of the SAVE button
    const canSave = title?.length && type?.length && info?.length && !isAdvertisementLoading
        && (type === 'Found' || type === 'Lost' || (price?.length && currency?.length)) 

    const previewFile = (file) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = () => {
            setPreviewSource(reader.result)
        }
    }

    const handleFileChanged = (e) => {
        const file = e.target.files[0]
        previewFile(file)
    }

    const handleFileClicked = () => {
        // Programmatically trigger the click event on the file input
        fileInputRef.current.click()
    }

    const handleSaveAdvertisementClicked = async (e) => {
        e.preventDefault()
        if (canSave) {
            // POST method for an advertisement
            await addNewAdvertisement({ poster: userId, title, price, type, info, currency, country, region, breed, image: previewSource })
        }
    }

    // Clear the region every time the country is changed to prevent having a region from a different country
    const handleCountryChanged = (e) => {
        setRegion('')
        setCountry(e.target.value)
    }

    const handleTypeChanged = (e) => {
        if (e.target.value === 'Lost' || e.target.value === 'Found') {
            // Price nor currency is allowed with above types
            setPrice('')
            setCurrency('')
        } else if (currency === '') {
            setCurrency('$')
        }

        if (e.target.value !== 'Require Female Dog' && e.target.value !== 'Require Male Dog') {
            setBreed('')
        }

        setType(e.target.value)
    }

    const content = (
        <>
            <form onSubmit={handleSaveAdvertisementClicked}>
                <div>
                    <p className="advertisement-post-page-title">Post Advertisement</p>
                </div>
                
                <label htmlFor="title">
                    <b>Title</b>
                </label>
                <br />
                <input 
                    className="three-hundred"
                    type="text" 
                    id="title"
                    name="title"
                    maxLength="50"
                    value={title}
                    onChange={(e) => {
                        if (TITLE_REGEX.test(e.target.value) || e.target.value === '') {
                            setTitle(e.target.value)}
                        }
                    }
                />
                <br />

                <span className="top-spacer label-file-input" onClick={handleFileClicked} htmlFor="advertisement-image">
                    <b>Browse Picture</b><label className="off-screen" htmlFor="advertisement-image">Browse Picture</label> <FontAwesomeIcon icon={faUpload} />
                    <input
                        id="file"
                        type="file"
                        name="advertisement-image"
                        ref={fileInputRef}
                        onChange={handleFileChanged}
                        style={{ display: "none" }}
                    />
                </span>
                <br />

                {previewSource && <>
                    <br />
                    <img className="three-hundred" src={previewSource} alt="chosen" />
                    <br />
                </>}

                <label className="top-spacer" htmlFor="type">
                    <b>Type</b>
                </label>
                <br />
                <select 
                    id="type"
                    name="type"
                    value={type}
                    onChange={handleTypeChanged}
                >
                    {AdvertisementTypes}
                </select>
                <br />

                <label className="top-spacer" htmlFor="breed">
                    <b>Breed Required</b>
                </label>
                <br />
                <select 
                    disabled={type !== 'Require Female Dog' && type !== 'Require Male Dog'}
                    id="breed"
                    name="breed"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                >
                    <option value="">--</option>
                    {breedOptions}
                </select>
                <br />
                
                <label className="top-spacer" htmlFor="price">
                    <b>Price</b>
                </label>
                <br />
                <input 
                    className="three-hundred"
                    type="text" 
                    id="price"
                    name="price"
                    value={price}
                    disabled={type === 'Found' || type === 'Lost'}
                    onChange={(e) => {
                        if (PRICE_REGEX.test(e.target.value) || e.target.value === '') {
                            setPrice(e.target.value)}
                        }
                    }
                />
                <br />
                
                <label className="top-spacer" htmlFor="currency">
                    <b>Currency</b>
                </label>
                <br />
                <select 
                    id="currency"
                    name="currency"
                    value={currency}
                    disabled={type === 'Found' || type === 'Lost'}
                    onChange={(e) => setCurrency(e.target.value)}
                >
                    <option disabled={type !== 'Found' && type !== 'Lost'} value="">--</option>
                    {Currencies}
                </select>
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

                <label className="top-spacer" htmlFor="info">
                    <b>Info</b>
                </label>
                <br />
                <textarea 
                    className="three-hundred"
                    id="info"
                    name="info"
                    cols="30"
                    rows="10"
                    maxLength="500"
                    value={info}
                    onChange={(e) => setInfo(e.target.value)}
                />
                <br />
                <br />
            </form>
            <div className="advertisement-post-page-buttons-div">
                <button
                    onClick={handleSaveAdvertisementClicked}
                    style={!canSave ? {backgroundColor: "grey", cursor: "default"} : null}
                    className="black-button three-hundred"
                    title="Post"
                    disabled={!canSave}
                >
                    Post
                </button>
            </div>
        </>
    )

  return content
}

export default NewAdvertisementForm
