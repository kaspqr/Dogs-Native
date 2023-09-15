import { useGetConversationsQuery } from "../components/conversations/conversationsApiSlice"
import { useGetMessagesQuery } from "../components/messages/messagesApiSlice"
import Conversation from "../components/conversations/Conversation"
import useAuth from "../hooks/useAuth"
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { COLORS } from "../constants"

const ConversationsList = () => {

  const { userId } = useAuth()

  // GET all the conversations
  const {
    data: conversations,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetConversationsQuery('conversationsList', {
    pollingInterval: 75000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true
  })

  // GET all the messages
  const {
    data: messages,
    isLoading: isMsgLoading,
    isSuccess: isMsgSuccess,
    isError: isMsgError,
    error: msgError
  } = useGetMessagesQuery('messagesList', {
    pollingInterval: 75000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true
  })

  // Variable for displaying errors and content
  let content

  if (isLoading || isMsgLoading) content = <Text style={{ margin: 10 }}>Loading...</Text>

  if (isError) content = <Text style={{ margin: 10 }}>{error?.data?.message}</Text>

  if (isMsgError) content = <Text style={{ margin: 10 }}>{msgError?.data?.message}</Text>

  if (isSuccess && isMsgSuccess) {
    const { ids, entities } = conversations
    const { entities: msgEntities } = messages

    // Filter all the IDs of conversations where the logged in user is a participant in
    const filteredIds = ids.filter(conversationId => entities[conversationId].sender === userId || entities[conversationId].receiver === userId)

    // Variable to store all Conversation components for each conversation the logged in user is a participant in
    let tableContent

    // Variable to store last messages of each conversation the user is a part of
    let lastMessages = []

    if (filteredIds?.length) {

      filteredIds?.map(conversationId => {

        // All the messages belonging to current conversation
        const allConvoMessages = Object.values(msgEntities)?.filter(msg => msg.conversation === conversationId)

        // Last message of current conversation
        if (allConvoMessages?.length) lastMessages.push(allConvoMessages[allConvoMessages.length - 1])
      })

      // Sort the collection of last messages from each convo by time, newest first
      lastMessages?.sort((a, b) => {
        return new Date(b.time) - new Date(a.time)
      })

      tableContent = lastMessages?.map(message => {
        return filteredIds?.map(id => {
          if (message?.conversation === id) return <Conversation key={id} conversationId={id} />
        })
      })
    } else {
      console.log('Filtered conversations has no length')
    }

    content = !lastMessages?.length 
      ? <Text style={{ margin: 10 }}>You have no messages</Text> 
      : <ScrollView style={{ backgroundColor: COLORS.lightWhite }} showsVerticalScrollIndicator={false}>
        <View style={styles.mainView}>
          {tableContent}
        </View>
      </ScrollView> 
  }

  return content
}

const styles = StyleSheet.create({
  mainView: {
      marginHorizontal: 10,
      marginBottom: 30,
      marginTop: 10,
  },
})

export default ConversationsList
