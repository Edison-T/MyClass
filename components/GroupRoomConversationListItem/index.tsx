import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Pressable, TouchableWithoutFeedback } from 'react-native';
import { Conversation, GroupRoomConversation, Message } from '../../types';
import styles from './style';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { Auth, graphqlOperation, API } from 'aws-amplify';
import {S3Image} from 'aws-amplify-react-native';

import * as mutations from '../../src/graphql/mutations';
import { getConversation } from '../../src/graphql/queries';
import { getGroupRoomConversation } from '../../Screens/queries';

export type GroupRoomConversationListItemProps = {
    groupRoomConversation: GroupRoomConversation;
    messages: Message;
    role: string;
    userID: String;
    conversationUsersToken: String
    //onLongPress: () => void
}

const GroupRoomConversationListItem = (props: GroupRoomConversationListItemProps) => {
    const { groupRoomConversation, role, userID, conversationUsersToken } = props;

    const navigation = useNavigation();

    const updateGroupRoomConversationLastRead = async () => {
        const userID = await Auth.currentAuthenticatedUser();
        try {
            const userData = await API.graphql(
                graphqlOperation(
                    getGroupRoomConversation, {
                        id: groupRoomConversation.id,
                    }
                )
            )
            const currentGroupRoomConversationUserID = (userData.data.getGroupRoomConversation.groupRoomConversationUsers.items.find((cru) => cru.userID === userID.attributes.sub).id)
            if (groupRoomConversation.lastMessage) {
                await API.graphql(
                    graphqlOperation(
                        mutations.updateGroupRoomConversationUser, {
                            input: {
                                id: currentGroupRoomConversationUserID,
                                lastMessageReadTimeStamp: groupRoomConversation.lastMessage.createdAt
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

    const onClick = () => {
        updateGroupRoomConversationLastRead();
        navigation.navigate('Group Room Conversation Room', {
            groupRoomConversationID: groupRoomConversation.id,
            groupRoomConversationName: groupRoomConversation.name,
        })
    }

    const cruID = (groupRoomConversation.groupRoomConversationUsers.items.filter((i) => i.userID === userID))
    const timeStamp = (cruID.map(i => i.lastMessageReadTimeStamp)).toString()
    const unreadMessage = (groupRoomConversation.messages.items.filter((i) => i.createdAt > timeStamp))
    const unreadMessageTimeStamp = (unreadMessage.map(i => i.createdAt)) // displays the objects after the timestamp from "objects"
    const numberOfUnread = (unreadMessageTimeStamp.filter(Boolean).length) //number of unread

    return ( 
            <View>
                <TouchableOpacity activeOpacity={0.5} style={styles.container} onPress={onClick}>
                    <View style={styles.leftContainer}>
                        <View style={styles.midContainer}>
                            <Text style={styles.username}># {groupRoomConversation.name}</Text>
                            { numberOfUnread > 0 ?
                                <View style={{ flexDirection: "row", alignItems: "center" }} >
                                    <MaterialCommunityIcons 
                                        name="message-reply"
                                        size={20}
                                        color="#00BFFF"
                                    />
                                    <Text 
                                        numberOfLines={1} 
                                        style={{ color: "#00BFFF", fontWeight: "800", marginLeft: 5 }}>
                                        New Chat
                                    </Text>
                                </View>
                            :
                                <Text 
                                    numberOfLines={1} 
                                    style={styles.lastMessage}>
                                    {groupRoomConversation.lastMessage 
                                    ? `${groupRoomConversation.lastMessage.user.name}: ${groupRoomConversation.lastMessage.content}`
                                    : ""}
                                </Text>
                            }
                        </View> 

                        
                    </View>

                    <View>
                    <Text style={styles.time}>
                        {groupRoomConversation.lastMessage && moment.utc(groupRoomConversation.lastMessage.updatedAt).local().startOf('seconds').fromNow()}
                    </Text>
                    </View>
                </TouchableOpacity>
            </View>
            
        // </Swipeout>
    )
};

export default GroupRoomConversationListItem;