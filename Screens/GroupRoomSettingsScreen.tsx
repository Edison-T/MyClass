import React, {useLayoutEffect} from "react";
import { useNavigation, useRoute } from '@react-navigation/native';
import { Text, View, TouchableOpacity, StyleSheet, SafeAreaView, Button, ScrollView, FlatList, Alert, Platform, Image, ActivityIndicator } from "react-native";
import {API, graphqlOperation, Auth, Storage } from "aws-amplify";
import {S3Image} from 'aws-amplify-react-native';

import { getChatRoomUser, listChatRooms, getUser } from "../src/graphql/queries";
import { getChatRoom, getGroupRoom } from "./queries";
import uuid from 'react-native-uuid';
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import { useEffect } from "react";
import ChatRoomListUsers from "../components/ChatRoomListUsers";
import { listChatRoomUsers } from "../src/graphql/queries";
import { TextInput } from "react-native-gesture-handler";
import { onUpdateChatRoom, onUpdateGroupRoom } from "../src/graphql/subscriptions";
import { Avatar } from "react-native-elements/dist/avatar/Avatar";
import { Ionicons } from '@expo/vector-icons';
import * as mutations from '../src/graphql/mutations';


const GroupRoomSettingsScreen = ({route}) => {
    const [me, setMe] = useState(null)
    const [users, setUsers] = useState ([]);
    const [groupRoomUserID, setGroupRoomUserID] = useState([]);
    const [groupRoomName, setGroupRoomName] = useState('');
    const [groupRoomImage, setGroupRoomImage] = useState('');
    const [newGroupName, setNewGroupName] = useState(groupRoomName);
    const [image, setImage] = useState<string | null>(null);
    const [newNameLoading, setNewNameLoading] = useState(false)
    const [newImageLoading, setNewImageLoading] = useState(false)

    const navigation = useNavigation();
    const {groupID} = route.params;

    useEffect(() => {
        (async () => {
          if (Platform.OS !== "web") {
            const libraryResponse =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (
              libraryResponse.status !== "granted"
            ) {
              alert("Sorry, we need camera roll permissions to make this work!");
            }
          }
        })();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
        console.log(result);
    
        if (!result.cancelled) {
          setImage(result.uri);
        }
    };

    const updateImage = async () => {
        if(!image) {
            Alert.alert('You forgot to insert an image!', 'Click on the class image to access your photo library.')
            return;
        }
        setNewImageLoading(true)
        const blob = await getBlob(image);
        const {key} = await Storage.put(`${uuid.v4()}.png`, blob);

        try {
            const groupDetails = {
               id: groupID,
               imageUri: key,
            };
            await API.graphql({ query: mutations.updateGroupRoom, variables: {input: groupDetails}})
            alert('Successfully updated picture!')
        } catch(e) {
           alert('Could not update class image. Please try again.')
       }
       setImage(image)
       setNewImageLoading(false)
    };

    const getBlob = async (uri: string) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob;
    }

    useLayoutEffect (() => {
        navigation.setOptions({
              headerLeft: () => (
                <View>
                  <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => navigation.navigate('Group Room', {
                      name: groupRoomName
                  })}>
                  <Ionicons
                        name="chevron-back-outline" 
                        size={35}
                        color = 'white'
                    />
                </TouchableOpacity>
                </View>
              )
        }), [navigation]});

    const updateClass = async () => {
        if(!newGroupName) {
            Alert.alert("You forgot to edit the name!", "Click on the text field to edit.")
            return null;
        }
        setNewNameLoading(true)
        try {
             const groupDetails = {
                id: groupID,
                name: newGroupName,
        };
        await API.graphql({ query: mutations.updateGroupRoom, variables: {input: groupDetails}})
        alert('Successfully updated group!')
        } catch(e) {
            alert('Could not update group. Please try again.')
        }
        //if else statement to prevent an empty newChatName???
        setNewGroupName('')
        setNewNameLoading(false)
    }
    
    const fetchChatRoomInfo = async () => {
        try {
            const me = await Auth.currentAuthenticatedUser();
            const myID = me.attributes.sub
            const userData = await API.graphql(
                graphqlOperation(
                    getGroupRoom, {
                        id: groupID,
                        name: groupID,
                        imageUri: groupID,
                    }
                )
            )
            setGroupRoomName(userData.data.getGroupRoom.name)
            setGroupRoomImage(userData.data.getGroupRoom.imageUri)
            const allUsers = (userData.data.getGroupRoom.groupRoomUsers.items.map(cru => cru.user))
            setUsers(allUsers.filter(u => u.id !== myID))
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        const fetchChatRoomUserID = async () => {
            try {
            const userInfo = await Auth.currentAuthenticatedUser();
            const userData = await API.graphql(
                graphqlOperation(
                    getUser, {
                        id: userInfo.attributes.sub,
                    }
                )
            )
            setGroupRoomUserID(userData.data.getUser.groupRoomUser.items.find((cru) => cru.groupRoomID === groupID).id)
            setMe(userData.data.getUser.id)
            } catch (e) {
            Alert.alert('Oops! An error has occurred')
            console.log(e);
            return;
            }
        }
        fetchChatRoomUserID();
    }, [])

    useEffect(() => {
        fetchChatRoomInfo();
    }, [])

    useEffect(() => {
        const subscription = API.graphql(
          graphqlOperation(onUpdateGroupRoom)
        ).subscribe({
          next: () => {
            fetchChatRoomInfo();
          }
        });
    
        return () => subscription.unsubscribe();
    }, []);

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

    const deleteClassButton = async (user) => {
        try {
            const userID = {
                id: groupRoomUserID,
            };
              
            const userData = await API.graphql({ 
                query: mutations.deleteGroupRoomUser, 
                variables: {input: userID}
            });

            console.log(userData.data.deleteGroupRoomUser)
        } catch (e) {
            Alert.alert('Oops! An error has occurred')
            console.log(e);
            return;
        }
        setUsers(users.filter((u) => u.id !== user.id))
        navigation.navigate("Groups Home Screen")
        console.log('chatRoomUser was successfully deleted')
    }

    const deleteButton = (user) => {
        Alert.alert(
            `Leave?`,
            `Are you sure you want to leave this group?`,
            [
                {
                    text: "Leave",
                    onPress: () => deleteClassButton(user),
                    style: "destructive"
                },
                {
                    text: "Cancel"
                }
            ]
        )
    }

    // oooooooooooooo

    const confirmDelete = (user) => {
        if(user.id === me) {
            return;
        }
        Alert.alert(
            "Remove?",
            `Are you sure you want to remove "${user.name}" from this group?`,
            [
                {
                    text: "Remove",
                    onPress: () => deleteUser(user),
                    style: "destructive"
                },
                {
                    text: "Cancel"
                }
            ]
        )
    }

    const deleteUser = async (user) => {
        const getGroupRoomUserID =
            await API.graphql(
                graphqlOperation(
                    getGroupRoom, {
                        id: groupID,
                    }
                )
            ) 
        const groupRoomUserID = (getGroupRoomUserID.data.getGroupRoom.groupRoomUsers.items.find((cru) => cru.userID === user.id).id)

        if (groupRoomUserID) {
            try {
            const grouproomUserID = {
                id: groupRoomUserID,
            };
            await API.graphql({ 
                query: mutations.deleteGroupRoomUser, 
                variables: {input: grouproomUserID}
            });
            setUsers(users.filter((u) => u.id !== user.id))
            }
            catch (e) {
                Alert.alert("Oops!", "Could not remove user!")
                return;
            }
            
        }
    }



    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.avatar}>
                    <View style={styles.AvatarMargin}>
                        <TouchableOpacity activeOpacity={0.5} onPress={pickImage}>
                            {image ? 
                            <Image 
                            source={{uri: image}}
                            style={{ width: 150,  height: 150, aspectRatio: 1, borderRadius: 100}} 
                            />
                            :
                            <S3Image 
                                imgKey={groupRoomImage} 
                                style={{ width: 150,  height: 150, aspectRatio: 1, borderRadius: 100}} 
                            />
                            }
                                                       
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={updateImage}
                    >
                        <View style={styles.editButton}>
                            {newImageLoading ? 
                                <ActivityIndicator size="small" color="#00BFFF" />
                                :
                                <Ionicons
                                name="checkmark-outline" 
                                size={20}
                                color = '#00BFFF'
                            />
                            }
                        </View>
                    </TouchableOpacity>
                </View>           

                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.textInput}
                        placeholder={groupRoomName} 
                        value={newGroupName} 
                        onChangeText={(text) => setNewGroupName(text)}
                        clearButtonMode="always"
                        />
                    <TouchableOpacity
                        onPress={updateClass}
                        activeOpacity={0.5}
                    >
                        <View style={styles.editButton}>
                            {newNameLoading ? 
                                <ActivityIndicator size="small" color="#00BFFF" />
                                :
                                <Ionicons
                                    name="checkmark-outline" 
                                    size={20}
                                    color = '#00BFFF'
                                />
                            }
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.codeDescriptionContainer}>
                    <Text style={styles.smallText}>This is your group code! Share this with your group members!</Text>
                    <Text style={styles.TextComponentStyle}>{groupID}</Text>
                </View>

                { users.length > 0 ?
                    <View>
                        <FlatList
                            style={{ width: '100%', marginBottom: 30, borderWidth: 0.5, borderRadius: 15}} //add height or just use scrollview?
                            ItemSeparatorComponent={renderSeparator}
                            data={users}
                            renderItem={({ item }) => <ChatRoomListUsers user={item} chatRoom={item} onLongPress={() => confirmDelete(item)} />}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                    :
                    <Text style={[styles.smallText, {top: -20, borderWidth: 0.5, borderRadius: 10, padding: 5}]}>It's just you! Invite some people!</Text>
                }

                <TouchableOpacity
                    onPress={deleteButton}
                    activeOpacity={0.5}
                    style={styles.codeDescriptionContainer}>
                    <View style={styles.buttons}>
                        <Text style={[styles.text, {color: "white", fontWeight: "600", fontSize: 18 }]}>
                            Leave Group
                        </Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

