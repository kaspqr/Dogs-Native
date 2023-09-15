import { useGetMessagesQuery } from "./messagesApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { memo, useState } from "react"
import useAuth from "../../hooks/useAuth"
import { TouchableOpacity, View, Text, StyleSheet } from "react-native"
import navigationService from "../../app/navigationService"

const Message = ({ messageId }) => {

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
        <View style={message?.sender === userId ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }}>
            <View style={messageClicked ? null : {display: "none"}}>
                {message?.sender !== userId
                    ? <View>
                        <TouchableOpacity
                            onPress={() => navigationService.navigate('MessageReportPage', { messageid: message?.id })}
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
        maxWidth: '80%',
        wordWrap: 'break-word',
        marginBottom: 1,
    },
  })

const memoizedMessage = memo(Message)

export default memoizedMessage
