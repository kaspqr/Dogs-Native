import { useState, useEffect, useRef } from "react"
import { useUpdateDogMutation, useDeleteDogMutation } from "./dogsApiSlice"
import { useNavigate } from "react-router-dom"
import Calendar from "react-calendar"
import '../../styles/customCalendar.css'
import { Countries } from "../../config/countries"
import { bigCountries } from "../../config/bigCountries"
import { Regions } from "../../config/regions"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faToggleOff, faToggleOn, faUpload } from "@fortawesome/free-solid-svg-icons"

const EditDogForm = ({ dog }) => {

    const navigate = useNavigate()

    const NAME_REGEX = /^(?!^\s*$)(?:[a-zA-Z']+(\s|$))+$/

    const [heat, setHeat] = useState(typeof dog?.heat === 'boolean' ? dog.heat : false)
    const [sterilized, setSterilized] = useState(dog?.sterilized)
    const [death, setDeath] = useState(dog?.death?.length && dog?.death !== 'none ' ? dog.death : '')
    const [name, setName] = useState(dog?.name)
    const [microchipped, setMicrochipped] = useState(typeof dog?.microchipped === 'boolean' ? dog.microchipped : false)
    const [chipnumber, setChipnumber] = useState(dog?.chipnumber?.length && dog?.chipnumber !== 'none ' ? dog.chipnumber : '')
    const [passport, setPassport] = useState(typeof dog?.passport === 'boolean' ? dog.passport : false)
    const [info, setInfo] = useState(dog?.info?.length ? dog.info : '')
    const [country, setCountry] = useState(dog?.country?.length ? dog.country : 'Argentina')
    const [region, setRegion] = useState(dog?.region?.length ? dog.region : 'none ')
    const [instagram, setInstagram] = useState(dog?.instagram?.length && dog?.instagram !== 'none ' ? dog.instagram : '')
    const [facebook, setFacebook] = useState(dog?.facebook?.length && dog?.facebook !== 'none ' ? dog.facebook : '')
    const [youtube, setYoutube] = useState(dog?.youtube?.length && dog?.youtube !== 'none ' ? dog.youtube : '')
    const [tiktok, setTiktok] = useState(dog?.tiktok?.length && dog?.tiktok !== 'none ' ? dog.tiktok : '')
    const [previewSource, setPreviewSource] = useState()
    const [uploadMessage, setUploadMessage] = useState('')
    const [confirmDelete, setConfirmDelete] = useState('')
    const [uploadLoading, setUploadLoading] = useState(false)
    const [deletionVisible, setDeletionVisible] = useState(false)
    const fileInputRef = useRef(null)

    // Clear the region each time the country is changed to avoid having a region from another country
    const handleCountryChanged = (e) => {
        setCountry(e.target.value)
        setRegion('')
    }

    const handleDeathChanged = date => setDeath(date)
    const handleChipnumberChanged = e => setChipnumber(e.target.value)
    const handleInfoChanged = e => setInfo(e.target.value)
    const handleInstagramChanged = e => setInstagram(e.target.value)
    const handleFacebookChanged = e => setFacebook(e.target.value)
    const handleYoutubeChanged = e => setYoutube(e.target.value)
    const handleTiktokChanged = e => setTiktok(e.target.value)

    const handleHeatChanged = () => setHeat(prev => !prev)
    const handleSterilizedChanged = () => setSterilized(prev => !prev)
    const handlePassportChanged = () => setPassport(prev => !prev)

    // PATCH function for updating THE dog
    const [updateDog, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useUpdateDogMutation()

    // DELETE function for THE dog
    const [deleteDog, {
        isLoading: isDelLoading,
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteDogMutation()

    useEffect(() => {
        if (isSuccess) navigate(`/dogs/${dog?.id}`)
    }, [isSuccess, navigate, dog?.id])

    const handleMicrochippedChanged = () => {
        if (microchipped === true) setChipnumber('')
        setMicrochipped(prev => !prev)
    }

    // DELETE the dog
    const handleDeleteDogClicked = async () => {
        await deleteDog({ id: dog.id })
        setConfirmDelete('')
        setDeletionVisible(false)
    }

    const handleRemoveLitter = async () => {
        await updateDog({ id: dog.id, litter: 'none ' })
    }

    const handleSaveDogClicked = async () => {
        let updatedInstagram = instagram
        let updatedFacebook = facebook
        let updatedYoutube = youtube
        let updatedTiktok = tiktok
        let updatedRegion = region
        let updatedInfo = info
        let updatedChipnumber = chipnumber

        // Values that can be cleared need to be changed to 'none '
        // They need to have a length in order to PATCH them in the backend
        // That is due to the fact that dogs are also PATCHed when they are added to litters
        // Adding to litters only provides the dog's ID and the litter's ID
        if (!instagram?.length) {
            updatedInstagram = 'none '
        }

        if (!facebook?.length) {
            updatedFacebook = 'none '
        }

        if (!youtube?.length) {
            updatedYoutube = 'none '
        }

        if (!tiktok?.length) {
            updatedTiktok = 'none '
        }

        if (!region?.length) {
            updatedRegion = 'none '
        }

        if (!info?.length) {
            updatedInfo = 'none '
        }

        if (!chipnumber?.length) {
            updatedChipnumber = 'none '
        }

        let finalDeath = death !== '' ? new Date(death.getTime()).toDateString() : 'none '

        // PATCH the dog
        await updateDog({ id: dog.id, name,
            country, region: updatedRegion, death: finalDeath, sterilized, passport, microchipped, 
            chipnumber: updatedChipnumber, info: updatedInfo, heat,
            instagram: updatedInstagram, facebook: updatedFacebook, 
            youtube: updatedYoutube, tiktok: updatedTiktok 
        })
    }

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
        setUploadMessage('')
    }

    const uploadImage = async (base64EncodedImage) => {
        setUploadLoading(true)

        try {
            setUploadMessage('')
            await fetch('https://pawretriever-api.onrender.com/dogimages', {
                method: 'POST',
                body: JSON.stringify({ 
                    data: base64EncodedImage,
                    dog_id: `${dog?.id}`
                }),
                headers: {'Content-type': 'application/json'}
            })

            setPreviewSource(null)
            setUploadMessage('Profile Picture Updated!')
        } catch (error) {
            console.error(error)
            setUploadMessage('Something went wrong')
        }

        setUploadLoading(false)
    }

    const handleSubmitFile = (e) => {
        if (!previewSource) return
        uploadImage(previewSource)
    }

    const handleFileClicked = () => {
        // Programmatically trigger the click event on the file input
        fileInputRef.current.click();
    }

    if (isDelSuccess) navigate('/dogs')
    if (isLoading || isDelLoading) return <p>Loading...</p>

    // Boolean to control the 'disabled' value of the SAVE button
    const canSave = !isLoading && NAME_REGEX.test(name)

    const errContent = (error?.data?.message || delerror?.data?.message) ?? ''

    const removeLitterContent = dog?.litter?.length && dog?.litter !== 'none '
        ? <>
            <button
                className="three-hundred black-button"
                title="Remove Litter"
                onClick={handleRemoveLitter}
            >
                Remove Litter
            </button>
            <br />
            <br />
        </>
        : null

    const content = (
        <>
            {isError || isDelError ? <p>{errContent}</p> : null} 

            <form onSubmit={e => e.preventDefault()}>
                <div>
                    <p className="edit-dog-page-title">Edit Dog</p>
                </div>
                <br />

                <label htmlFor="name">
                    <b>Dog's Name (Max. 30 Letters) - Required</b>
                </label>
                <br />
                <input 
                    className="three-hundred"
                    name="name" 
                    id="name"
                    maxLength="30"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <br />

                <span className="top-spacer label-file-input" onClick={handleFileClicked} htmlFor="dog-image">
                    <b>Browse Profile Picture</b><label htmlFor="dog-image" className="off-screen">Browse Profile Picture</label> <FontAwesomeIcon icon={faUpload} />
                    <input
                        id="file"
                        type="file"
                        name="dog-image"
                        ref={fileInputRef}
                        onChange={handleFileChanged}
                        style={{ display: "none" }}
                    />
                </span>
                <br />
                <br />

                <button 
                    title="Update Dog Profile Picture"
                    className="black-button three-hundred" 
                    onClick={handleSubmitFile}
                    disabled={!previewSource || uploadLoading === true}
                    style={!previewSource || uploadLoading === true ? {backgroundColor: "grey", cursor: "default"} : null}
                >
                    Update Picture
                </button>
                <br />

                {uploadLoading === true ? <><span className="upload-message">Uploading...</span><br /></> : null}
                {uploadLoading === false && uploadMessage?.length ? <><span className="upload-message">{uploadMessage}</span><br /></> : null}

                {previewSource && <>
                    <img className="dog-profile-picture top-spacer" height="300px" width="300px" src={previewSource} alt="chosen" />
                    <br />
                </>}

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
                    <option value="none ">--</option>
                    {bigCountries?.includes(country) ? Regions[country] : null}
                </select>
                <br />

                <label htmlFor="passport" className="top-spacer">
                    <b>Passport </b>
                    <FontAwesomeIcon name="passport" onClick={handlePassportChanged} size="xl" icon={passport ? faToggleOn : faToggleOff} color={passport ? 'rgb(23, 152, 207)' : 'grey'} />
                </label>
                <br />

                {dog?.female === false
                    ? null
                    : <><label className="top-spacer" htmlFor="heat">
                            <b>Heat </b>
                            <FontAwesomeIcon name="heat" onClick={handleHeatChanged} size="xl" icon={heat ? faToggleOn : faToggleOff} color={heat ? 'rgb(23, 152, 207)' : 'grey'} />
                        </label>
                        <br /></>
                }


                <label className="top-spacer" htmlFor="sterilized">
                    <b>{dog?.female === true ? 'Sterilized ' : 'Castrated '}</b>
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
                    value={chipnumber}
                    onChange={handleChipnumberChanged}
                />
                <br />
                
                <label className="top-spacer" htmlFor="instagram">
                    <b>Instagram Username</b>
                </label>
                <br />
                <input 
                    className="three-hundred"
                    type="text"
                    id="instagram"
                    name="instagram"
                    value={instagram}
                    onChange={handleInstagramChanged}
                />
                <br />
                
                <label className="top-spacer" htmlFor="facebook">
                    <b>Facebook Username</b>
                </label>
                <br />
                <input 
                    className="three-hundred"
                    type="text"
                    id="facebook"
                    name="facebook"
                    value={facebook}
                    onChange={handleFacebookChanged}
                />
                <br />
                
                <label className="top-spacer" htmlFor="youtube">
                    <b>YouTube Username</b>
                </label>
                <br />
                <input 
                    className="three-hundred"
                    type="text"
                    id="youtube"
                    name="youtube"
                    value={youtube}
                    onChange={handleYoutubeChanged}
                />
                <br />
                
                <label className="top-spacer" htmlFor="tiktok">
                    <b>TikTok Username</b>
                </label>
                <br />
                <input 
                    className="three-hundred"
                    type="text"
                    id="tiktok"
                    name="tiktok"
                    value={tiktok}
                    onChange={handleTiktokChanged}
                />
                <br />

                <label className="top-spacer" htmlFor="death">
                    <b>Date of Death</b>
                </label>
                <br />
                <Calendar name="death" minDate={new Date(dog?.birth) || null} maxDate={new Date()} onChange={handleDeathChanged} value={death} />
                <button 
                    title="Clear Date of Death"
                    className="black-button"
                    style={death === '' ? {backgroundColor: "grey", cursor: "default"} : null}
                    disabled={death === ''}
                    onClick={() => setDeath('')}
                >
                    Clear date
                </button>
                <br />

                <label className="top-spacer" htmlFor="info">
                    <b>Info</b>
                </label>
                <br />
                <textarea 
                    className="three-hundred"
                    rows="10"
                    cols="30"
                    id="info"
                    name="info"
                    value={info !== 'none ' ? info : ''}
                    onChange={handleInfoChanged}
                />

                <br />
                <br />
                <div>
                    <button
                        className="black-button three-hundred"
                        title="Save"
                        onClick={handleSaveDogClicked}
                        disabled={!canSave}
                        style={!canSave ? {backgroundColor: "grey", cursor: "default"} : null}
                    >
                        Save
                    </button>
                    <br />
                    <br />
                    {removeLitterContent}
                    <button
                        className="three-hundred black-button"
                        title="Delete"
                        onClick={() => setDeletionVisible(!deletionVisible)}
                    >
                        Delete Dog
                    </button>
                    {deletionVisible === false ? null 
                        : <>
                        <br />
                        <br />
                        <label htmlFor="confirm-delete">
                            <b>Type "confirmdelete" and click on the Confirm Deletion button to delete your dog from the database.</b>
                        </label>
                        <br />
                        <input className="three-hundred" name="confirm-delete" type="text" value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} />
                        <br />
                        <br />
                        <button
                            className="black-button three-hundred"
                            title="Confirm Delete Dog"
                            disabled={confirmDelete !== 'confirmdelete'}
                            style={confirmDelete !== 'confirmdelete' ? {backgroundColor: "grey", cursor: "default"} : null}
                            onClick={handleDeleteDogClicked}
                        >
                            Confirm Deletion
                        </button>
                    </>}
                </div>
            </form>
        </>
    )

  return content
}

export default EditDogForm
