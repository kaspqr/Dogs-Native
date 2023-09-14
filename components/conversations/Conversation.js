import { useGetConversationsQuery } from "./conversationsApiSlice"
import { useGetUsersQuery } from "../users/usersApiSlice"
import { useGetMessagesQuery } from "../messages/messagesApiSlice"
import { memo } from "react"
import useAuth from "../../hooks/useAuth"
import { TouchableOpacity, View, Text, StyleSheet, Image } from "react-native"
import UserIcon from "../../assets/images/UserIcon.jpg"

const Conversation = ({ conversationId, navigation }) => {

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

    if (isLoading) return <Text style={{ margin: 10 }}>Loading...</Text>
    if (isError) return <Text style={{ margin: 10 }}>{error?.data?.message}</Text>
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
            <View style={styles.conversationView}>

                <TouchableOpacity onPress={() => navigation.navigate('ConversationPage', { navigation, conversationid: conversationId })}>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                        <Image style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }} source={otherUser?.image?.length ? {uri: otherUser?.image} : UserIcon} />

                        <Text style={{ fontWeight: 'bold' }}>{otherUser.username}</Text>

                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text>
                                {lastMessage?.sender 
                                    ? `${lastMessage?.sender === userId ? 'You: ' : ''}${lastMessage?.text?.length > 12 
                                            ? lastMessage?.text?.slice(0, 12) + '...' 
                                            : lastMessage?.text
                                    }` 
                                    : null
                                }
                            </Text>
                        </View>

                    </View>

                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    conversationView: {
        wordWrap: 'wrap',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#d3d3d3',
        padding: 10,
        marginTop: 5,
        marginBottom: 5,
    },
})

const memoizedConversation = memo(Conversation)

export default memoizedConversation
