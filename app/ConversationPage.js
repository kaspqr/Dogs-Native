import { useGetConversationsQuery } from "../components/conversations/conversationsApiSlice"
import { useGetUsersQuery } from "../components/users/usersApiSlice"
import { useGetMessagesQuery, useAddNewMessageMutation } from "../components/messages/messagesApiSlice"
import Message from "../components/messages/Message"
import useAuth from "../hooks/useAuth"
import { useState, useEffect } from "react"
import { TouchableOpacity, View, Text, StyleSheet, TextInput, FlatList } from "react-native"
import { COLORS } from "../constants"

const ConversationPage = ({ route, navigation }) => {

    const { conversationid } = route.params

    const { userId } = useAuth()
    const [newMessage, setNewMessage] = useState('')
    const [displayedMessagesCount, setDisplayedMessagesCount] = useState(30)

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

    // Logic to handle received messages
    useEffect(() => {
        // Increment the total messages count and displayed messages count
        setDisplayedMessagesCount(prevCount => prevCount + 1)
    }, [messages?.ids.length])

    const inputContent = (
        <View 
            style={{ 
                flexDirection: 'row', alignItems: 'center', paddingTop: 5, borderTopWidth: 1, 
                borderTopColor: 'lightgrey', marginTop: 5
            }}
        >
                <TextInput 
                    value={newMessage} 
                    onChangeText={(value) => setNewMessage(value)} 
                    style={[styles.textInput, { height: 41, marginRight: 5, flex: 1 }]}
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
    )
    
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
              <Message navigation={navigation} key={message.id} messageId={message.id} />
            ))
          }
      
        messageContent = (
            <FlatList 
                data={filteredMessages?.slice(-displayedMessagesCount).reverse()}
                renderItem={({ item }) => <Message navigation={navigation} key={item.id} messageId={item.id} />}
                inverted={true}
                onEndReached={() => setDisplayedMessagesCount(displayedMessagesCount + 30)}
                onEndReachedThreshold={0.1}
            />
        )
    }

    if (!conversation || !sender || !receiver) return null

    // Check that the logged in user is a participant of said conversation
    if (userId !== conversation?.sender && userId !== conversation?.receiver) return null

    const navigationUser = sender?.id === userId ? receiver : sender

    return (
        <View style={styles.mainView}>
            <TouchableOpacity 
                onPress={() => navigation.navigate('UserPage', { navigation, id: navigationUser?.id })}
                style={{ borderBottomWidth: 1, borderBottomColor: 'lightgrey', marginBottom: 5 }}
            >
                <Text style={styles.orangeLink}>{navigationUser?.username}</Text>
            </TouchableOpacity> 

            {isSuccess && messageContent}
            {inputContent}
        </View>
    )
}

const styles = StyleSheet.create({
    mainView: {
        padding: 10,
        backgroundColor: COLORS.lightWhite,
        flex: 1
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
      paddingHorizontal: 5,
    },
    inputTitle: {
      fontWeight: 'bold',
    },
    orangeLink: {
        fontWeight: 'bold',
        color: 'orange',
        fontSize: 16,
        marginBottom: 10,
    },
  })

export default ConversationPage
