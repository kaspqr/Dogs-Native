import { useState, useEffect } from "react"
import { useAddNewUserMutation } from "./usersApiSlice"
import { useNavigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth"
import { Countries } from "../../config/countries"
import { bigCountries } from "../../config/bigCountries"
import { Regions } from "../../config/regions"

const NewUserForm = () => {

    const USERNAME_REGEX = /^[A-z0-9]{6,20}$/
    const NAME_REGEX = /^(?=.{1,30}$)[a-zA-Z]+(?: [a-zA-Z]+)*$/
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const PASSWORD_REGEX = /^[A-z0-9!@#%]{8,20}$/

    const auth = useAuth()

    // POST method for registering a new user
    const [addNewUser, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useAddNewUserMutation()

    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [validUsername, setValidUsername] = useState(false)
    const [password, setPassword] = useState('')
    const [validPassword, setValidPassword] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState('')
    const [name, setName] = useState('')
    const [validName, setValidName] = useState(false)
    const [email, setEmail] = useState('')
    const [validEmail, setValidEmail] = useState(false)
    const [country, setCountry] = useState('Argentina')
    const [region, setRegion] = useState('')
    const [bio, setBio] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    useEffect(() => {
        setValidUsername(USERNAME_REGEX.test(username))
    }, [username])

    useEffect(() => {
        setValidPassword(PASSWORD_REGEX.test(password))
    }, [password])

    useEffect(() => {
        setValidName(NAME_REGEX.test(name))
    }, [name])

    useEffect(() => {
        setValidEmail(EMAIL_REGEX.test(email))
    }, [email])

    // Clear the inputs if a user was POSTed successfully
    useEffect(() => {
        if (isSuccess) {
            setUsername('')
            setPassword('')
            setConfirmPassword('')
            setName('')
            setEmail('')
            setCountry('')
            setRegion('')
            setBio('')
            setSuccessMsg('A verification link has been sent to your email. Please check the Spam folder if you cannot find it in your Primary emails. You will be able to log in once your account is verified.')
        }
    }, [isSuccess, navigate])

    const handleUsernameChanged = e => setUsername(e.target.value)
    const handlePasswordChanged = e => setPassword(e.target.value)
    const handleConfirmPasswordChanged = e => setConfirmPassword(e.target.value)
    const handleNameChanged = e => setName(e.target.value)
    const handleEmailChanged = e => setEmail(e.target.value)
    const handleBioChanged = e => setBio(e.target.value)

    const handleCountryChanged = (e) => {
        setRegion('')
        setCountry(e.target.value)
    }

    // Boolean to control the style and 'disabled' value of the SAVE button
    const canSave = [validUsername, validPassword, validName, validEmail].every(Boolean) && password === confirmPassword && !isLoading

    const handleSaveUserClicked = async (e) => {
        e.preventDefault()
        if (canSave) {
            // POST the user
            await addNewUser({ username, password, name, email, country, region, bio })
        }
    }

    if (auth?.username?.length) {
        return <p>You are currently logged in. Please logout before registering a new user.</p>
    }

    if (isLoading) return <p>Loading...</p>

    const content = successMsg?.length ? <p>{successMsg}</p> :
    <>
        {isError ? <p>{error?.data?.message}</p> : null}

        <form onSubmit={handleSaveUserClicked}>
            <div>
                <p className="register-page-title">Register New Account</p>
            </div>

            <p>Fields marked with <b>*</b> are required</p>
            <br />
            
            <label htmlFor="username">
                <b>Username (6-20 Letters and/or Numbers)*</b>
            </label>
            <br />
            <input 
                className="three-hundred"
                type="text" 
                id="username"
                name="username"
                autoComplete="off"
                value={username}
                onChange={handleUsernameChanged}
            />
            <br />

            <label className="top-spacer" htmlFor="password">
                <b>Password (8-20 Characters, Optionally Including !@#%)*</b>
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
                <b>Confirm Password*</b>
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
                <b>Email*</b>
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

            <label className="top-spacer" htmlFor="name">
                <b>Name*</b>
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
                <b>Country*</b>
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

        </form>
        <div className="register-page-button-div">
            <button
                onClick={handleSaveUserClicked}
                className="black-button three-hundred"
                title="Register"
                disabled={!canSave}
                style={!canSave ? {backgroundColor: "grey", cursor: "default"} : null}
            >
                Register
            </button>
        </div>
    </>

    return content
}

export default NewUserForm
