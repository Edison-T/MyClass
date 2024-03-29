import React, { useState, useEffect, useLayoutEffect } from 'react'
import { StyleSheet, Alert, View, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { Button, Input, Image} from "react-native-elements";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from '@expo/vector-icons';
import Amplify, { Auth, API, graphqlOperation, nav } from 'aws-amplify';
import CreateGroupAnnouncementButton from '../components/CreateGroupAnnouncementButton';
import { useNavigation } from '@react-navigation/native';
import * as mutations from '../src/graphql/mutations';
import AnnouncementComponent from '../components/AnnouncementComponent';
import { announcementsByChatRoom, announcementsByGroupRoom, getAnnouncement } from '../src/graphql/queries';
import { onCreateAnnouncement, onCreateGroupAnnouncement, onDeleteAnnouncement, onDeleteGroupAnnouncement, onUpdateAnnouncement, onUpdateGroupAnnouncement } from '../src/graphql/subscriptions';
import moment from 'moment';
import GroupAnnouncementComponent from '../components/GroupAnnouncementComponent';

const GroupAnnouncementScreen = ({route}) => {
    const [announcements, setAnnouncements] = useState([]);
    const { groupRoomID, CRUID } = route.params

    const navigation = useNavigation();

    const groupIDProps = {
      groupRoomID: groupRoomID,
      CRUID: CRUID,
    }

    useLayoutEffect (() => {
      navigation.setOptions({
            headerLeft: () => (
              <View>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => {navigation.goBack()}}>
                  <Ionicons
                        name="chevron-back-outline" 
                        size={35}
                        color = 'white'
                    />
                </TouchableOpacity>
              </View>
            )
      }), [navigation]});
    
    const fetchAnnouncements = async () => {
        const announcementData = await API.graphql(
          graphqlOperation(
            announcementsByGroupRoom, {
              groupRoomID: route.params.groupRoomID,
              sortDirection: "DESC",
            }
          )
        )
        setAnnouncements(announcementData.data.announcementsByGroupRoom.items);
      }
    
    useEffect(() => {
        fetchAnnouncements();
    }, [])

    useEffect(() => {
        const subscription = API.graphql(
          graphqlOperation(onCreateGroupAnnouncement)
        ).subscribe({
          next: (data) => {
            const newAnnouncement = data.value.data.onCreateGroupAnnouncement;
            if (newAnnouncement.groupRoomID !== route.params.groupRoomID) {
              console.log("Announcement is in another room!")
              return;
            }
            fetchAnnouncements();
          }
        });
        return () => subscription.unsubscribe();
      }, []);

      useEffect(() => {
        const subscription = API.graphql(
          graphqlOperation(onUpdateGroupAnnouncement)
        ).subscribe({
          next: () => {
            fetchAnnouncements();
          }
        });
        return () => subscription.unsubscribe();
      }, []);

      useEffect(() => {
        const subscription = API.graphql(
          graphqlOperation(onDeleteGroupAnnouncement)
        ).subscribe({
          next: () => {
            fetchAnnouncements();
          }
        });
        return () => subscription.unsubscribe();
      }, []);

      const confirmDelete = (announcement) => {
        Alert.alert(
            "Delete Announcement",
            `Are you sure you want to delete this announcement?`,
            [
                {
                    text: "Delete",
                    onPress: () => deleteAnnouncement(announcement),
                    style: "destructive"
                },
                {
                    text: "Cancel"
                }
            ]
        )
    }

    const deleteAnnouncement = async (announcement) => {
          try {
          const id = {
              id: announcement.id,
          };
          await API.graphql({ 
              query: mutations.deleteGroupAnnouncement, 
              variables: {input: id}
          });
          setAnnouncements(announcements.filter((a) => a.id !== announcement.id))
          }
          catch (e) {
              Alert.alert("Oops!", "Could not delete announcement!")
              return;
          } 
  }


// const checkEntries = () => {
//     const maxDate = getMaxDate();
//     Object.entries(announcements).forEach(x => {  
//       const date = x[1].date;
//       if (date > maxDate) {
//         delete announcements[x[0]]
//       }
//     });
// }
// /** Get the time, 24 hours ago*/ 
// const getMaxDate = () => {
//     const now = new Date();
//     const now_tm = now.getTime();
//     const maxDate_tm = now_tm - (24*60*60*1000);
//     return new Date(maxDate_tm);
// }

// const timer = setInterval(checkEntries, 3600000);

  return (
    <SafeAreaView style={styles.container}>
        <FlatList
            data={announcements}
            renderItem={({ item }) => 
                <GroupAnnouncementComponent 
                    announcement={item} 
                    confirmAnnouncementDeletion={() => confirmDelete(item)}
                />
            }
            showsVerticalScrollIndicator={false}
            // keyExtractor={(item) => item.id} do i use this to delete an announcement?
        />
        <CreateGroupAnnouncementButton {...groupIDProps}/>
    </SafeAreaView>
  )
}

export default GroupAnnouncementScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 60,
    },
    buttons: {
        backgroundColor: "#00BFFF",
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
        flexDirection: "row"
      },
    text: {
        fontFamily: "Avenir Next",
        color: "#1D2029"
      },
});