import React from 'react';
import { FlatList, Text, View, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import GroupChatMessage from '../components/GroupChatMessage';
import GroupInputBox from '../components/GroupInputBox';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useLayoutEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

import AnnouncementDisplay from '../components/CreateAnnouncementButton';
import { getChatRoom, getGroupRoom } from "./queries";
import {API, graphqlOperation, Auth } from "aws-amplify";
import { getUser, messagesByGroupRoom } from '../src/graphql/queries';
import { messagesByChatRoom, listChatRoomUsers } from '../src/graphql/queries';
import { onCreateAnnouncement, onCreateGroupRoomMessage, onCreateMessage } from '../src/graphql/subscriptions';
import { useState } from 'react';
import * as mutations from '../src/graphql/mutations';
import ConversationListItem from '../components/ConversationListItem';
import GroupRoomConversationListItem from '../components/GroupRoomConversationListItem';

const GroupRoomScreen = ({route}) => {
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [myId, setMyId] = useState(null);
    const [myName, setMyName] = useState(null);
    const [messageReplyTo, setMessageReplyTo] = useState(null);
    const [usersTokens, setUsersTokens] = useState ([]);
    const [inputBoxListUsers, setInputBoxListUsers] = useState([]);
    const [users, setUsers] = useState([]); //gives the real user ids
    const [CRUID, setCRUID] = useState(null);
    const [poundBoolean, setPoundBoolean] = useState(false);
    const [textInput, setTextInput] = useState('')
    const navigation = useNavigation();
    const [ nextToken, setNextToken ] = useState('firstPage') //sets nextToken for the next page of messages
    const {groupRoomID, groupRoomName, groupRoomImage, role, groupRoomConversations, userID, conversationUsersToken} = route.params;

    const updateChatRoomUserLastRead = async () => {
      const userID = await Auth.currentAuthenticatedUser();
      try {
          const userData = await API.graphql(
              graphqlOperation(
                  getGroupRoom, {
                      id: groupRoomID,
                  }
              )
          )
          const currentChatRoomUserID = (userData.data.getGroupRoom.groupRoomUsers.items.find((cru) => cru.userID === userID.attributes.sub).id)
          if (userData.data.getGroupRoom.lastMessage) {
            const timestamp = (userData.data.getGroupRoom.lastMessage.updatedAt)
            await API.graphql(
                graphqlOperation(
                    mutations.updateGroupRoomUser, {
                        input: {
                            id: currentChatRoomUserID,
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

    const updateCRULastAnnouncementRead = async () => {
      const userID = await Auth.currentAuthenticatedUser();
      try {
        const userData = await API.graphql(
            graphqlOperation(
                getGroupRoom, {
                    id: groupRoomID,
                }
            )
        )
        const currentChatRoomUserID = (userData.data.getGroupRoom.groupRoomUsers.items.find((cru) => cru.userID === userID.attributes.sub).id)
        if (userData.data.getGroupRoom.lastAnnouncement) {
          const timestamp = (userData.data.getGroupRoom.lastAnnouncement.updatedAt)
          await API.graphql(
            graphqlOperation(
                mutations.updateGroupRoomUser, {
                    input: {
                        id: currentChatRoomUserID,
                        lastAnnouncementReadTimeStamp: timestamp
                    }
                }
            )
          ) 
        } else {
          return
        }
      } catch (e) {
      console.log(e);
      return;
      }
    }

    const onPress = () => {
      navigation.navigate('Group Settings', {
        groupID: groupRoomID,
      })
    };

    const navigateToAnnouncement = () => {
      navigation.navigate('Group Announcements', {
        groupRoomID: groupRoomID,
        groupRoomName: groupRoomName,
        groupRoomImage: groupRoomImage,
        CRUID: CRUID,
        role: role,
      })
  };

    useEffect(() => {
      const gestureHandler = navigation.addListener('blur', updateChatRoomUserLastRead); //focus = does something when you first enter the screen; blur = does something when you exit the screen; state = does both
      //console.log('exited')
      return () => {
        gestureHandler;
      };
    }, [navigation]);//when exit screen, update the user last read!


    useLayoutEffect (() => {
      navigation.setOptions({
          headerRight: () => (
            <View>
              <View style={{flexDirection: "row", alignItems: "center"}}>

              <TouchableOpacity
                  style={{marginRight: 15}}
                  activeOpacity={0.5}
                  onPress={() => {setPoundBoolean((currentValue) => !currentValue)}}>
                  <MaterialCommunityIcons
                        name="pound"
                        size={30}
                        color = 'white'
                  />
              </TouchableOpacity>

                <TouchableOpacity
                  style={{marginRight: 15}}
                  activeOpacity={0.5}
                  onPress={() => {navigateToAnnouncement(); updateCRULastAnnouncementRead()}}>
                  <MaterialCommunityIcons
                        name="bullhorn"
                        size={30}
                        color = 'white'
                    />
                  {/* { CRULastAnnouncementTimeRead < chatRoomLastAnnouncementTime || CRULastAnnouncementTimeRead === null ?
                    <View style={{width: 12, height: 12, borderRadius: 15, backgroundColor: "red", position: "absolute", alignSelf: "flex-end", bottom: 19 }}/>
                    :
                    null
                  } */}
                </TouchableOpacity>

                <TouchableOpacity
                  style={{marginRight: 10}}
                  activeOpacity={0.5}
                  onPress={onPress}>
                  <Ionicons
                        name="ios-settings-sharp" 
                        size={30}
                        color = 'white'
                    />
                </TouchableOpacity>
              </View>
            </View>
            ),
            headerLeft: () => (
              <View>
                <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {navigation.navigate("Groups Home Screen")}}>
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
            messagesByGroupRoom, {
              groupRoomID: groupRoomID,
              sortDirection: "DESC",
              limit: 7,
            }
          )
        )
        setMessages(messagesData.data.messagesByGroupRoom.items);
        setNextToken(messagesData.data.messagesByGroupRoom.nextToken)
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
            messagesByGroupRoom, {
              groupRoomID: groupRoomID,
              sortDirection: "DESC",
              limit: 7,
              nextToken
            }
          )
        )
        setNextToken(messagesData.data.messagesByGroupRoom.nextToken)
        const newMessages = messagesData.data.messagesByGroupRoom.items

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
        graphqlOperation(onCreateGroupRoomMessage)
      ).subscribe({
        next: (data) => {
          const newMessage = data.value.data.onCreateGroupRoomMessage;
  
          if (newMessage.groupRoomID !== groupRoomID) {
            return;
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
                      getGroupRoom, {
                          id: groupRoomID,
                      }
                  )
              )
              setUsers(userData.data.getGroupRoom.groupRoomUsers.items.map(i => i.user.id))
              const whoWantsAllNotifications = (userData.data.getGroupRoom.groupRoomUsers.items.filter((n) => n.allowAllNotifications === true))
              setUsersTokens(whoWantsAllNotifications.map((u) => u.user.expoPushToken))
              const allInputUsers = (userData.data.getGroupRoom.groupRoomUsers.items.map(i => i.user))
              setInputBoxListUsers(allInputUsers.filter(u => u.id !== currentUserID))
              setCRUID(userData.data.getGroupRoom.groupRoomUsers.items.find((i) => i.userID === currentUserID).id)
          } catch (e) {
              console.log(e);
          }
      } 
      fetchChatRoomInfo()
  }, [])
  
  const addUserToConversation = async (userID, groupRoomConversationID) => {
    try {
      const conversationUser = await API.graphql(
        graphqlOperation(
            mutations.createGroupRoomConversationUser, {
                input: {
                userID: userID,
                groupRoomConversationID: groupRoomConversationID,
                allowAllNotifications: true,
                allowSelectedNotifications: false,
                }
            }
        )
      )
      //console.log(`Here is conversationUser: ${conversationUser.data.createGroupRoomConversationUser.id}`)
    } catch(e) {
      console.log(e);
    }
  };
  const createConversation = async (users) => {
    try {
      setLoading(true)

      const newConversationData = {
        name: textInput,
        groupRoomID: groupRoomID,
        lastMessageID: "zz7050e7-b24d-4ce1-a048-e57da56ff3e7",
      };

      const newConversation = await API.graphql(
        graphqlOperation(
            mutations.createGroupRoomConversation, {
                input: newConversationData
            }
        )
      )

      const convertedNewConversation = newConversation.data.createGroupRoomConversation.id;
      const newConversationName = newConversation.data.createGroupRoomConversation.name;
      //console.log(`ConversationID: ${convertedNewConversation}`)

      await Promise.all(
        users.map((userID) => addUserToConversation(userID, convertedNewConversation))
      );

      setLoading(false);

      navigation.navigate("Group Room Conversation Room", { groupRoomConversationID: convertedNewConversation, users: users, groupRoomConversationName: newConversationName });
    } catch (e) {
      console.log(e);
      setLoading(false);
      return;
    }
  };
  const pressToCreateConversation = async () => {
      await createConversation(users);
  };

  const renderSeparator = () => (
    <View
    style={{
        backgroundColor: 'grey',
        height: 0.5,
        marginRight: 10,
        marginLeft: 10,
    }}
    />
  );

    return (
        <View style={{ flex:1, paddingHorizontal: 5 }}>
            <FlatList
                onEndReachedThreshold={0}
                onEndReached={fetchMessagesPage}
                data={messages}
                renderItem={({ item }) => 
                  <GroupChatMessage 
                    myId={myId} 
                    myName={myName}
                    message={item} 
                    setAsMessageReply={() => setMessageReplyTo(item)}
                  />
                }
                inverted
                showsVerticalScrollIndicator={false}
            />

            <GroupInputBox 
              groupRoomID={groupRoomID} 
              usersTokens={usersTokens}
              groupRoomName={groupRoomName}
              CRUID={CRUID}
              myId={myId}
              myName={myName}
              inputBoxListUsers={inputBoxListUsers}
              messageReplyTo={messageReplyTo} 
              removeMessageReplyTo={() => setMessageReplyTo(null)}
            />

            { poundBoolean === true ? 
              <View style={{ width: '95%', position: "absolute", borderWidth: 1, alignSelf: "center", borderRadius: 10, backgroundColor: "white", height: "48%", marginTop: 13 }} >
                { groupRoomConversations.length < 1 ?
                  <Text style={{ flex:1, fontStyle: "italic", fontSize: 17, textAlign: "center", color: "#D3D3D3", marginTop: 135 }} >No active conversations. Start one!</Text>
                  :
                  <FlatList 
                  ItemSeparatorComponent={renderSeparator}
                  data={groupRoomConversations}
                  renderItem={({ item }) => <GroupRoomConversationListItem groupRoomConversation={item.groupRoomConversation} role={role} userID={userID} conversationUsersToken={conversationUsersToken} /> } 
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  />
                }

                <View style={{alignItems: "center", flexDirection: "row", borderTopWidth: 0.5}}>
                    <View style={styles.mainContainer}>
                      <TextInput 
                          style={styles.textInput} 
                          placeholder='Enter name (40 max characters)'
                          multiline
                          value={textInput}
                          onChangeText={setTextInput}
                          maxLength={40}
                          numberOfLines={1}
                      />
                    </View>

                    {loading ?
                      <View 
                        style={[styles.buttons, { padding: 17, height: 56 }]}
                      >
                        <ActivityIndicator size="small" color="white" />
                      </View>
                    :
                      <TouchableOpacity 
                      style={styles.buttons}
                      onPress={pressToCreateConversation}
                      >
                        <Ionicons name= "add-outline" size={30} color="white"/>
                      </TouchableOpacity>
                    }
                </View>

              </View>
              :
              null
            }

        </View>
    )
}

const styles = StyleSheet.create({
  text: {
      fontFamily: "Avenir Next", 
      color: "white", 
      fontSize: 10, 
      fontWeight: '500',
  },
  buttons: {
      backgroundColor: "#00BFFF",
      borderBottomRightRadius: 10,
      padding: 12,
      justifyContent: "center",
      alignItems: "center",
    },
  textInput: {
    flex: 1,
    fontSize: 16,
  },
  mainContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 40,
    marginRight: 10,
    width: "84%"
  },
})

export default GroupRoomScreen;

// idea for avatar and name in custom header:
