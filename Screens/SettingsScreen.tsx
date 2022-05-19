import React, {useState, useEffect, useLayoutEffect} from "react";
import { View, StyleSheet, Text, TouchableOpacity, Platform, Alert, Image, ActivityIndicator, FlatList, ScrollView } from "react-native";
import { Avatar, Input } from "react-native-elements";
import { API, graphqlOperation, Auth, Storage } from 'aws-amplify';
import {S3Image} from 'aws-amplify-react-native';
import SettingListItem from '../components/SettingsListItem'; // A.K.A 'index.tsx'
import SecondSettingsListItem from '../components/SecondSettingsListItem'; // A.K.A 'index.tsx'

import { getUser } from "./queries";
import { SafeAreaView } from "react-native-safe-area-context";
import * as mutations from '../src/graphql/mutations';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';
import { onUpdateUser } from "../src/graphql/subscriptions";
import { Ionicons } from '@expo/vector-icons';
import { User } from "../types";
import { useNavigation } from "@react-navigation/native";

// export type SettingsScreenProps = {
//     user: User
//     chatRooms: any
// }


const SettingsScreen = ({updateAuthState, route}) => {

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [groupRooms, setGroupRooms] = useState([]);
    const [chatRooms, setChatRooms] = useState([]);

    const navigation = useNavigation();

    const {userID, role} = route.params;

    const fetchChatRooms = async () => {
        try {
          setLoading(true)
          const userInfo = await Auth.currentAuthenticatedUser();

          const userData = await API.graphql(
              graphqlOperation(
                  getUser, {
                      id: userInfo.attributes.sub,
                  }
              )
          )

          setChatRooms(userData.data.getUser.chatRoomUser.items);
          setGroupRooms(userData.data.getUser.groupRoomUser.items);  
          setLoading(false)
      } catch (e) {
          console.log(e);
      }
  }    

  useEffect(() => {
      fetchChatRooms();
    }, [userID])

    useLayoutEffect (() => {
        navigation.setOptions({
              headerLeft: () => (
                <View>
                  <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => navigation.goBack()}>
                  <Ionicons
                        name="chevron-back-outline" 
                        size={35}
                        color = 'white'
                    />
                </TouchableOpacity>
                </View>
              )
    }), [navigation]});
     
    async function getImageUri () {
             try {
                 const userInfo = await Auth.currentAuthenticatedUser();
                 const usersData = await API.graphql(
                     graphqlOperation(
                         getUser, {
                             id: userInfo.attributes.sub,
                             name: userInfo.attributes.sub,
                             imageUri: userInfo.attributes.sub,
                         }
                     )
                 )
                 setImageUri(usersData.data.getUser.imageUri);
                 setName(usersData.data.getUser.name);

             } catch (e) {
                 console.log(e);
             }
    }

    useEffect(() => {
            getImageUri();
    }, [])

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
    
        if (!result.cancelled) {
          setImage(result.uri);
        }
    };

    const updateImage = async () => {
        if(!image) {
            Alert.alert('You forgot to insert an image!', 'Click on your profile picture to access your photo library.')
            return;
        }
        setLoading(true);
        const blob = await getBlob(image);
        const {key} = await Storage.put(`${uuid.v4()}.png`, blob);

        try {
            const userInfo = await Auth.currentAuthenticatedUser();
            const userDetails = {
                id: userInfo.attributes.sub,
                imageUri: key
        };
        await API.graphql({ query: mutations.updateUser, variables: {input: userDetails}})
        alert('Successfully updated profile picture!')
        setLoading(false)
        } catch(e) {
            console.log(e)
        }
        setImage(image)
    };

    const getBlob = async (uri: string) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob;
    }

    useEffect(() => {
        const subscription = API.graphql(
          graphqlOperation(onUpdateUser)
        ).subscribe({
          next: (data) => {
            const newMessage = data.value.data.onUpdateChatRoom;
            getImageUri();
          }
        });
        return () => subscription.unsubscribe();
    }, []);

    async function signOut() {
        try {
            await Auth.signOut();
            //updateAuthState('loggedOut');
        } catch (error) {
            console.log('error signing out: ', error);
        }
    }

    const alertSignOut = () => {
        Alert.alert(
            `Sign Out?`,
            `Are you sure you want to sign out?`,
            [
                {
                    text: "Sign Out",
                    onPress: () => signOut(),
                    style: "destructive"
                },
                {
                    text: "Cancel"
                }
            ]
        )
    }

    const renderSeparator = () => (
        <View
        style={{
            backgroundColor: 'black',
            height: 1.5,
            marginRight: 10,
            marginLeft: 10,
        }}
        />
    );

    return (
        <View style={styles.container}>
        <ScrollView contentContainerStyle={{ alignItems: "center", paddingVertical: 20 }} showsVerticalScrollIndicator={false}>
            {loading ?
                <View>
                    <ActivityIndicator size="large" color="#00BFFF" />
                </View>
            :
                <View>
                    <View style={styles.imageAndButton}>
                        <View style={styles.AvatarMargin}>
                            <TouchableOpacity onPress={pickImage}>
                                {image ? 
                                    <Image 
                                    source={{uri: image}}
                                    style={{ width: 150,  height: 150, aspectRatio: 1, borderRadius: 100, borderWidth: 2}} 
                                    />
                                    :
                                    <S3Image 
                                        imgKey={imageUri} 
                                        style={{ width: 150,  height: 150, aspectRatio: 1, borderRadius: 100, borderWidth: 2}} 
                                    />
                                }
                            </TouchableOpacity>
                        </View>
            
                        <TouchableOpacity onPress={updateImage} activeOpacity={0.5}>
                            <View style={styles.editButton}>
                                {loading ? 
                                    <ActivityIndicator size="small" color="#00BFFF" />
                                    :
                                    <Ionicons
                                    name="checkmark-outline" 
                                    size={17}
                                    color = '#00BFFF'
                                />
                                }
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.name]}>
                        <Text style={[styles.text, {borderRadius: 10, borderWidth: 1, paddingVertical: 5, paddingHorizontal: 20}]}>{name}</Text>
                    </View>

                    <View style={{alignSelf: "center", borderBottomWidth: 0.5, marginBottom: 15 }}>
                        <Text style={styles.text}>Notifications</Text>
                    </View>

                    <View style={{ width: "80%", borderWidth: 1.5, borderRadius: 18, marginBottom: 23, }}>

                        <View style={{flexDirection: "row", marginBottom: 10, marginTop: 10, width: 400}}>
                            <Text style={[styles.text, { marginRight: 145, left: 10, }]}>Classes</Text>
                            <Text style={[styles.text, { fontSize: 13, width: 70, textAlign: "center", marginRight: 3}]}>All Messages</Text>
                            <Text style={[styles.text, { fontSize: 13, width: 70, textAlign: "center"}]}>Only @'s and Replies</Text>
                        </View>

                        <View
                            style={{
                                backgroundColor: 'black',
                                height: 1.5,
                                marginRight: 10,
                                marginLeft: 10,
                            }}
                        />

                        <FlatList
                                ItemSeparatorComponent={renderSeparator}
                                data={chatRooms}
                                renderItem={({ item }) => <SettingListItem chatRoom={item.chatRoom} role={role} userID={userID} /> } //onLongPress={() => confirmDelete(item.chatRoom)}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                        />

                    </View>

                    {/* split */}
                    
                    <View style={{ width: "80%", borderWidth: 1.5, borderRadius: 18, marginBottom: 23 }}>

                        <View style={{flexDirection: "row", marginBottom: 10, marginTop: 10, width: 400}}>
                            <Text style={[styles.text, { marginRight: 145, left: 10, }]}>Groups</Text>
                            <Text style={[styles.text, { fontSize: 13, width: 70, textAlign: "center", marginRight: 3}]}>All Messages</Text>
                            <Text style={[styles.text, { fontSize: 13, width: 70, textAlign: "center"}]}>Only @'s and Replies</Text>
                        </View>

                        <View
                            style={{
                                backgroundColor: 'grey',
                                height: 1.5,
                                marginRight: 10,
                                marginLeft: 10,
                            }}
                        />

                        <FlatList
                                ItemSeparatorComponent={renderSeparator}
                                data={groupRooms}
                                renderItem={({ item }) => <SecondSettingsListItem groupRoom={item.groupRoom} role={role} userID={userID} /> } //onLongPress={() => confirmDelete(item.chatRoom)}
                                keyExtractor={(item) => item.id}
                                showsVerticalScrollIndicator={false}
                        />

                        {/* <View
                            style={{
                                backgroundColor: 'grey',
                                height: 0.5,
                                marginRight: 10,
                                marginLeft: 10,
                                }}
                        /> */}

                        {/* <TouchableOpacity
                        // onPress={alertSignOut}
                            style={{alignItems: "center", marginBottom: 15, marginTop: 15 }}
                            activeOpacity={0.5}>
                            <View style={[styles.buttons, {backgroundColor: "#00BDFF"}]}>
                                <Text style={[styles.text, {color: "white", fontWeight: "600", fontSize: 20 }]}>
                                    Save
                                </Text>
                            </View>
                        </TouchableOpacity> */}
                    </View>

                    <TouchableOpacity
                        onPress={alertSignOut}
                        activeOpacity={0.5}>
                        <View style={styles.buttons}>
                            <Text style={[styles.text, {color: "white", fontWeight: "600", fontSize: 20 }]}>
                                Sign Out
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            }
        </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    buttons: {
        backgroundColor: "red",
        borderRadius: 20,
        paddingVertical: 13,
        justifyContent: "center",
        alignSelf: "center",
        shadowColor: "rgba(20, 40, 100, 0.20)",
        shadowOffset: {width:1, height:4},
        shadowOpacity: 1,
        shadowRadius: 10,
        width: 230,
        height: 60,

      },
    editButton: {
        backgroundColor: "white",
        borderRadius: 8,
        paddingVertical: 13,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "rgba(20, 40, 100, 0.20)",
        shadowOffset: {width:0, height:2},
        shadowOpacity: 1,
        shadowRadius: 5,
        width: 45,
    },
    text: {
        fontFamily: "Avenir Next",
        color: "#1D2029",
        fontSize: 30,
        fontWeight: '500',
        alignSelf: "center"
      },
    imageAndButton: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        padding: 20,
        alignItems: "center",
    },
    imagePicker: {
        marginBottom: 1,
    },
    AvatarMargin: {
        marginRight: 20
    },
})

export default SettingsScreen