import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Pressable, TouchableWithoutFeedback } from 'react-native';
import { ChatRoom, GroupRoom, Message } from '../../types';
import styles from './style';
import moment from 'moment';
import Swipeout from 'react-native-swipeout';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import ConversationListItem from '../ConversationListItem'; // A.K.A 'index.tsx'
import { Auth, graphqlOperation, API } from 'aws-amplify';
import {S3Image} from 'aws-amplify-react-native';
import { Ionicons } from '@expo/vector-icons';

import { getChatRoom, getGroupRoom, getUser } from '../../Screens/queries';
import * as mutations from '../../src/graphql/mutations';
import { onCreateConversationUser, onCreateGroupRoomConversationUser, onDeleteConversationUser, onDeleteGroupRoomConversation, onUpdateConversation, onUpdateConversationUser, onUpdateGroupRoomConversation, onUpdateGroupRoomConversationUser } from '../../src/graphql/subscriptions';
import GroupRoomConversationListItem from '../GroupRoomConversationListItem';

export type GroupRoomListItemProps = {
    groupRoom: GroupRoom;
    messages: Message;
    role: string;
    userID: String;
    chatRooms: any
}

const GroupRoomListItem = (props: GroupRoomListItemProps) => {
    const [groupRoomConversations, setGroupRoomConversations] = useState([]);
    const [groupRoomConversationUsersToken, SetGroupRoomConversationUsersToken] = useState([]);
    const [groupRoomConversationsButton, setGroupRoomConversationsButton] = useState(false);
    const { groupRoom, role, userID, } = props;

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
    const navigation = useNavigation();
    const updateGroupRoomUserLastRead = async () => {
        if(groupRoom.lastMessage) {
            const userID = await Auth.currentAuthenticatedUser();
            try {
                const userData = await API.graphql(
                    graphqlOperation(
                        getGroupRoom, {
                            id: groupRoom.id,
                        }
                    )
                )
                const currentGroupRoomUserID = (userData.data.getGroupRoom.groupRoomUsers.items.find((cru) => cru.userID === userID.attributes.sub).id)
                await API.graphql(
                    graphqlOperation(
                        mutations.updateGroupRoomUser, {
                            input: {
                                id: currentGroupRoomUserID,
                                lastMessageReadTimeStamp: groupRoom.lastMessage.updatedAt
                            }
                        }
                    )
                )
            } catch (e) {
                console.log(e);
                return;
            }      
        } else {
            return;
        }
            
    }

    const cruID = (groupRoom.groupRoomUsers.items.filter((i) => i.userID === userID))
    const timeStamp = (cruID.map(i => i.lastMessageReadTimeStamp)).toString()
    const unreadMessage = (groupRoom.messages.items.filter((i) => i.createdAt > timeStamp))
    const unreadMessageTimeStamp = (unreadMessage.map(i=> i.createdAt)) // displays the objects after the timestamp from "objects"
    const numberOfUnread = (unreadMessageTimeStamp.filter(Boolean).length) //number of unread

    const announcementTimeStamp = (cruID.map(i => i.lastAnnouncementReadTimeStamp)).toString()
    const unreadAnnouncement = (groupRoom.announcements.items.filter((i) => i.createdAt > announcementTimeStamp))
    const unreadAnnouncementTimeStamp = (unreadAnnouncement.map(i=> i.createdAt))
    const numberOfAnnouncementsUnread = (unreadAnnouncementTimeStamp.filter(Boolean).length) //number of unread

  const fetchGroupRoomConversations = async () => {
    try {
        const userData = await API.graphql(
            graphqlOperation(
                getUser, {
                    id: userID,
                }
            )
        )
        setGroupRoomConversations(userData.data.getUser.groupRoomConversationUser.items.filter(i => i.groupRoomConversation.groupRoomID === groupRoom.id))
    } catch (e) {
        console.log(e);
    }
  };
  
  useEffect(() => {
      fetchGroupRoomConversations()
      return;
  }, [userID])
    
  const onClick = () => {
    updateGroupRoomUserLastRead();
        navigation.navigate('Group Room', {
            groupRoomID: groupRoom.id,
            groupRoomName: groupRoom.name,
            groupRoomImage: groupRoom.imageUri,
            role: role,
            groupRoomConversations: groupRoomConversations,
            userID: userID,
        })
  }

  const listOfConversations = (groupRoomConversations.map(i => i.id))

    useEffect(() => {
        const subscription = API.graphql(
        graphqlOperation(onUpdateGroupRoomConversation)
        ).subscribe({
        next: (data) => {
            const updatedConversation = data.value.data.onUpdateGroupRoomConversation.id;
            const checksListIfIDExists = (listOfConversations.includes(updatedConversation))
            if (checksListIfIDExists) {
            fetchGroupRoomConversations()
            } else {
            return;
            }
        } 
        });
        return () => subscription.unsubscribe();
    }, [groupRoomConversations]);

    useEffect(() => {
        const subscription = API.graphql(
        graphqlOperation(onCreateGroupRoomConversationUser)
        ).subscribe({
        next: (data) => {
            const newConversationUser = data.value.data.onCreateGroupRoomConversationUser.user.id
            if (newConversationUser === userID) {
            fetchGroupRoomConversations()
            } else {
            return;
            }
        }
        });
        return () => subscription.unsubscribe();
    }, [userID]);

    useEffect(() => {
        const subscription = API.graphql(
        graphqlOperation(onUpdateGroupRoomConversationUser)
        ).subscribe({
        next: (data) => {
            const updatedConversationUser = data.value.data.onUpdateGroupRoomConversationUser.user.id
            if (updatedConversationUser === userID) {
                fetchGroupRoomConversations()
            } else {
                return;
            }  
        }
        });
        return () => subscription.unsubscribe();
    }, [userID]);

    useEffect(() => {
        const subscription = API.graphql(
          graphqlOperation(onDeleteGroupRoomConversation)
        ).subscribe({
          next: (data) => {
            const deletedUserID = data.value.data.onDeleteGroupRoomConversation.user.id
              if (deletedUserID === userID) {
                fetchGroupRoomConversations()
              } else {
                return;
              }          
          }
        });
        return () => subscription.unsubscribe();
    }, [userID]);

    return ( 
            <View>
                <TouchableOpacity onPress={onClick} activeOpacity={0.5} style={styles.container}>
                    <View style={styles.leftContainer}>
                        <S3Image 
                            imgKey={groupRoom.imageUri} 
                            style={{ width: 60,  height: 60, aspectRatio: 1, borderRadius: 50, marginRight: 15}} 
                        />
                        <View style={styles.midContainer}>
                            <Text style={styles.username}>{groupRoom.name}</Text>
                            <Text 
                                numberOfLines={1} 
                                style={[styles.lastMessage, {marginRight: numberOfAnnouncementsUnread > 0 ? 90 : 30 && numberOfUnread > 0 ? 60 : 30}]}>
                                {groupRoom.lastMessage 
                                ? `${groupRoom.lastMessage.user.name}: ${groupRoom.lastMessage.content}`
                                : ""}
                            </Text>
                        </View> 
                        
                    </View>

                    <View>
                    <Text style={styles.time}>
                        {groupRoom.lastMessage && moment.utc(groupRoom.lastMessage.updatedAt).local().startOf('seconds').fromNow()}
                    </Text>

                        {   !groupRoomConversationsButton ?
                            <View style={{width: 39, height: 39, borderRadius: 35, backgroundColor: "white", position: "absolute", top: 21, justifyContent: "center", alignSelf: "flex-end" }} >
                                <Ionicons name="chevron-down-outline" size={17} color="black" style={{ alignSelf: "center" }} onPress={() => {setGroupRoomConversationsButton((currentValue) => !currentValue)}}/>
                            </View>
                            :
                            null
                        }

                        {   groupRoomConversationsButton ?
                            <View style={{width: 39, height: 39, borderRadius: 35, backgroundColor: "white", position: "absolute", top: 21, justifyContent: "center", alignSelf: "flex-end" }} >
                                <Ionicons name="chevron-up-outline" size={17} color="black" style={{ alignSelf: "center" }} onPress={() => {setGroupRoomConversationsButton((currentValue) => !currentValue)}}/>
                            </View>
                            :
                            null
                        }

                        { numberOfUnread > 0 && numberOfUnread < 10
                            ?
                            <View style={{width: 27, height: 27, borderRadius: 35, backgroundColor: "#00BFFF", position: "absolute", alignSelf: "flex-end", top: 28, right: 45, justifyContent: "center" }} >
                                <Text style={{textAlign: "center", fontSize: 15, color: "white"}}>{numberOfUnread}</Text>
                            </View>
                            :
                            null
                        }
                        { numberOfUnread > 9
                            ?
                            <View style={{width: 27, height: 27, borderRadius: 35, backgroundColor: "#00BFFF", position: "absolute", alignSelf: "flex-end", top: 28, right: 45, justifyContent: "center" }} >
                                <Text style={{textAlign: "center", fontSize: 15, color: "white"}}>9+</Text>
                            </View>
                            :
                            null
                        }
                        
                        {   numberOfAnnouncementsUnread > 0 && numberOfAnnouncementsUnread < 10 ?
                            <View style={{width: 27, height: 27, borderRadius: 35, backgroundColor: "red", position: "absolute", top: 28, right: 78, justifyContent: "center", alignSelf: "flex-end" }} >
                                <Text style={{textAlign: "center", fontSize: 15, color: "white"}}>{numberOfAnnouncementsUnread}</Text>
                            </View>
                            :
                            null
                        } 

                        {   numberOfAnnouncementsUnread > 9 ?
                            <View style={{width: 27, height: 27, borderRadius: 35, backgroundColor: "red", position: "absolute", top: 28, right: 78, justifyContent: "center", alignSelf: "flex-end" }} >
                                <Text style={{textAlign: "center", fontSize: 15, color: "white"}}>9+</Text>
                            </View>
                            :
                            null
                        }

                    </View>
                </TouchableOpacity>

                { groupRoomConversationsButton ?
                    <FlatList 
                    style={{ width: '100%' }}
                    ItemSeparatorComponent={renderSeparator}
                    data={groupRoomConversations}
                    renderItem={({ item }) => <GroupRoomConversationListItem groupRoomConversation={item.groupRoomConversation} role={role} userID={userID} /> }
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    />
                    :
                    null
                }

            </View>
            
    )
};

export default GroupRoomListItem;
