import { useState, useEffect, useRef } from "react"
import { useUpdateUserMutation, useDeleteUserMutation } from "./usersApiSlice"
import { useSendLogoutMutation } from "../auth/authApiSlice"
import { useNavigate } from "react-router-dom"
import { Countries } from "../../config/countries"
import { bigCountries } from "../../config/bigCountries"
import { Regions } from "../../config/regions"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUpload } from "@fortawesome/free-solid-svg-icons"

const EditUserForm = ({ user }) => {

    // PATCH function for updating the user
    const [updateUser, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useUpdateUserMutation()

    // DELETE function for deleting the user
    const [deleteUser, {
        isLoading: isDelLoading,
        isSuccess: isDelSuccess,
        isError: isDelError,
        error: delerror
    }] = useDeleteUserMutation()

    // POST request to clear the refreshtoken
    const [sendLogout, {
        isLoading: isLogoutLoading,
        isSuccess: isLogoutSuccess,
        isError: isLogoutError,
        error: logoutError
    }] = useSendLogoutMutation()

    const navigate = useNavigate()

    const NAME_REGEX = /^(?=.{1,30}$)[a-zA-Z]+(?: [a-zA-Z]+)*$/
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const PASSWORD_REGEX = /^[A-z0-9!@#%]{8,20}$/

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [name, setName] = useState(user.name)
    const [email, setEmail] = useState('')
    const [confirmEmail, setConfirmEmail] = useState('')
    const [bio, setBio] = useState(user.bio !== 'none ' ? user.bio : '')
    const [country, setCountry] = useState(user.country)
    const [region, setRegion] = useState(user.region?.length ? user.region : '')
    const [changePasswordError, setChangePasswordError] = useState('')
    const [previewSource, setPreviewSource] = useState()
    const [uploadMessage, setUploadMessage] = useState('')
    const [uploadLoading, setUploadLoading] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState('')
    const [deletionVisible, setDeletionVisible] = useState(false)
    const fileInputRef = useRef(null)

    // Clear the inputs if the user has been updated or deleted successfully
    useEffect(() => {
        if (isSuccess || isDelSuccess) {
            setPassword('')
            setConfirmPassword('')
            setName('')
            setEmail('')
            setCountry('')
            setRegion('')
            setBio('')
            navigate('/users')
        }
    }, [isSuccess, isDelSuccess, navigate])

    const handlePasswordChanged = e => setPassword(e.target.value)
    const handleConfirmPasswordChanged = e => setConfirmPassword(e.target.value)
    const handleCurrentPasswordChanged = e => setCurrentPassword(e.target.value)
    const handleNameChanged = e => setName(e.target.value)
    const handleEmailChanged = e => setEmail(e.target.value)
    const handleConfirmEmailChanged = e => setConfirmEmail(e.target.value)
    const handleBioChanged = e => setBio(e.target.value)

    const handleCountryChanged = e => {
        setRegion('none ')
        setCountry(e.target.value)
    }

    // PATCH the user
    const handleSaveUserClicked = async () => {
        setChangePasswordError('')

        const finalBio = bio?.length ? bio : 'none '

        if (password?.length) {
            if (password !== confirmPassword) {
                setChangePasswordError(<>New Password doesn't match with Confirm Password</>)
            }
            await updateUser({ id: user.id, password, name, email, country, region, currentPassword, bio: finalBio })
        } else {
            await updateUser({ id: user.id, name, email, country, region, currentPassword, bio: finalBio })
        }
    }

    // DELETE the user
    const handleDeleteUserClicked = async () => {
        const response = await deleteUser({ id: user.id, currentPassword })

        if (!response?.error) {
            sendLogout()
        }
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
    }

    const uploadImage = async (base64EncodedImage) => {
        setUploadLoading(true)

        try {
            setUploadMessage('')
            await fetch('https://pawretriever-api.onrender.com/userimages', {
                method: 'POST',
                body: JSON.stringify({ 
                    data: base64EncodedImage,
                    user_id: `${user?.id}`
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

    useEffect(() => {
        if (isLogoutSuccess) navigate('/')
    }, [isLogoutSuccess, navigate])

    if (isLoading || isDelLoading || isLogoutLoading) return <p>Loading...</p>

    const errContent = isError 
        ? error?.data?.message
        : isDelError
            ? delerror?.data?.message 
            : isLogoutError
                ? logoutError
                : ''

    const canSave = currentPassword?.length && NAME_REGEX.test(name) && email !== user?.email
        && ((EMAIL_REGEX.test(email) && email === confirmEmail) || !email?.length)
        && ((!password?.length && !confirmPassword?.length) || (PASSWORD_REGEX.test(password) && password === confirmPassword))

    const content = (
        <>
            {changePasswordError?.length ? <p>{changePasswordError}</p> : null}
            {errContent?.length ? <p>{errContent}</p> : null}

            <form onSubmit={e => e.preventDefault()}>
                <div>
                    <p className="edit-profile-page-title">Edit Profile</p>
                </div>

                <span className="label-file-input" onClick={handleFileClicked} htmlFor="user-image">
                    <b>Browse Profile Picture</b><label htmlFor="user-image" className="off-screen">Browse Profile Picture</label> <FontAwesomeIcon icon={faUpload} />
                    <input
                        id="file"
                        type="file"
                        name="user-image"
                        ref={fileInputRef}
                        onChange={handleFileChanged}
                        style={{ display: "none" }}
                    />
                </span>
                <br />
                <br />

                <button 
                    title="Update Profile Picture"
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

                {previewSource 
                    ? <>
                        <img className="user-profile-picture top-spacer" height="300px" width="300px" src={previewSource} alt="chosen" />
                        <br />
                        <br />
                    </>
                    : <br />}

                <p>Fields marked with <b>*</b> are required</p>
                <br />

                <label htmlFor="current-password">
                    <b>Current Password*</b>
                </label>
                <br />
                <input 
                    className="three-hundred"
                    type="password" 
                    id="current-password"
                    name="current-password"
                    value={currentPassword}
                    onChange={handleCurrentPasswordChanged}
                />
                <br />

                <label className="top-spacer" htmlFor="password">
                    <b>New Password (8-20 characters, including !@#%)</b>
                </label>
                <br />
                <input 
                    className="three-hundred"
                    type="password" 
                    id="password"
                    name="password"
                    value={password}
                    onChange={handlePasswordChanged}
                />
                <br />

                <label className="top-spacer" htmlFor="confirm-password">
                    <b>Confirm New Password</b>
                </label>
                <br />
                <input 
                    className="three-hundred"
                    type="password" 
                    id="confirm-password"
                    name="confirm-password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChanged}
                />
                <br />

                <label className="top-spacer" htmlFor="email">
                    <b>New Email</b>
                </label>
                <br />
                <input 
                    className="three-hundred"
                    type="text" 
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleEmailChanged}
                />
                <br />

                <label className="top-spacer" htmlFor="confirm-email">
                    <b>Confirm New Email</b>
                </label>
                <br />
                <input 
                    className="three-hundred"
                    type="text" 
                    id="confirm-email"
                    name="confirm-email"
                    value={confirmEmail}
                    onChange={handleConfirmEmailChanged}
                />
                <br />

                <label className="top-spacer" htmlFor="name">
                    <b>Name (Max. 30 Letters)*</b>
                </label>
                <br />
                <input 
                    className="three-hundred"
                    type="text" 
                    id="name"
                    name="name"
                    value={name}
                    onChange={handleNameChanged}
                />
                <br />

                <label className="top-spacer" htmlFor="country">
                    <b>Country</b>
                </label>
                <br />
                <select 
                    type="text" 
                    id="country"
                    name="country"
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

                <label className="top-spacer" htmlFor="bio">
                    <b>Bio</b>
                </label>
                <br />
                <textarea 
                    className="three-hundred"
                    cols="30"
                    rows="10"
                    maxLength="500"
                    name="bio" 
                    id="bio"
                    value={bio}
                    onChange={handleBioChanged}
                />
                <br />
                <br />
                
                <div className="edit-profile-buttons-div">
                    <button
                        className="black-button three-hundred"
                        title="Save"
                        disabled={!canSave}
                        style={!canSave ? {backgroundColor: "grey", cursor: "default"} : null}
                        onClick={handleSaveUserClicked}
                    >
                        Save
                    </button>
                    <br />
                    <br />
                    <button
                        title="Delete"
                        disabled={!currentPassword?.length}
                        style={!currentPassword?.length ? {backgroundColor: "grey", cursor: "default"} : null}
                        onClick={() => setDeletionVisible(!deletionVisible)}
                        className="three-hundred black-button"
                    >
                        Delete Account
                    </button>
                    {deletionVisible === false ? null 
                        : <>
                        <br />
                        <br />
                        <label htmlFor="confirm-delete">
                            <b>Enter your current password on top of the page, type "confirmdelete" in the input below and click on the Confirm Deletion button to delete your account.</b>
                        </label>
                        <br />
                        <input className="three-hundred" name="confirm-delete" type="text" value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} />
                        <br />
                        <br />
                        <button
                            className="black-button three-hundred"
                            title="Confirm Deletion"
                            disabled={confirmDelete !== 'confirmdelete' || !currentPassword?.length}
                            style={confirmDelete !== 'confirmdelete' || !currentPassword?.length ? {backgroundColor: "grey", cursor: "default"} : null}
                            onClick={handleDeleteUserClicked}
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

export default EditUserForm
