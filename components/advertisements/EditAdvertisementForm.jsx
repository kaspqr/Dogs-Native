import { useState, useEffect, useRef } from "react"
import { useUpdateAdvertisementMutation, useDeleteAdvertisementMutation } from "./advertisementsApiSlice"
import { useNavigate } from "react-router-dom"
import { Currencies } from "../../config/currencies"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUpload } from "@fortawesome/free-solid-svg-icons"

const EditAdvertisementForm = ({ advertisement }) => {

    // PATCH method to update the advertisement
    const [updateAdvertisement, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useUpdateAdvertisementMutation()

    // DELETE method to delete the advertisement
    const [deleteAdvertisement, {
        isLoading: isDelLoading,
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteAdvertisementMutation()

    const PRICE_REGEX = /^[1-9]\d{0,11}$/
    const TITLE_REGEX = /^(?!^\s*$)(?:[\w.,!?:]+(?:\s|$))+$/

    const navigate = useNavigate()

    const [title, setTitle] = useState(advertisement?.title)
    const [price, setPrice] = useState(advertisement?.price)
    const [validPrice, setValidPrice] = useState(PRICE_REGEX.test(price))
    const [currency, setCurrency] = useState(advertisement?.currency)
    const [info, setInfo] = useState(advertisement?.info)
    const [previewSource, setPreviewSource] = useState()
    const [uploadMessage, setUploadMessage] = useState('')
    const [uploadLoading, setUploadLoading] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState('')
    const [deletionVisible, setDeletionVisible] = useState(false)
    const fileInputRef = useRef(null)

    useEffect(() => {
        setValidPrice(PRICE_REGEX.test(price))
    }, [price])


    useEffect(() => {
        if (isDelSuccess) {
            // If the advertisement is DELETEd, go back to homepage
            navigate('/')
        } else if (isSuccess) {
            // If the advertisement is PATCHed, go to the page of said advertisement
            navigate(`/advertisements/${advertisement?.id}`)
        }
    }, [isSuccess, isDelSuccess, navigate])

    // PATCH function
    const handleSaveAdvertisementClicked = async () => {
        await updateAdvertisement({ id: advertisement.id, title, info, price, currency })
    }

    // DELETE function
    const handleDeleteAdvertisementClicked = async () => {
        await deleteAdvertisement({ id: advertisement.id })
        setDeletionVisible(false)
        setConfirmDelete('')
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
            await fetch('https://pawretriever-api.onrender.com/advertisementimages', {
                method: 'POST',
                body: JSON.stringify({ 
                    data: base64EncodedImage,
                    advertisement_id: `${advertisement?.id}`
                }),
                headers: {'Content-type': 'application/json'}
            })

            setPreviewSource(null)
            setUploadMessage('Picture Updated!')
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

    // Boolean to control the style and 'disabled' of the SAVE button
    let canSave = title?.length && info?.length && (validPrice || advertisement?.type === 'Found' || advertisement?.type === 'Lost') && !isLoading

    if (isLoading || isDelLoading) return <p>Loading...</p>
    if (isError) return <p>{error?.data?.message}</p>
    if (isDelError) return <p>{delerror?.data?.message}</p>

    const content = (
        <>
            <form onSubmit={e => e.preventDefault()}>
                <div>
                    <p className="advertisement-edit-page-title">Edit Advertisement</p>
                </div>
                <label htmlFor="name">
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
                <br />

                <button 
                    title="Update Adcertisement Picture"
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
                    <br />
                    <img className="three-hundred" src={previewSource} alt="chosen" />
                    <br />
                </>}

                {advertisement?.type !== 'Found' && advertisement?.type !== 'Lost'
                    ? <><label className="top-spacer" htmlFor="price">
                        <b>Price</b>
                        </label>
                        <br />
                        <input 
                            className="three-hundred"
                            type="text" 
                            id="price"
                            name="price"
                            maxLength="12"
                            value={price}
                            onChange={(e) => {
                                if (PRICE_REGEX.test(e.target.value) || e.target.value === "") {
                                    setPrice(e.target.value)
                                }
                            }}
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
                            onChange={(e) => setCurrency(e.target.value)}
                        >
                            {Currencies}
                        </select>
                        <br /></>
                    : <br />
                }

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
                    value={info}
                    onChange={(e) => setInfo(e.target.value)}
                />
                <br />
                <br />
            </form>
            <div className="advertisement-edit-page-buttons-div">
                <button
                    title="Save"
                    className="black-button three-hundred"
                    onClick={handleSaveAdvertisementClicked}
                    disabled={!canSave}
                    style={!canSave ? {backgroundColor: "grey", cursor: "default"} : null}
                >
                    Save
                </button>
                <br />
                <br />
                <button
                    title="Delete"
                    className="black-button three-hundred"
                    onClick={() => setDeletionVisible(!deletionVisible)}
                >
                    Delete
                </button>
                {deletionVisible === false ? null 
                    : <>
                    <br />
                    <br />
                    <label htmlFor="confirm-delete">
                        <b>Type "confirmdelete" and click on the Confirm Deletion button to delete your advertisement from the database.</b>
                    </label>
                    <br />
                    <input className="three-hundred" name="confirm-delete" type="text" value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} />
                    <br />
                    <br />
                    <button
                        className="black-button three-hundred"
                        title="Confirm Deletion"
                        disabled={confirmDelete !== 'confirmdelete'}
                        style={confirmDelete !== 'confirmdelete' ? {backgroundColor: "grey", cursor: "default"} : null}
                        onClick={handleDeleteAdvertisementClicked}
                    >
                        Confirm Deletion
                    </button>
                </>}
            </div>
        </>
    )

  return content
}

export default EditAdvertisementForm

