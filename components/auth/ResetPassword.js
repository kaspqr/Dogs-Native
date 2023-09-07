import useAuth from "../../hooks/useAuth"
import { useState, useEffect } from "react"
import { useAddNewResetTokenMutation } from "./resetTokensApiSlice"

const ResetPassword = () => {

    const { userId } = useAuth()
    const [email, setEmail] = useState('')
    const [confirmEmail, setConfirmEmail] = useState('')
    const [errMsg, setErrMsg] = useState('')

    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    // POST method for a new reset token
    const [addNewResetToken, {
        isLoading,
        isSuccess,
        isError,
        error
    }] = useAddNewResetTokenMutation()

    const handleSubmit = async (e) => {
        e.preventDefault()
        await addNewResetToken({ email })
    }

    useEffect(() => {
        if (isError) {
            setErrMsg(error?.data?.message)
        }
    }, [isError, error])

    useEffect(() => {
        if (isSuccess) {
            setEmail('')
            setConfirmEmail('')
            setErrMsg('A link to reset your password has been sent to the specified email address. Please check the Spam folder if you cannot find it in your Primary emails.')
        }
    }, [isSuccess])

    if (userId?.length) return <p>You need to be logged out before resetting your password</p>

    if (isLoading) return <p>Loading...</p>

    const content = <>
        <header>
            <p className="login-page-title">Reset Password</p>
        </header>

        {errMsg?.length ? <p>{errMsg}</p> : null}

        <main>
        <form onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="email">
            <b>Email</b>
        </label>
        <br />

        <input 
            className="three-hundred"
            type="text" 
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            required
        />
        <br />

        <label className="top-spacer" htmlFor="confirm-email">
            <b>Confirm Email</b>
        </label>
        <br />
        <input 
            className="three-hundred"
            type="text" 
            id="confirm-email"
            onChange={(e) => setConfirmEmail(e.target.value)}
            value={confirmEmail}
            required
        />
        <br />
        <br />

        </form>

        <button 
            title="Request Link"
            onClick={handleSubmit}
            className="black-button three-hundred"
            disabled={!EMAIL_REGEX.test(email) || email !== confirmEmail}
            style={!EMAIL_REGEX.test(email) || email !== confirmEmail ? {backgroundColor: "grey", cursor: "default"} : null}
        >
            Request Link
        </button>
        </main>
    </>

    return content
}

export default ResetPassword
