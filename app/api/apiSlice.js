import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials } from '../../components/auth/authSlice'

const baseQuery = fetchBaseQuery({

    // URL of the backend
    baseUrl: 'http://localhost:3500',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token

        if (token) {
            headers.set("authorization", `Bearer ${token}`)
        }
        return headers
    }
})


const baseQueryWithReauth = async (args, api, extraOptions) => {
    // console.log(args) // request url, method, body
    // console.log(api) // signal, dispatch, getState()
    // console.log(extraOptions) // custom like {shout: true}

    let result = await baseQuery(args, api, extraOptions)

    // If you want, hand other status codes, too
    if (result?.error?.status === 403) {
        console.log('sending refresh token')

        // Send refresh token to get a new access token
        const refreshResult = await baseQuery('/auth/refresh', api, extraOptions)

        if (refreshResult?.data) {
            // Store the new token
            api.dispatch(setCredentials({ ...refreshResult.data }))

            // Retry original query with the new access token
            result = await baseQuery(args, api, extraOptions)
        } else {
            if (refreshResult?.error?.status === 403) {
                refreshResult.error.data.message = "Your login has expired."
            }
            return refreshResult
        }
    }

    return result
}


export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Dog', 'User', 'Advertisement', 'Conversation', 'Message', 'Litter'],
    endpoints: builder => ({})
})
