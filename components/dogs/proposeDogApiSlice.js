import { createSelector, createEntityAdapter } from "@reduxjs/toolkit"
import { apiSlice } from "../../app/api/apiSlice"

const dogProposesAdapter = createEntityAdapter({})

const initialState = dogProposesAdapter.getInitialState()

export const dogProposesApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getDogProposes: builder.query({
            query: () => ({
                url: '/dogproposes',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            transformResponse: responseData => {
                const loadedDogProposes = responseData.map(dogPropose => {
                    dogPropose.id = dogPropose._id
                    return dogPropose
                })
                return dogProposesAdapter.setAll(initialState, loadedDogProposes)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'DogPropose', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'DogPropose', id }))
                    ]
                } else return [{ type: 'DogPropose', id: 'LIST' }]
            }
        }),
        addNewDogPropose: builder.mutation({
            query: initialDogPropose => ({
                url: '/dogproposes',
                method: 'POST',
                body: {
                    ...initialDogPropose,
                }
            }),
            invalidatesTags: [
                { type: 'DogPropose', id: "LIST" }
            ]
        }),
        deleteDogPropose: builder.mutation({
            query: ({ id }) => ({
                url: '/dogproposes',
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'DogPropose', id: arg.id }
            ]
        }),
    }),
})

export const {
    useGetDogProposesQuery,
    useAddNewDogProposeMutation,
    useDeleteDogProposeMutation,
} = dogProposesApiSlice

// Returns the query result object
export const selectDogProposesResult = dogProposesApiSlice.endpoints.getDogProposes.select()

// Creates memoized selector
const selectDogProposesData = createSelector(
    selectDogProposesResult,
    dogProposesResult => dogProposesResult.data // Normalized state object with ids & entities
)

// getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllDogProposes,
    selectById: selectDogProposeById,
    selectIds: selectDogProposeIds
    // Pass in a selector that returns the dogProposes slice of state
} = dogProposesAdapter.getSelectors(state => selectDogProposesData(state) ?? initialState)
