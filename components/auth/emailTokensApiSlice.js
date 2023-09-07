// EmailTokens for changing a user's email

import { createSelector, createEntityAdapter } from "@reduxjs/toolkit"
import { apiSlice } from "../../app/api/apiSlice"

const emailTokensAdapter = createEntityAdapter({})

const initialState = emailTokensAdapter.getInitialState()

export const emailTokensApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getEmailTokens: builder.query({
            query: () => ({
                url: '/emailtokens',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            transformResponse: responseData => {
                const loadedEmailTokens = responseData.map(emailToken => {
                    emailToken.id = emailToken._id
                    return emailToken
                })
                return emailTokensAdapter.setAll(initialState, loadedEmailTokens)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'EmailToken', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'EmailToken', id }))
                    ]
                } else return [{ type: 'EmailToken', id: 'LIST' }]
            }
        }),
    })
})

export const {
    useGetEmailTokensQuery,
} = emailTokensApiSlice

// Returns the query result object
export const selectEmailTokensResult = emailTokensApiSlice.endpoints.getEmailTokens.select()

// Creates memoized selector
const selectEmailTokensData = createSelector(
    selectEmailTokensResult,
    emailTokensResult => emailTokensResult.data // Normalized state object with ids & entities
)

// getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllEmailTokens,
    selectById: selectEmailTokenById,
    selectIds: selectEmailTokenIds
    // Pass in a selector that returns the emailTokens slice of state
} = emailTokensAdapter.getSelectors(state => selectEmailTokensData(state) ?? initialState)
