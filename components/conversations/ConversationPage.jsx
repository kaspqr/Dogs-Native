import { useGetConversationsQuery } from "./conversationsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { useGetMessagesQuery, useAddNewMessageMutation } from "../messages/messagesApiSlice"
import Message from "../messages/Message"
import { useParams, Link } from "react-router-dom"
import useAuth from "../../hooks/useAuth"
import { useState, useEffect, useRef, useCallback } from "react"

const ConversationPage = ({ conversationid }) => {

    const { userId } = useAuth()
    const [newMessage, setNewMessage] = useState('')
    const [displayedMessagesCount, setDisplayedMessagesCount] = useState(30)
    const [hasMoreMessages, setHasMoreMessages] = useState(true)
    const [initialMessagesLoaded, setInitialMessagesLoaded] = useState(false)

    // Variable to store all messages in this conversation
    let filteredMessages

    // POST method for a new message
    const [addNewMessage, {
        isLoading: isMessageLoading,
        isSuccess: isMessageSuccess,
        isError: isMessageError,
        error: messageError
    }] = useAddNewMessageMutation()

    async function handleSendMessage(e) {
        e.preventDefault()
        if (newMessage?.trim().length) {
            // POST the new message
            await addNewMessage({ sender: userId, conversation: conversationid, text: newMessage })
        }
    }

    // GET all the messages
    const {
        data: messages,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetMessagesQuery('messagesList', {
        pollingInterval: 15000,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true
    })

    const conversationDivRef = useRef(null)

    useEffect(() => {
        // Scroll the conversation div to the bottom after component renders
        if (conversationDivRef?.current && initialMessagesLoaded === false) {
            conversationDivRef.current.scrollTop = conversationDivRef.current.scrollHeight
            setInitialMessagesLoaded(true)
        }
    }, [messages, initialMessagesLoaded])

    // Define the handleScroll function using useCallback
    const handleScroll = useCallback(() => {
        if (conversationDivRef?.current.scrollTop === 0 && hasMoreMessages) {
            // Get the current scroll height and scroll position before adding more messages
            const previousScrollHeight = conversationDivRef?.current.scrollHeight
            const previousScrollTop = conversationDivRef?.current.scrollTop
        
            // Load more messages here and update the displayedMessagesCount
            setDisplayedMessagesCount(prevCount => prevCount + 30)
        
            // Use setTimeout to allow time for rendering the new messages
            setTimeout(() => {
                // Use requestAnimationFrame to ensure accurate calculation after rendering
                requestAnimationFrame(() => {
                // Calculate the new scroll position to maintain context
                const newScrollHeight = conversationDivRef?.current.scrollHeight
                const scrollPositionChange = newScrollHeight - previousScrollHeight
                conversationDivRef.current.scrollTop = previousScrollTop + scrollPositionChange
                })
            }, 0)
        }
      }, [hasMoreMessages])
      

    // GET the conversation with all of it's .values
    const { conversation } = useGetConversationsQuery("conversationsList", {
        selectFromResult: ({ data }) => ({
            conversation: data?.entities[conversationid]
        }),
    })

    // GET the user who is the sender of said conversation with all of it's .values
    const { sender } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            sender: data?.entities[conversation?.sender]
        }),
    })

    // GET the user who is the receiver of said conversation with all of it's .values
    const { receiver } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            receiver: data?.entities[conversation?.receiver]
        }),
    })

    // Clear the input if the previous message has been successfully sent
    useEffect(() => {
        if (isMessageSuccess) {
            setNewMessage('')
        }
    }, [isMessageSuccess])

    useEffect(() => {
        const divRef = conversationDivRef?.current; // Capture the current ref value
        divRef?.addEventListener('scroll', handleScroll)
        
        return () => {
            divRef?.removeEventListener('scroll', handleScroll)
        }
    }, [hasMoreMessages, handleScroll])

    useEffect(() => {
        if (filteredMessages?.length) {
            setHasMoreMessages(displayedMessagesCount < filteredMessages.length)
        }
    }, [displayedMessagesCount, filteredMessages])

    // Logic to handle received messages
    useEffect(() => {
        // Increment the total messages count and displayed messages count
        setDisplayedMessagesCount(prevCount => prevCount + 1)
    }, [messages?.ids.length])
    
    // Variable for errors and content
    let messageContent
    
    if (isLoading || isMessageLoading) messageContent = <p>Loading...</p>
    if (isError) messageContent = <p>{error?.data?.message}</p>
    if (isMessageError) messageContent = <p>{messageError?.data?.message}</p>
    
    if (isSuccess) {
        const { ids, entities } = messages

        // Filter all the IDs of all the messages in this conversation
        const filteredIds = ids.filter(messageId => entities[messageId].conversation === conversation?.id)

        if (filteredIds?.length) {
            filteredMessages = filteredIds.map(messageId => entities[messageId])
        }

        // Variable to store all Message components for each message in the conversation
        let tableContent

        if (filteredMessages?.length) {
            const messagesToDisplay = filteredMessages.slice(-displayedMessagesCount)
            tableContent = messagesToDisplay.map(message => (
              <Message key={message.id} messageId={message.id} />
            ))
          }
      
        messageContent = (
            <>
                <div ref={conversationDivRef} className="conversation-page-messages-div">
                    {tableContent}
                </div>
                
                <div className="conversation-page-message-input-div">
                    <form onSubmit={(e) => handleSendMessage(e)}>
                        <label htmlFor="new-message"><b>New Message</b></label>
                        <br />
                        <input 
                            value={newMessage} 
                            onChange={(e) => setNewMessage(e.target.value)} 
                            name="new-message" 
                            id="new-message" 
                        />
                        <button
                            title="Send Message"
                            className="send-message-button black-button"
                            disabled={!newMessage?.length}
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </>
        )
    }

    if (!conversation || !sender || !receiver) return null

    // Check that the logged in user is a participant of said conversation
    if (userId !== conversation?.sender && userId !== conversation?.receiver) return null

    return (
        <>
            {sender.id === userId 
                ? <p className="conversation-page-username-title">
                    <Link className="grey-link" to={`/users/${receiver.id}`}>{receiver.username}</Link>
                </p> 
                : <p className="conversation-page-username-title">
                    <Link className="grey-link" to={`/users/${sender.id}`}>{sender.username}</Link>
                </p>
            }
            <br />
            {isSuccess && messageContent}
        </>
    )
}

export default ConversationPage
