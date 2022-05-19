import React, {useEffect, useLayoutEffect, useContext, useRef, useCallback} from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Avatar } from "react-native-elements";
import { StatusBar } from "expo-status-bar";
import GroupRoomListItem from '../components/GroupRoomListItem'; // A.K.A 'index.tsx'
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import ChatRooms from '../data/ChatRooms';
import GroupNewMessageButton from '../components/GroupNewMessageButton';
import ChooseYourRoleButton from '../components/ChooseYourRoleButton';
import { User } from '../types';

import { API, graphqlOperation, Auth } from 'aws-amplify';
import * as mutations from '../src/graphql/mutations';
import * as queries from '../src/graphql/queries';
import { getUser } from './queries';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { onCreateChatRoom, onCreateChatRoomUser, onCreateGroupRoomConversation, onCreateGroupRoomConversationUser, onCreateGroupRoomUser, onDeleteAnnouncement, onDeleteChatRoom, onDeleteChatRoomUser, onDeleteGroupAnnouncement, onDeleteGroupRoomConversation, onDeleteGroupRoomConversationUser, onDeleteGroupRoomUser, onUpdateAnnouncement, onUpdateChatRoom, onUpdateChatRoomUser, onUpdateGroupAnnouncement, onUpdateGroupRoom, onUpdateGroupRoomConversation, onUpdateGroupRoomConversationUser, onUpdateGroupRoomUser, onUpdateUser } from '../src/graphql/subscriptions';


