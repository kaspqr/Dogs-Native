// ResetTokens for resetting passwords

import { apiSlice } from "../../app/api/apiSlice"

export const resetTokensApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        addNewResetToken: builder.mutation({
            query: initialResetToken => ({
                url: '/resettokens',
                method: 'POST',
                body: {
                    ...initialResetToken,
                }
            }),
            invalidatesTags: [
                { type: 'ResetToken', id: "LIST" }
            ]
        }),
    })
})

export const {
    useAddNewResetTokenMutation,
} = resetTokensApiSlice