//******The ClassRoom title name does not update; try reverse route params to
// update the name in real time!! */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10
    },
    codeDescriptionContainer: {
        alignItems: "center",
        marginBottom: 50
    },
    bigText: {
        fontFamily: "Avenir Next",
        color: "#1D2029",
        fontSize: 35,
        fontWeight: '700',
        textAlign: 'center'
      },
    smallText: {
        fontFamily: "Avenir Next",
        color: "#ABB4BD",
        fontSize: 20,
        textAlign: 'center',
    },
    text: {
        fontFamily: "Avenir Next",
        color: "#1D2029",
        fontSize: 30,
        fontWeight: '500'
      },
    buttons: {
        backgroundColor: "red",
        fontSize: 16,
        borderRadius: 8,
        paddingVertical: 13,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        shadowColor: "rgba(20, 40, 100, 0.20)",
        shadowOffset: {width:0, height:9},
        shadowOpacity: 1,
        shadowRadius: 20,
        width: 275,
      },
    editButton: {
        backgroundColor: "white",
        fontSize: 16,
        borderRadius: 8,
        paddingVertical: 15,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "rgba(20, 40, 100, 0.20)",
        shadowOffset: {width:0, height:2},
        shadowOpacity: 1,
        shadowRadius: 5,
        width: 50,
    },
    inputContainer: {
        marginBottom: 50,
        marginTop: 20,
        flexDirection: "row",
        justifyContent: 'center',
        alignItems: "center",
    },
    textInput: {
        alignItems: 'center',
        textAlign: 'center',
        height: 70,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 20,
        fontSize: 25,
        fontFamily: 'Avenir Next',
        width: 320,
        marginRight: 20
    },
    TextComponentStyle: {
        borderRadius: 17,
        width: 250,
        borderWidth: 4,
        borderColor: 'black',
        backgroundColor : "transparent",
        padding : 12,
        textAlign: 'center',
        margin: 10,
        fontFamily: "Avenir Next",
        color: "#1D2029",
        fontSize: 40,
        fontWeight: '700',
    },
    avatar: {
        alignSelf: 'center',
        marginBottom: 10,
        marginTop: 20,
        flexDirection: "row",
        justifyContent: 'center',
        alignItems: "center",
    },
    AvatarMargin: {
        marginRight: 20
    }
      
})

export default GroupRoomSettingsScreen;