// Tokens for email verification

import { createSelector, createEntityAdapter } from "@reduxjs/toolkit"
import { apiSlice } from "../../app/api/apiSlice"

const tokensAdapter = createEntityAdapter({})

const initialState = tokensAdapter.getInitialState()

export const tokensApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getTokens: builder.query({
            query: () => ({
                url: '/tokens',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            transformResponse: responseData => {
                const loadedTokens = responseData.map(token => {
                    token.id = token._id
                    return token
                })
                return tokensAdapter.setAll(initialState, loadedTokens)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Token', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'Token', id }))
                    ]
                } else return [{ type: 'Token', id: 'LIST' }]
            }
        })
    })
})

export const {
    useGetTokensQuery,
} = tokensApiSlice

// Returns the query result object
export const selectTokensResult = tokensApiSlice.endpoints.getTokens.select()

// Creates memoized selector
const selectTokensData = createSelector(
    selectTokensResult,
    tokensResult => tokensResult.data // Normalized state object with ids & entities
)

// getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllTokens,
    selectById: selectTokenById,
    selectIds: selectTokenIds
    // Pass in a selector that returns the tokens slice of state
} = tokensAdapter.getSelectors(state => selectTokensData(state) ?? initialState)
