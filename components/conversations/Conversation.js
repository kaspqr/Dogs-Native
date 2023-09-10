import { Link } from "react-router-dom"
import { useGetConversationsQuery } from "./conversationsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { useGetMessagesQuery } from "../messages/messagesApiSlice"
import { memo } from "react"
import useAuth from "../../hooks/useAuth"

const Conversation = ({ conversationId }) => {

    const { userId } = useAuth()

    // GET the conversation with all of it's .values
    const { conversation } = useGetConversationsQuery("conversationsList", {
        selectFromResult: ({ data }) => ({
            conversation: data?.entities[conversationId]
        }),
    })

    // GET the user who is the receiver of said conversation
    const { receiver } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            receiver: data?.entities[conversation?.receiver]
        }),
    })

    // GET the user who is the sender of said conversation
    const { sender } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            sender: data?.entities[conversation?.sender]
        }),
    })

    // GET all the messages
    const {
        data: messages,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetMessagesQuery('messagesList', {
        pollingInterval: 75000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    if (isLoading) return <p>Loading...</p>
    if (isError) return <p>{error?.data?.message}</p>
    if (!conversation || !receiver || !sender) return null

    if (isSuccess) {
        const { entities } = messages

        // Get the messages of current conversation
        const currentConversationMessages = Object.values(entities)?.filter(message => {
            return message.conversation === conversationId
        })

        // Get the last message in the conversation
        const lastMessage = currentConversationMessages?.length 
            ? currentConversationMessages[currentConversationMessages.length - 1] 
            : null

        // Variable for the other user who you're having a conversation with
        let otherUser

        if (receiver?.id === userId) otherUser = sender
        if (sender?.id === userId) otherUser = receiver

        return (
            <Link className="conversation-link" to={`/conversations/${conversation.id}`}>
                <div className="conversation-div">
                    <span><b>{otherUser.username}</b></span>
                    <span className="conversation-message-span">{lastMessage?.sender ? 
                        lastMessage?.text?.length > 12 
                            ? `${lastMessage?.text?.slice(0, 12)}...` 
                            : `${lastMessage?.text}`
                        : null
                    }</span>
                </div>
            </Link>
        )
    }
}

const memoizedConversation = memo(Conversation)

export default memoizedConversation
