import { createSelector, createEntityAdapter } from "@reduxjs/toolkit"
import { apiSlice } from "../../app/api/apiSlice"

const messagesAdapter = createEntityAdapter({})

const initialState = messagesAdapter.getInitialState()

export const messagesApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getMessages: builder.query({
            query: () => ({
                url: '/messages',
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError
                },
            }),
            transformResponse: responseData => {
                const loadedMessages = responseData.map(message => {
                    message.id = message._id
                    return message
                })
                return messagesAdapter.setAll(initialState, loadedMessages)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Message', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'Message', id }))
                    ]
                } else return [{ type: 'Message', id: 'LIST' }]
            }
        }),
        addNewMessage: builder.mutation({
            query: initialMessage => ({
                url: '/messages',
                method: 'POST',
                body: {
                    ...initialMessage,
                }
            }),
            invalidatesTags: [
                { type: 'Message', id: "LIST" }
            ]
        }),
        deleteMessage: builder.mutation({
            query: ({ id }) => ({
                url: '/messages',
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Message', id: arg.id }
            ]
        }),
    }),
})

export const {
    useGetMessagesQuery,
    useAddNewMessageMutation,
    useDeleteMessageMutation,
} = messagesApiSlice

// Returns the query result object
export const selectMessagesResult = messagesApiSlice.endpoints.getMessages.select()

// Creates memoized selector
const selectMessagesData = createSelector(
    selectMessagesResult,
    messagesResult => messagesResult.data // Normalized state object with ids & entities
)

// getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllMessages,
    selectById: selectMessageById,
    selectIds: selectMessageIds
    // Pass in a selector that returns the messages slice of state
} = messagesAdapter.getSelectors(state => selectMessagesData(state) ?? initialState)
