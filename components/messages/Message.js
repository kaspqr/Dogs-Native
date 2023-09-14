import { useGetMessagesQuery } from "./messagesApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { memo, useState } from "react"
import useAuth from "../../hooks/useAuth"
import { TouchableOpacity, View, Text, StyleSheet } from "react-native"

const Message = ({ messageId, navigation }) => {

    const { userId } = useAuth()

    const [messageClicked, setMessageClicked] = useState(false)

    // GET the message with all of it's .values
    const { message } = useGetMessagesQuery("messagesList", {
        selectFromResult: ({ data }) => ({
            message: data?.entities[messageId]
        }),
    })

    // GET the user who is the sender of THE message with all of it's .values
    const { sender } = useGetUsersQuery("usersList", {
        selectFromResult: ({ data }) => ({
            sender: data?.entities[message?.sender]
        }),
    })

    if (!message || !sender) return null

    return (
        <View>
            <View style={messageClicked ? null : {display: "none"}}>
                {message?.sender !== userId
                    ? <View>
                        <TouchableOpacity
                            onPress={() => {}}
                        >
                            <Text style={{ color: 'red' }}>Report Message</Text>
                        </TouchableOpacity>
                    </View>
                    : null
                }
                <Text>{message.time.split('T').join(' ').split('Z').join(' ').split(':').slice(0, 2).join(':')}</Text>
            </View>
            <View style={message?.sender === userId ? styles.sentMessageContent : styles.receivedMessageContent}>
                <TouchableOpacity 
                    onPress={() => setMessageClicked(!messageClicked)}
                >
                    <Text>{message?.text}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    mainView: {
        marginHorizontal: 10,
        marginBottom: 30,
        marginTop: 10,
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
    filterViewVisible: {
      flex: 1,
    },
    filterViewHidden: {
      display: 'none',
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
      width: 60,
    },
    selectInputWide: {
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 10,
    },
    paginationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    paginationTextView: {
      flex: 1,
      alignItems: 'center',
    },
    paginationInputView: {
      flexDirection: 'row',
      marginTop: 5,
    },
    inputTitle: {
      fontWeight: 'bold',
    },
    sentMessageContainer: {
        justifyContent: 'flex-end',
        marginBottom: '5px',
    },
    receivedMessageContainer: {
        justifyContent: 'flex-start',
        marginBottom: '5px',
    },
    orangeLink: {
        color: 'orange',
        fontWeight: 'bold',
    },
    sentMessageContent: {
        backgroundColor: 'orange',
        borderRadius: 5,
        padding: 5,
        maxWidth: '80%',
        wordWrap: 'break-word',
        marginBottom: 1,
        flex: 1,
        alignItems: 'flex-end',
    },
    receivedMessageContent: {
        backgroundColor: 'lightgrey',
        borderRadius: 5,
        padding: 5,
        maxWidth: 300,
        wordWrap: 'break-word',
        marginBottom: 1,
    },
  })

const memoizedMessage = memo(Message)

export default memoizedMessage
