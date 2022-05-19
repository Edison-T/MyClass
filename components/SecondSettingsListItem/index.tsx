import React, {useState} from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Pressable, TouchableWithoutFeedback } from 'react-native';
import { ChatRoom, GroupRoom, Message } from '../../types';
import styles from './style';
import moment from 'moment';
import SecondSettingsConversationsListItem from '../SecondSettingsConversationsListItem'; // A.K.A 'index.tsx'
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { Auth, graphqlOperation, API } from 'aws-amplify';
import {S3Image} from 'aws-amplify-react-native';

import { getChatRoom, getGroupRoom, messagesByChatRoom } from '../../src/graphql/queries';
import * as mutations from '../../src/graphql/mutations';
import { createMessage, updateChatRoom } from "../../src/graphql/mutations";
import { getUser } from '../../Screens/queries';

export type ChatListItemProps = {
    groupRoom: GroupRoom;
    messages: Message;
    role: string;
    userID: String;
    style: any
}

const SecondSettingsListItem = (props: ChatListItemProps) => {
    const { groupRoom, role, userID } = props;

    const cruID = (groupRoom.groupRoomUsers.items.filter((i) => i.userID === userID))
    const allNotifications = (cruID.map(i => i.allowAllNotifications).toString())
    const selectedNotifications = (cruID.map(i => i.allowSelectedNotifications).toString())

    const [radioButton1, setRadioButton1] = useState(eval(allNotifications));
    const [radioButton2, setRadioButton2] = useState(eval(selectedNotifications));
    const [groupRoomConversations, setGroupRoomConversations] = useState([]);

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

    const onClickSelectedNotifications = async () => {
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

    const fetchConversations = async () => {
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
        fetchConversations();
        
    }), [userID]
   
    return ( 
        <View>
            <View style={styles.container}>
                <View style={styles.leftContainer}>
                    <S3Image 
                        imgKey={groupRoom.imageUri} 
                        style={{ width: 60,  height: 60, aspectRatio: 1, borderRadius: 50, marginRight: 15}} 
                        resizeMode="contain"
                    />

                    <View style={styles.midContainer}>
                        <Text style={styles.chatName} numberOfLines={1}>{groupRoom.name}</Text>
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

            { groupRoomConversations.length > 0 ?
                <View>
                    <Text style={[styles.chatName, { left: 10, textDecorationLine: "underline" }]}>Conversations:</Text>

                    <FlatList 
                        style={{ width: '100%' }}
                        ItemSeparatorComponent={renderSeparator}
                        data={groupRoomConversations}
                        renderItem={({ item }) => <SecondSettingsConversationsListItem groupRoomConversation={item.groupRoomConversation} role={role} userID={userID} /> }//onLongPress={() => confirmDelete(item.chatRoom)}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                    /> 
                    {/* HEY CPU is high when conversation flatlist is added. It makes the list too long and makes your performance too slow. Should we ditch it? */}
                </View>
                :
                null
            }

        </View>
)
};

export default SecondSettingsListItem;
