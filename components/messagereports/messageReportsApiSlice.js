import { createSelector, createEntityAdapter } from "@reduxjs/toolkit"
import { apiSlice } from "../../app/api/apiSlice"

const messageReportsAdapter = createEntityAdapter({})

const initialState = messageReportsAdapter.getInitialState()

export const messageReportsApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getMessageReports: builder.query({
            query: () => ({
                url: '/messagereports',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            transformResponse: responseData => {
                const loadedMessageReports = responseData.map(messageReport => {
                    messageReport.id = messageReport._id
                    return messageReport
                })
                return messageReportsAdapter.setAll(initialState, loadedMessageReports)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'MessageReport', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'MessageReport', id }))
                    ]
                } else return [{ type: 'MessageReport', id: 'LIST' }]
            }
        }),
        addNewMessageReport: builder.mutation({
            query: initialMessageReport => ({
                url: '/messagereports',
                method: 'POST',
                body: {
                    ...initialMessageReport,
                }
            }),
            invalidatesTags: [
                { type: 'MessageReport', id: "LIST" }
            ]
        }),
        deleteMessageReport: builder.mutation({
            query: ({ id }) => ({
                url: '/messagereports',
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'MessageReport', id: arg.id }
            ]
        }),
    }),
})

export const {
    useGetMessageReportsQuery,
    useAddNewMessageReportMutation,
    useDeleteMessageReportMutation,
} = messageReportsApiSlice

// Returns the query result object
export const selectMessageReportsResult = messageReportsApiSlice.endpoints.getMessages.select()

// Creates memoized selector
const selectMessageReportsData = createSelector(
    selectMessageReportsResult,
    messageReportsResult => messageReportsResult.data // Normalized state object with ids & entities
)

// getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllMessageReports,
    selectById: selectMessageReportById,
    selectIds: selectMessageReportIds
    // Pass in a selector that returns the messages slice of state
} = messageReportsAdapter.getSelectors(state => selectMessageReportsData(state) ?? initialState)
