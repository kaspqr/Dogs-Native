import { useGetConversationsQuery } from "../components/conversations/conversationsApiSlice"
import { useGetUsersQuery } from "../components/users/usersApiSlice"
import { useGetMessagesQuery, useAddNewMessageMutation } from "../components/messages/messagesApiSlice"
import Message from "../components/messages/Message"
import useAuth from "../hooks/useAuth"
import { useState, useEffect, useRef, useCallback } from "react"
import { TouchableOpacity, View, Text, StyleSheet, ScrollView, TextInput } from "react-native"

const ConversationPage = ({ route, navigation }) => {

    const { conversationid } = route.params

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

    const handleSendMessage = async () => {
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

    /* useEffect(() => {
        // Scroll the conversation div to the bottom after component renders
        if (conversationDivRef?.current && initialMessagesLoaded === false) {
            conversationDivRef.current.scrollTop = conversationDivRef.current.scrollHeight
            setInitialMessagesLoaded(true)
        }
    }, [messages, initialMessagesLoaded]) */

    // Define the handleScroll function using useCallback
    /* const handleScroll = useCallback(() => {
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
      }, [hasMoreMessages]) */
      

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

    /* useEffect(() => {
        const divRef = conversationDivRef?.current; // Capture the current ref value
        divRef?.addEventListener('scroll', handleScroll)
        
        return () => {
            divRef?.removeEventListener('scroll', handleScroll)
        }
    }, [hasMoreMessages, handleScroll]) */

    /* useEffect(() => {
        if (filteredMessages?.length) {
            setHasMoreMessages(displayedMessagesCount < filteredMessages.length)
        }
    }, [displayedMessagesCount, filteredMessages]) */

    // Logic to handle received messages
    /* useEffect(() => {
        // Increment the total messages count and displayed messages count
        setDisplayedMessagesCount(prevCount => prevCount + 1)
    }, [messages?.ids.length]) */
    
    // Variable for errors and content
    let messageContent
    
    if (isLoading || isMessageLoading) messageContent = <Text style={{ margin: 10 }}>Loading...</Text>
    if (isError) messageContent = <Text style={{ margin: 10 }}>{error?.data?.message}</Text>
    if (isMessageError) messageContent = <Text style={{ margin: 10 }}>{messageError?.data?.message}</Text>
    
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
            <View>
                <ScrollView 
                    ref={conversationDivRef} 
                    onContentSizeChange={() => conversationDivRef.current.scrollToEnd({ animated: true })}
                >
                    {tableContent}
                </ScrollView>
                
                <View>
                        <TextInput 
                            value={newMessage} 
                            onChangeText={(value) => setNewMessage(value)} 
                            style={styles.textInput}
                        />
                        <View>
                            <TouchableOpacity
                                style={styles.blackButton}
                                disabled={!newMessage?.length}
                                onPress={handleSendMessage}
                            >
                                <Text style={styles.buttonText}>{'->'}</Text>
                            </TouchableOpacity>
                        </View>
                </View>
            </View>
        )
    }

    if (!conversation || !sender || !receiver) return null

    // Check that the logged in user is a participant of said conversation
    if (userId !== conversation?.sender && userId !== conversation?.receiver) return null

    return (
        <View style={styles.mainView}>
            {sender.id === userId 
                ? <TouchableOpacity onPress={() => navigation.navigate('UserPage', { navigation, id: receiver?.id })}>
                    <Text style={styles.orangeLink}>{receiver?.username}</Text>
                </TouchableOpacity> 
                : <TouchableOpacity onPress={() => navigation.navigate('UserPage', { navigation, id: sender?.id })}>
                    <Text style={styles.orangeLink}>{sender?.username}</Text>
                </TouchableOpacity>
            }
            {isSuccess && messageContent}
        </View>
    )
}

const styles = StyleSheet.create({
    mainView: {
        margin: 10,
    },
    blackButtonWide: {
      backgroundColor: '#000000',
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
    },
    blackButton: {
      padding: 10,
      borderRadius: 5,
      backgroundColor: '#000000',
      width: 50,
    },
    blackNewPageButton: {
      backgroundColor: '#000000',
      borderRadius: 5,
      padding: 10,
    },
    greyButton: {
      backgroundColor: 'lightgrey',
    },
    buttonText: {
      color: '#ffffff',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    textInputWide: {
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 5,
      paddingVertical: 13,
      marginBottom: 10,
    },
    textInput: {
      borderWidth: 1,
      borderRadius: 5,
      paddingLeft: 5,
      width: 300,
    },
    inputTitle: {
      fontWeight: 'bold',
    },
  })

export default ConversationPage
