import { createSelector, createEntityAdapter } from "@reduxjs/toolkit"
import { apiSlice } from "../../app/api/apiSlice"

const dogsAdapter = createEntityAdapter({})

const initialState = dogsAdapter.getInitialState()

export const dogsApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getDogs: builder.query({
            query: () => ({
                url: '/dogs',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            transformResponse: responseData => {
                const loadedDogs = responseData.map(dog => {
                    dog.id = dog._id
                    return dog
                })
                return dogsAdapter.setAll(initialState, loadedDogs)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Dog', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'Dog', id }))
                    ]
                } else return [{ type: 'Dog', id: 'LIST' }]
            }
        }),
        addNewDog: builder.mutation({
            query: initialDog => ({
                url: '/dogs',
                method: 'POST',
                body: {
                    ...initialDog,
                }
            }),
            invalidatesTags: [
                { type: 'Dog', id: "LIST" }
            ]
        }),
        updateDog: builder.mutation({
            query: initialDog => ({
                url: '/dogs',
                method: 'PATCH',
                body: {
                    ...initialDog,
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Dog', id: arg.id }
            ]
        }),
        deleteDog: builder.mutation({
            query: ({ id }) => ({
                url: '/dogs',
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Dog', id: arg.id }
            ]
        }),
    }),
})

export const {
    useGetDogsQuery,
    useAddNewDogMutation,
    useUpdateDogMutation,
    useDeleteDogMutation,
} = dogsApiSlice

// Returns the query result object
export const selectDogsResult = dogsApiSlice.endpoints.getDogs.select()

// Creates memoized selector
const selectDogsData = createSelector(
    selectDogsResult,
    dogsResult => dogsResult.data // Normalized state object with ids & entities
)

// getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllDogs,
    selectById: selectDogById,
    selectIds: selectDogIds
    // Pass in a selector that returns the dogs slice of state
} = dogsAdapter.getSelectors(state => selectDogsData(state) ?? initialState)
