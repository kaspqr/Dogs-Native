import { useNavigate, useParams } from "react-router-dom"
import { useGetEmailTokensQuery } from "./emailTokensApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import useAuth from "../../hooks/useAuth"

// Verify email query instead ??

const NewEmail = () => {

    const { userId } = useAuth()

    const navigate = useNavigate()
    const params = useParams()

    // GET the user whose page we're on with all of it's .values
    const { user } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            user: data?.entities[params.id]
        }),
    })

    const successMsg = <>
        <p>Email Verified Successfully</p>
        <br />
        <p><button onClick={() => navigate('/login')} className="black-button">Login</button></p>
    </>

    // GET all tokens
    const {
        data: emailtokens,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetEmailTokensQuery('emailTokensList', {
        pollingInterval: 75000,
        refetchOnMountOrArgChange: true
    })

    const verifyEmailUrl = async () => {
        try {
            const response = await fetch(`https://pawretriever-api.onrender.com/users/${params.id}/verifyemail/${params.emailtoken}`)

            if (response.status === 200) {
                return successMsg
            }

        } catch (error) {
            console.log(error)
        }
    }

    if (!user) return <h1>Invalid Link</h1>

    if (userId?.length) return <h1>Please logout before verifying an account</h1>

    if (isLoading) return <p>Loading...</p>

    if (isError) return <p>{error}</p>

    if (isSuccess) {
        const { ids, entities } = emailtokens

        const filteredId = ids.find(tokenId => {
            return (entities[tokenId].emailToken === params?.emailtoken && entities[tokenId].user === params?.id)
        })

        if (!filteredId) return <h1>Invalid Link</h1>

        if (filteredId) {

            const token = entities[filteredId]

            if (!user?.id?.length || token?.user !== user?._id) {
                return <h1>Invalid Link</h1>
            }

            verifyEmailUrl()
            return successMsg
        }
    }

    return successMsg
}

export default NewEmail
