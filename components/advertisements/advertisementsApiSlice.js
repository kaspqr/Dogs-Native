import { createSelector, createEntityAdapter } from "@reduxjs/toolkit"
import { apiSlice } from "../../app/api/apiSlice"

const advertisementsAdapter = createEntityAdapter({})

const initialState = advertisementsAdapter.getInitialState()

export const advertisementsApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getAdvertisements: builder.query({
            query: () => ({
                url: '/advertisements',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            transformResponse: responseData => {
                const loadedAdvertisements = responseData.map(advertisement => {
                    advertisement.id = advertisement._id
                    return advertisement
                })
                return advertisementsAdapter.setAll(initialState, loadedAdvertisements)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Advertisement', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'Advertisement', id }))
                    ]
                } else return [{ type: 'Advertisement', id: 'LIST' }]
            }
        }),
        addNewAdvertisement: builder.mutation({
            query: initialAdvertisement => ({
                url: '/advertisements',
                method: 'POST',
                body: {
                    ...initialAdvertisement,
                }
            }),
            invalidatesTags: [
                { type: 'Advertisement', id: "LIST" }
            ]
        }),
        updateAdvertisement: builder.mutation({
            query: initialAdvertisement => ({
                url: '/advertisements',
                method: 'PATCH',
                body: {
                    ...initialAdvertisement,
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Advertisement', id: arg.id }
            ]
        }),
        deleteAdvertisement: builder.mutation({
            query: ({ id }) => ({
                url: '/advertisements',
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Advertisement', id: arg.id }
            ]
        }),
    }),
})

export const {
    useGetAdvertisementsQuery,
    useAddNewAdvertisementMutation,
    useUpdateAdvertisementMutation,
    useDeleteAdvertisementMutation,
} = advertisementsApiSlice

// Returns the query result object
export const selectAdvertisementsResult = advertisementsApiSlice.endpoints.getAdvertisements.select()

// Creates memoized selector
const selectAdvertisementsData = createSelector(
    selectAdvertisementsResult,
    advertisementsResult => advertisementsResult.data // Normalized state object with ids & entities
)

// getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllAdvertisements,
    selectById: selectAdvertisementById,
    selectIds: selectAdvertisementIds
    // Pass in a selector that returns the advertisements slice of state
} = advertisementsAdapter.getSelectors(state => selectAdvertisementsData(state) ?? initialState)