const GroupRoomHomeScreen = ({navigation, route}) => {
    const [groupRooms, setGroupRooms] = useState ([]); //should i do [null] instead?
    const [userID, setUserID] = useState('')
    const [role, setRole] = useState('none');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(true);

    //or maybe use props from types because useState is too buggy?
    
    const fetchGroupRooms = async () => {
          try {
            //setLoading(true)
            const userInfo = await Auth.currentAuthenticatedUser();

            const userData = await API.graphql(
                graphqlOperation(
                    getUser, {
                        id: userInfo.attributes.sub,
                    }
                )
            )

            setGroupRooms(userData.data.getUser.groupRoomUser.items);  
            setRole(userData.data.getUser.role);
            setUserID(userData.data.getUser.id);
            //setLoading(false);
            setRefreshing(false);


        } catch (e) {
            console.log(e);
            return
        }
    }    
    useEffect(() => {
        fetchGroupRooms();
        //console.log(chatRooms.map(i => i.chatRoomID))
      }, [userID])

    const listOfGroupRooms = (groupRooms.map(i => i.groupRoomID))
    useEffect(() => {
        const subscription = API.graphql(
          graphqlOperation(onUpdateGroupRoom)
        ).subscribe({
          next: (data) => {
            const updatedGroupRoom = data.value.data.onUpdateGroupRoom.id;
            const checksListIfIDExists = (listOfGroupRooms.includes(updatedGroupRoom))
            if (checksListIfIDExists) {
              fetchGroupRooms()
            } else {
              //console.log("This room does not exist for this user")
              return;
            }
    
          } // doesn't work because it gives us an empty array of chatrooms when the user logs in. So weird; chatrooms are not set in this screen, but does on the list items.... However, when we refresh this code, it works, but we must manually refresh this code screen.
        });
        return () => subscription.unsubscribe();
    }, [groupRooms]);

    useEffect(() => {
        const subscription = API.graphql(
          graphqlOperation(onCreateGroupRoomUser)
        ).subscribe({
          next: (data) => {
            const newUserID = data.value.data.onCreateGroupRoomUser.user.id
            
            if (newUserID === userID) {
              fetchGroupRooms()
            } else {
              //console.log("This room does not exist for this user")
              return;
            }
          }
        });
    
        return () => subscription.unsubscribe();
    }, [userID]);

    useEffect(() => {
      const subscription = API.graphql(
        graphqlOperation(onCreateGroupRoomConversationUser)
      ).subscribe({
        next: (data) => {
          const newUserID = data.value.data.onCreateGroupRoomConversationUser.user.id
          
          if (newUserID === userID) {
            fetchGroupRooms();
          } else {
            //console.log("This room does not exist for this user")
            return;
          }
        }
      });
  
      return () => subscription.unsubscribe();
  }, [userID]);

    useEffect(() => {
        const subscription = API.graphql(
          graphqlOperation(onDeleteGroupRoomUser)
        ).subscribe({
          next: (data) => {
            const deletedUserID = data.value.data.onDeleteGroupRoomUser.user.id
              if (deletedUserID === userID) {
                fetchGroupRooms()
              } else {
                console.log("This room does not exist for this user")
                return;
              }          
          }
        });
        return () => subscription.unsubscribe();
    }, [userID]);

    useEffect(() => {
      const subscription = API.graphql(
        graphqlOperation(onUpdateGroupRoomUser)
      ).subscribe({
        next: (data) => {
          const updatedUserID = data.value.data.onUpdateGroupRoomUser.user.id
            if (updatedUserID === userID) {
              fetchGroupRooms()
            } else {
              //console.log("This room does not exist for this user")
              return;
            }  
        }
      });
  
      return () => subscription.unsubscribe();
    }, [userID]);

    useEffect(() => {
      const subscription = API.graphql(
        graphqlOperation(onUpdateGroupRoomConversation)
      ).subscribe({
        next: (data) => {
          const updatedConversation = data.value.data.onUpdateGroupRoomConversation.groupRoomID;
          const checksListIfIDExists = (listOfGroupRooms.includes(updatedConversation))
          if (checksListIfIDExists) {
            fetchGroupRooms()
          } else {
            //console.log("This room does not exist for this user")
            return;
          }
  
        } // doesn't work because it gives us an empty array of chatrooms when the user logs in. So weird; chatrooms are not set in this screen, but does on the list items.... However, when we refresh this code, it works, but we must manually refresh this code screen.
      });
      return () => subscription.unsubscribe();
  }, [groupRooms]);

    useEffect(() => {
      const subscription = API.graphql(
        graphqlOperation(onUpdateGroupRoomConversationUser)
      ).subscribe({
        next: (data) => {
          const updatedUserID = data.value.data.onUpdateGroupRoomConversationUser.user.id
            if (updatedUserID === userID) {
              fetchGroupRooms()
            } else {
              //console.log("This room does not exist for this user")
              return;
            }  
        }
      });
  
      return () => subscription.unsubscribe();
    }, [userID]);

    useEffect(() => {
      const subscription = API.graphql(
        graphqlOperation(onDeleteGroupAnnouncement)
      ).subscribe({
        next: (data) => {
          const deletedAnnouncement = data.value.data.onDeleteGroupAnnouncement.groupRoomID;
          const checksListIfIDExists = (listOfGroupRooms.includes(deletedAnnouncement))
            if (checksListIfIDExists) {
              fetchGroupRooms()
            } else {
              //console.log("This room does not exist for this user")
              return;
            }
        }
      });

      return () => subscription.unsubscribe();
    }, [groupRooms]);

    useEffect(() => {
      const subscription = API.graphql(
        graphqlOperation(onUpdateGroupAnnouncement)
      ).subscribe({
        next: (data) => {
          const updatedAnnouncement = data.value.data.onUpdateGroupAnnouncement.groupRoomID;
          const checksListIfIDExists = (listOfGroupRooms.includes(updatedAnnouncement))
          if (checksListIfIDExists) {
            fetchGroupRooms()
          } else {
            //console.log("This room does not exist for this user")
            return;
          }    }
      });

      return () => subscription.unsubscribe();
    }, [groupRooms]);

    useEffect(() => {
      const subscription = API.graphql(
        graphqlOperation(onCreateGroupRoomConversation)
      ).subscribe({
        next: (data) => {
          const groupRoomConversation = data.value.data.onCreateGroupRoomConversation.groupRoomID;
          const checksListIfIDExists = (listOfGroupRooms.includes(groupRoomConversation))
          if (checksListIfIDExists) {
            fetchGroupRooms()
          } else {
            //console.log("This room does not exist for this user")
            return;
          }    }
      });

      return () => subscription.unsubscribe();
    }, [groupRooms]);

    // useEffect(() => {
    //   const subscription = API.graphql(
    //     graphqlOperation(onUpdateUser)
    //   ).subscribe({
    //     next: (data) => {
    //       const updatedUserID = data.value.data.onUpdateUser.id
    //         if (updatedUserID === userID) {
    //           fetchGroupRooms()
    //         } else {
    //           //console.log("This room does not exist for this user")
    //           return;
    //         }  
    //     }
    //   });
  
    //   return () => subscription.unsubscribe();
    // }, [userID]);

    useEffect(() => {
      const subscription = API.graphql(
        graphqlOperation(onDeleteGroupRoomConversationUser)
      ).subscribe({
        next: (data) => {
          const deletedUserID = data.value.data.onDeleteGroupRoomConversationUser.user.id
            if (deletedUserID === userID) {
              fetchGroupRooms()
            } else {
              console.log("This room does not exist for this user")
              return;
            }          
        }
      });
      return () => subscription.unsubscribe();
  }, [userID]);

    const navigateToSettings = () => {
        navigation.navigate('Settings', { role: role, userID: userID});
    };

    useLayoutEffect (() => {
        navigation.setOptions({
            title: "My Groups",
            headerStyle: { backgroundColor: "#00BFFF" },
            headerTitleStyle: {color: "white"},
            headerLeft: () => (
              <View style={{ marginLeft: 20 }}>
                <TouchableOpacity
                    onPress={navigateToSettings}
                >
                    <Ionicons
                      name="person-circle-outline" 
                      size={40}
                      color = 'white'
                  />
                </TouchableOpacity>
              </View>)}), [navigation]});

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

    useEffect(() => {
      const gestureHandler = navigation.addListener('focus', fetchGroupRooms); 
      return () => {
        gestureHandler;
      };
    }, [navigation]); // not very optimal because it fetches the function every time you focus on this screen. We're only doing this because this is the only way to update the screen after you choose a role.

    return (
        <View style={styles.container}>
            <StatusBar style="light"/>
            {/* {refreshing ? <ActivityIndicator /> : null}
            {loading ? 
                <View style={{alignItems: "center", justifyContent: "center"}}>
                    <ActivityIndicator size="large" color="#00BFFF" />
                 </View>
                 :
                <FlatList
                    style={{ width: '100%' }}
                    ItemSeparatorComponent={renderSeparator}
                    data={groupRooms}
                    renderItem={({ item }) => <GroupRoomListItem groupRoom={item.groupRoom} role={role} userID={userID} /> }
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl refreshing={refreshing} onRefresh={fetchGroupRooms} tintColor="#00BFFF" />
                    }
                />
            } */}
            <FlatList
                    style={{ width: '100%' }}
                    ItemSeparatorComponent={renderSeparator}
                    data={groupRooms}
                    renderItem={({ item }) => <GroupRoomListItem groupRoom={item.groupRoom} role={role} userID={userID} /> }
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl refreshing={refreshing} onRefresh={fetchGroupRooms} tintColor="#7DE1FF" />
                    }
                />
            {/* { component() } */}
            {role === 'none' ? <ChooseYourRoleButton/> : <GroupNewMessageButton/>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: "center",
    },
})

export default GroupRoomHomeScreen