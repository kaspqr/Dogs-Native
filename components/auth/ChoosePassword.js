import useAuth from "../../hooks/useAuth"
import { useState, useEffect } from "react"
import { useGetResetTokensQuery } from "./resetTokensApiSlice"
import { useResetPasswordMutation, useGetUsersQuery } from "../users/usersApiSlice"
import { useParams, useNavigate } from "react-router-dom"

const ResetPassword = () => {

    const navigate = useNavigate()

    const { id, resettoken } = useParams()

    const { userId } = useAuth()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errMsg, setErrMsg] = useState('')

    const PASSWORD_REGEX = /^[A-z0-9!@#%]{8,20}$/

    // GET the user with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
        user: data?.entities[id]
        }),
    })

    // PATCH function for resetting the password
    const [resetPassword, {
        isLoading: isUpdateLoading,
        isSuccess: isUpdateSuccess,
        isError: isUpdateError,
        error: updateError
    }] = useResetPasswordMutation()

    // GET all reset tokens
    const {
        data: resettokens,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetResetTokensQuery('resetTokensList', {
        pollingInterval: 75000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        await resetPassword({ id: id, password: password })
    }

    useEffect(() => {
        if (isError) setErrMsg(error?.data?.message)
    }, [isError, error])

    useEffect(() => {
        if (isUpdateError) setErrMsg(updateError?.data?.message)
    }, [isUpdateError, updateError])

    if (userId?.length) return <p>You need to be logged out before resetting your password</p>
    if (!user) return <p>Invalid Link</p>

    if (isLoading || isUpdateLoading) return <p>Loading...</p>

    if (isSuccess) {

        const { ids, entities } = resettokens

        const filteredId = ids.find(tokenId => {
            return (entities[tokenId].resetToken === resettoken && entities[tokenId].user === id)
        })

        if (!filteredId) return <h1>Invalid Link</h1>
    }

    if (isUpdateSuccess) {
        return <>
            <p>Your password has been updated. You may now login.</p>
            <br />
            <p><button title="Login" className="black-button" onClick={() => navigate('/login')}>Login</button></p>
        </>
    }

    const content = <>
        <header>
            <p className="login-page-title">Choose Password</p>
        </header>

        {errMsg?.length ? <p>{errMsg}</p> : null}

        <main>
        <form onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="password">
            <b>Password (8-20 Characters, Optionally Including !@#%)*</b>
        </label>
        <br />

        <input 
            className="three-hundred"
            type="password" 
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
        />
        <br />

        <label className="top-spacer" htmlFor="confirm-password">
            <b>Confirm Password</b>
        </label>
        <br />
        <input 
            className="three-hundred"
            type="password" 
            id="confirm-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
            required
        />
        <br />
        <br />

        </form>

        <button 
            title="Change Password"
            onClick={handleSubmit}
            className="black-button three-hundred"
            disabled={!PASSWORD_REGEX.test(password) || password !== confirmPassword}
            style={!PASSWORD_REGEX.test(password) || password !== confirmPassword ? {backgroundColor: "grey", cursor: "default"} : null}
        >
            Change Password
        </button>
        </main>
    </>

    return content
}

export default ResetPassword
