import React from 'react';
import { FlatList, Alert, View, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import GroupRoomConversationChatMessage from '../components/GroupRoomConversationChatMessage';
import GroupRoomConversationInputBox from '../components/GroupRoomConversationInputBox';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useLayoutEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

import AnnouncementDisplay from '../components/CreateAnnouncementButton';
import { getChatRoom, getGroupRoomConversation } from "./queries";
import {API, graphqlOperation, Auth } from "aws-amplify";
import { getUser, messagesByConversation, messagesByGroupRoomConversation } from '../src/graphql/queries';
import { getConversation } from './queries';
import { messagesByChatRoom, listChatRoomUsers } from '../src/graphql/queries';
import { onCreateAnnouncement, onCreateConversationMessage, onCreateGroupRoomConversationMessage, onCreateMessage } from '../src/graphql/subscriptions';
import { useState } from 'react';
import styles from '../components/ChatListItem/style';
import * as mutations from '../src/graphql/mutations';

const GroupRoomConversationRoom = ({route}) => {
  const [messages, setMessages] = useState([]);
  const [myId, setMyId] = useState(null);
  const [myName, setMyName] = useState(null);
  const [messageReplyTo, setMessageReplyTo] = useState(null);
  const [ nextToken, setNextToken ] = useState('firstPage') //sets nextToken for the next page of messages
  const [usersTokens, setUsersTokens] = useState ([]);
  const [inputBoxListUsers, setInputBoxListUsers] = useState([]);
  const [CRUID, setCRUID] = useState(null);
  const [conversationUsers, setConversationUsers] = useState([]);
  const [loading, setLoading] = useState(false)
    //const [users, setUsers] = useState ([]);

    const navigation = useNavigation();
    const { groupRoomConversationID, groupRoomConversationName, } = route.params;
    const updateConversationUserLastRead = async () => {
      const userID = await Auth.currentAuthenticatedUser();
      try {
          const userData = await API.graphql(
              graphqlOperation(
                  getGroupRoomConversation, {
                      id: groupRoomConversationID,
                  }
              )
          )
          const currentConversationUserID = (userData.data.getGroupRoomConversation.groupRoomConversationUsers.items.find((cru) => cru.userID === userID.attributes.sub).id)
          if(userData.data.getGroupRoomConversation.lastMessage) {
            const timestamp = (userData.data.getGroupRoomConversation.lastMessage.updatedAt)
            await API.graphql(
                graphqlOperation(
                    mutations.updateGroupRoomConversationUser, {
                        input: {
                            id: currentConversationUserID,
                            lastMessageReadTimeStamp: timestamp
                        }
                    }
                )
            )
          } else {
            return;
          }
      } catch (e) {
          console.log(e);
          return;
      }
    }

    const deleteCRUser = async (id) => {
      const deletedConversationUser = await API.graphql(
        graphqlOperation(
            mutations.deleteGroupRoomConversationUser, {
                input: {
                  id: id,
                }
            }
        )
    )
      //console.log(`Deleted conversationUser(s): ${deletedConversationUser.data.deleteGroupRoomConversationUser}`)
    }; ////
    const promiseDeleteAll = async (conversationUsers) => {
      try {  
        setLoading(true);
        await Promise.all(
          conversationUsers.map((id) => deleteCRUser(id))
        );
        setLoading(false);
        navigation.navigate("Groups Home Screen");
      } catch (e) {
        console.log(e);
        setLoading(false);
        return;
      }
    }; //^//
    const pressToDeleteUsers = async () => {
      try {
        await promiseDeleteAll(conversationUsers);
      } catch (e) {
        console.log(e)
        return;
      }
    }; //^//
    const alertOfDeletion = () => {
      Alert.alert(
          `Delete "${groupRoomConversationName}"`,
          `Are you sure you want to delete this conversation?`,
          [
              {
                  text: "Delete",
                  onPress: () => pressToDeleteUsers(),
                  style: "destructive"
              },
              {
                  text: "Cancel"
              }
          ]
      )
  }

  useEffect(() => {
    const gestureHandler = navigation.addListener('blur', updateConversationUserLastRead); //focus = does something when you first enter the screen; blur = does something when you exit the screen; state = does both
    //console.log('exited')
    return () => {
      gestureHandler;
    };
  }, [navigation]);//when exit screen, update the user last read!

    useLayoutEffect (() => {
      navigation.setOptions({
            headerRight: () => (
              <View style={{flexDirection: "row", alignItems: "center"}}>
                { loading ?
                  <ActivityIndicator size="small" color="white" style={{marginRight: 20}} />
                :
                  <TouchableOpacity
                    style={{marginRight: 15}}
                    activeOpacity={0.5}
                    onPress={alertOfDeletion}
                  >
                    <MaterialCommunityIcons
                          name="trash-can"
                          size={30}
                          color = 'white'
                    />
                  </TouchableOpacity>}
              </View>
            ),
            headerLeft: () => (
              <View>
                <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => { updateConversationUserLastRead(); navigation.navigate("Groups Home Screen")}}>
                <Ionicons
                      name="chevron-back-outline" 
                      size={35}
                      color = 'white'
                  />
              </TouchableOpacity>
              </View>
            )
      }), [navigation]});

    const fetchMessages = async () => {
      if (nextToken == "firstPage") {
        const messagesData = await API.graphql(
          graphqlOperation(
            messagesByGroupRoomConversation, {
              groupRoomConversationID: groupRoomConversationID,
              sortDirection: "DESC",
              limit: 7,
            }
          )
        )
        setMessages(messagesData.data.messagesByGroupRoomConversation.items);
        setNextToken(messagesData.data.messagesByGroupRoomConversation.nextToken)
      }
      else {
        return;
      }
      //setLoadedMessages(messagesData.data.messagesByChatRoom.items.slice(0, 7))
      //gives me ALL of the messages that were sent in this chatRoom.
    }

    //delete below if not working
    const fetchMessagesPage = async () => {
      if (nextToken) {
        const messagesData = await API.graphql(
          graphqlOperation(
            messagesByGroupRoomConversation, {
              groupRoomConversationID: groupRoomConversationID,
              sortDirection: "DESC",
              limit: 7,
              nextToken
            }
          )
        )
        setNextToken(messagesData.data.messagesByGroupRoomConversation.nextToken)
        const newMessages = messagesData.data.messagesByGroupRoomConversation.items

        const newArrayOfMessages = messages.concat(newMessages);
        setMessages(newArrayOfMessages)
      } else {
        //console.log('No more messages are left to fetch')
        return
      }
    }
  
    useEffect(() => {
      fetchMessages();
    }, [])
  
    useEffect(() => {
      const getMyId = async () => {
        const userInfo = await Auth.currentAuthenticatedUser();
        setMyId(userInfo.attributes.sub);
        setMyName(userInfo.signInUserSession.accessToken.payload.username)
      }
      getMyId();
    }, [])

    useEffect(() => {
      const subscription = API.graphql(
        graphqlOperation(onCreateGroupRoomConversationMessage)
      ).subscribe({
        next: (data) => {
          const newMessage = data.value.data.onCreateGroupRoomConversationMessage;
  
          if (newMessage.groupRoomConversationID !== groupRoomConversationID) {
            return;
            // this is a check for chatRoomID. This is here so if someone else from a random chatRoom sends a message, our chatRoom is not affected and does not use this subscription update. This is most performant efficient! :)
          }
      
          setMessages(messages => [newMessage, ...messages]);
        }
      });
  
      return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
      const fetchChatRoomInfo = async () => {
          try {
              const currentUser = await Auth.currentAuthenticatedUser()
              const currentUserID = currentUser.attributes.sub
              const userData = await API.graphql(
                  graphqlOperation(
                      getGroupRoomConversation, {
                          id: groupRoomConversationID,
                      }
                  )
              )

              const whoWantsAllNotifications = (userData.data.getGroupRoomConversation.groupRoomConversationUsers.items.filter((n) => n.allowAllNotifications === true))
              setUsersTokens(whoWantsAllNotifications.map((u) => u.user.expoPushToken))
              setConversationUsers(userData.data.getGroupRoomConversation.groupRoomConversationUsers.items.map(i => i.id))
              const allInputUsers = (userData.data.getGroupRoomConversation.groupRoomConversationUsers.items.map(i => i.user))
              setInputBoxListUsers(allInputUsers.filter(u => u.id !== currentUserID))
              setCRUID(userData.data.getGroupRoomConversation.groupRoomConversationUsers.items.find((i) => i.userID === currentUserID).id)
          } catch (e) {
              console.log(e);
          }
      } 
      fetchChatRoomInfo()
    }, [])

    return (
        <View style={{width: '100%', height: '100%', paddingHorizontal: 5}}>
            <FlatList
                onEndReachedThreshold={0}
                onEndReached={fetchMessagesPage}
                data={messages}
                renderItem={({ item }) => 
                  <GroupRoomConversationChatMessage 
                    myId={myId} 
                    myName={myName}
                    message={item} 
                    setAsMessageReply={() => setMessageReplyTo(item)}
                  />
                }
                inverted
                showsVerticalScrollIndicator={false}
            />
            <GroupRoomConversationInputBox 
              groupRoomConversationID={groupRoomConversationID} 
              usersTokens={usersTokens}
              groupRoomConversationName={groupRoomConversationName}
              inputBoxListUsers={inputBoxListUsers}
              myName={myName}
              CRUID={CRUID}
              myId={myId}
              messageReplyTo={messageReplyTo} 
              removeMessageReplyTo={() => setMessageReplyTo(null)}
            />
        </View>
    )
}

export default GroupRoomConversationRoom;

// idea for avatar and name in custom header: