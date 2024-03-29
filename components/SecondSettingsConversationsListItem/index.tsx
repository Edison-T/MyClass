import React, {useState} from 'react';
import { View, Text, Image, TouchableOpacity, Alert, Pressable, TouchableWithoutFeedback } from 'react-native';
import { ChatRoom, Conversation, GroupRoomConversation, Message } from '../../types';
import styles from './style';
import moment from 'moment';
import Swipeout from 'react-native-swipeout';
import { useEffect } from 'react';
import { Auth, graphqlOperation, API } from 'aws-amplify';
import {S3Image} from 'aws-amplify-react-native';
import { getChatRoom, getConversation, getGroupRoomConversation } from '../../Screens/queries';
import * as mutations from '../../src/graphql/mutations';
import { createMessage, updateChatRoom } from "../../src/graphql/mutations";

export type ChatListItemProps = {
    groupRoomConversation: GroupRoomConversation;
    messages: Message;
    role: string;
    userID: String;
    style: any
}

const SecondSettingsConversationsListItem = (props: ChatListItemProps) => {
    const { groupRoomConversation, role, userID } = props;

    const cruID = (groupRoomConversation.groupRoomConversationUsers.items.filter((i) => i.userID === userID))
    const allNotifications = (cruID.map(i => i.allowAllNotifications).toString())
    const selectedNotifications = (cruID.map(i => i.allowSelectedNotifications).toString())

    const [radioButton1, setRadioButton1] = useState(eval(allNotifications));
    const [radioButton2, setRadioButton2] = useState(eval(selectedNotifications));

   

    const onClickSelectedNotifications = async () => {
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
            await API.graphql(
                graphqlOperation(
                    mutations.updateGroupRoomConversationUser, {
                        input: {
                            id: currentGroupRoomConversationUserID,
                            allowAllNotifications: false,
                            allowSelectedNotifications: true,
                        }
                    }
                )
            )
        } catch (e) {
            console.log(e);
            return;
        }
    }

    const onClickAllNotifications = async () => {
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
            await API.graphql(
                graphqlOperation(
                    mutations.updateGroupRoomConversationUser, {
                        input: {
                            id: currentGroupRoomConversationUserID,
                            allowAllNotifications: true,
                            allowSelectedNotifications: false,
                        }
                    }
                )
            )
        } catch (e) {
            console.log(e);
            return;
        }
    }


   
    return ( 
                <View style={styles.container}>
                    <View style={styles.leftContainer}>

                        <View style={styles.midContainer}>
                            <Text style={styles.chatName} numberOfLines={1}>{`# ${groupRoomConversation.name}`}</Text>
                        </View> 

                        <View style={{flexDirection: "row", alignSelf: "center", position: "absolute", right: 20}}>
                            <TouchableOpacity style={{flexDirection: "row", marginRight: 30}} onPress={() => {setRadioButton1(true); setRadioButton2(false); onClickAllNotifications();}}>
                                <View style={[{
                                    height: 24,
                                    width: 24,
                                    borderRadius: 12,
                                    borderWidth: 2,
                                    borderColor: '#00BDFF',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 22
                                }, props.style]}>
                                {
                                    radioButton1 ?
                                    <View style={{
                                        height: 12,
                                        width: 12,
                                        borderRadius: 6,
                                        backgroundColor: '#00BDFF',
                                    }}/>
                                    : null
                                }
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ flexDirection: "row" }} onPress={() => {setRadioButton2(true); setRadioButton1(false); onClickSelectedNotifications();}}>
                                <View style={[{
                                    height: 24,
                                    width: 24,
                                    borderRadius: 12,
                                    borderWidth: 2,
                                    borderColor: '#00BDFF',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }, props.style]}>
                                {
                                    radioButton2 ?
                                    <View style={{
                                        height: 12,
                                        width: 12,
                                        borderRadius: 6,
                                        backgroundColor: '#00BDFF',
                                    }}/>
                                    : null
                                }
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
    )
};

export default SecondSettingsConversationsListItem;
