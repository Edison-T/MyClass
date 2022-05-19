import "react-native-gesture-handler"
import { StyleSheet, Text, View, ActivityIndicator, LogBox } from "react-native";
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import ChatsScreen from './Screens/ChatsScreen';
import SettingsScreen from "./Screens/SettingsScreen";
import ChatRoomScreen from './Screens/ChatRoomScreen';
import AssignUserScreen from "./Screens/AssignUserScreen"
import StudentContactsScreen from "./Screens/StudentContactsScreen";
import TeacherContactsScreen from "./Screens/TeacherContactsScreen";
import ChatRoomSettingsScreen from "./Screens/ChatRoomSettingsScreen";
import LoginScreen from './Screens/LoginScreen';
import SignUpScreen from "./Screens/SignUpScreen";
import ConfirmSignUp from "./Screens/ConfirmSignUp";

import Amplify, { Auth, API, graphqlOperation } from 'aws-amplify';

import {getUser} from './src/graphql/queries';
import {createUser} from './src/graphql/mutations';
import { withAuthenticator } from 'aws-amplify-react-native'
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { SafeAreaProvider } from "react-native-safe-area-context";
import StudentChatRoomSettingsScreen from "./Screens/StudentChatRoomSettingsScreen";
import TeacherAnnouncementScreen from "./Screens/TeacherAnnouncementScreen";
import CreateAnnouncementScreen from "./Screens/CreateAnnouncementScreen";
import UpdateAnnouncementScreen from "./Screens/UpdateAnnouncementScreen";
import GroupRoomHomeScreen from "./Screens/GroupRoomHomeScreen";
import GroupRoomScreen from "./Screens/GroupRoomScreen";
import CreateOrJoinGroupsScreen from "./Screens/CreateOrJoinGroupsScreen";
import JoinGroupScreen from "./Screens/JoinGroupScreen";
import GroupRoomSettingsScreen from "./Screens/GroupRoomSettingsScreen";
import PrivateRoomHomeScreen from "./Screens/PrivateRoomHomeScreen";
import NewPrivateForTeachers from "./Screens/NewPrivateForTeachers";
import NewPrivateForStudents from "./Screens/NewPrivateForStudents";
import PrivateRoomScreen from "./Screens/PrivateRoomScreen";
import CreateGroupScreen from "./Screens/CreateGroupScreen";
import GroupAnnouncementScreen from "./Screens/GroupAnnouncementScreen";
import CreateGroupAnnouncementScreen from "./Screens/CreateGroupAnnouncementScreen";
import UpdateGroupAnnouncementScreen from "./Screens/UpdateGroupAnnouncementScreen";
import ConversationRoom from "./Screens/ConversationRoomScreen";
import GroupRoomConversationRoom from "./Screens/GroupRoomConversationRoomScreen";
import config from './aws-exports'
import DiscoverHomeScreen from "./Screens/DiscoverHomeScreen";
Amplify.configure(config)//ios build doesn't work with configure implemented inside the code because it says aws-exports doens't exist, which is odd. ok nevermind, it was because the file was in gitIgnore and it doesn't send to the build server. Kudos to Kim from the Expo servers for helping me with this!
// Amplify.configure({
//   ...awsExports,
//   Analytics: { 
//     disabled: true
//   }
// });
// import config from "./aws-exports";
// Amplify.configure(config);


const randomImages = [
  "avatardefault_92824.png"
]

LogBox.ignoreAllLogs();

///const Stack = createStackNavigator();
const AuthenticationStack = createStackNavigator();
const AppStack = createStackNavigator();
const GroupAppStack = createStackNavigator();
const PrivateAppStack = createStackNavigator();
const DiscoverAppStack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

const globalScreenOptions = {
  headerStyle: { backgroundColor: "#00BFFF" },
  headerTitleStyle: { color: "white" },
  headerTintColor: "white",
};

// const AuthenticationNavigator = props => {
//   return (
//     <AuthenticationStack.Navigator screenOptions={globalScreenOptions}>
//       <AuthenticationStack.Screen name="Login">
//         {screenProps => (
//           <LoginScreen {...screenProps} updateAuthState={props.updateAuthState} />
//         )}
//       </AuthenticationStack.Screen>
//       <AuthenticationStack.Screen name="Sign Up" component={SignUpScreen} />
//       <AuthenticationStack.Screen name="Verification" component={ConfirmSignUp}/>
//     </AuthenticationStack.Navigator>
//   );
// };
// ^^^^^ All login screens when it's ready :)

const AppNavigator = props => {
  return (
    <AppStack.Navigator screenOptions={globalScreenOptions} >
      {/* <AppStack.Screen name="Chats Screen"> 
          {screenProps => (
            <ChatsScreen {...screenProps} updateAuthState={props.updateAuthState} />
      )}
      </AppStack.Screen>
      <AppStack.Screen name="Settings"> 
          {screenProps => (
            <SettingsScreen {...screenProps} updateAuthState={props.updateAuthState} />
      )}
      </AppStack.Screen> */}

      <AppStack.Screen name='Chats Screen' component={ChatsScreen} />
      <AppStack.Screen name='Settings' component={SettingsScreen} />
      <AppStack.Screen name='Chat Room' component={ChatRoomScreen} options={({ route }) => ({ title: route.params.name })} />
      <AppStack.Screen name='Conversation Room' component={ConversationRoom} options={({ route }) => ({ title: route.params.name })} />
      <AppStack.Screen name='Class Settings' component={ChatRoomSettingsScreen}/>
      <AppStack.Screen name='Classroom Settings' component={StudentChatRoomSettingsScreen} />
      <AppStack.Screen name='Choose Your Role' component={AssignUserScreen} />
      <AppStack.Screen name='Join Classes' component={StudentContactsScreen} />
      <AppStack.Screen name='Create Classes' component={TeacherContactsScreen} />
      <AppStack.Screen name='Announcements' component={TeacherAnnouncementScreen} />
      <AppStack.Screen name='Create Announcements' component={CreateAnnouncementScreen} />
      <AppStack.Screen name='Update Announcements' component={UpdateAnnouncementScreen} />
    </AppStack.Navigator>
  );
};

const GroupAppNavigator = props => {
  return (
    <GroupAppStack.Navigator screenOptions={globalScreenOptions} >
      {/* <GroupAppStack.Screen name="Groups Home Screen">
        {screenProps => (
          <GroupRoomHomeScreen {...screenProps} updateAuthState={props.updateAuthState} />
        )}
      </GroupAppStack.Screen>
      <GroupAppStack.Screen name="Settings"> 
          {screenProps => (
            <SettingsScreen {...screenProps} updateAuthState={props.updateAuthState} />
      )}
      </GroupAppStack.Screen> */}
      <GroupAppStack.Screen name="Groups Home Screen" component={GroupRoomHomeScreen} />
      {/* <GroupAppStack.Screen name="Settings" component={SettingsScreen} /> */}
      <GroupAppStack.Screen name="Group Room" component={GroupRoomScreen} options={({route}) => ({title: route.params.groupRoomName})} />
      <GroupAppStack.Screen name="Group Room Conversation Room" component={GroupRoomConversationRoom} options={({route}) => ({title: route.params.groupRoomConversationName})} />
      <GroupAppStack.Screen name="Create or Join Groups" component={CreateOrJoinGroupsScreen} />
      <GroupAppStack.Screen name="Join a Group" component={JoinGroupScreen} />
      <GroupAppStack.Screen name="Create a Group" component={CreateGroupScreen} />
      <GroupAppStack.Screen name="Group Settings" component={GroupRoomSettingsScreen} />
      <GroupAppStack.Screen name="Group Announcements" component={GroupAnnouncementScreen} />
      <GroupAppStack.Screen name="Create Group Announcements" component={CreateGroupAnnouncementScreen} />
      <GroupAppStack.Screen name="Update Group Announcements" component={UpdateGroupAnnouncementScreen} />
    </GroupAppStack.Navigator>
  ); 
};

const PrivateAppNavigator = props => {
  return (
    <PrivateAppStack.Navigator screenOptions={globalScreenOptions} >
      {/* <PrivateAppStack.Screen name="Private Chat Home Screen">
        {screenProps => (
          <PrivateRoomHomeScreen {...screenProps} updateAuthState={props.updateAuthState} />
        )}
      </PrivateAppStack.Screen> */}
      <PrivateAppStack.Screen name="Private Chat Home Screen" component={PrivateRoomHomeScreen} />
      <PrivateAppStack.Screen name="Teacher Contacts List" component={NewPrivateForTeachers} />
      <PrivateAppStack.Screen name="Student Contacts List" component={NewPrivateForStudents} />
      <PrivateAppStack.Screen name="Private Chat Room" component={PrivateRoomScreen} options={({route}) => ({title: route.params.name})} />

    </PrivateAppStack.Navigator>
  )
}

const DiscoverAppNavigator = props => {
  return (
    <DiscoverAppStack.Navigator screenOptions={globalScreenOptions} >
      <DiscoverAppStack.Screen name="Discover Home Screen" component={DiscoverHomeScreen} />
    </DiscoverAppStack.Navigator>
  )
}


  function App() {
    // const [isUserLoggedIn, setUserLoggedIn] = useState('initializing');

      const getRandomImage = () => {
        return randomImages[Math.floor(Math.random() * randomImages.length)]
      }
    
      useEffect ( () => {
        const fetchUser = async () => {
          //get authenticated user from auth
          const userInfo = await Auth.currentAuthenticatedUser({bypassCache: true});
    
          if (userInfo) {
          // get the user from backend with user SUB from auth; checks if there is an user
          const userData = await API.graphql
            (graphqlOperation(
              getUser,
              { id: userInfo.attributes.sub }
            )
          )
    
          if (userData.data.getUser) {
            console.log("User is registered in my database");
            return;
          }
    
          const newUser = {
            id: userInfo.attributes.sub,
            name: userInfo.username,
            imageUri: getRandomImage(),
            status: 'Online',
            role: 'none',
            expoPushToken: '',
          }
    
          await API.graphql( // using newUser, it makes a new user to the API
            graphqlOperation(
              createUser,
              {input: newUser}
            )
          )
          // if there is no user in DB with the id, then create one
          }
        }
        fetchUser();
      }, []); // this fetches user information from the backend
      
      // useEffect(() => {
      //   checkAuthState();
      // }, []);

      // async function checkAuthState() {
      //   try {
      //     await Auth.currentAuthenticatedUser();
      //     console.log(' User is signed in');
      //     setUserLoggedIn('loggedIn');
      //   } catch (err) {
      //     console.log(' User is not signed in');
      //     setUserLoggedIn('loggedOut');
      //     }
      // }

      // function updateAuthState(isUserLoggedIn) {
      //   setUserLoggedIn(isUserLoggedIn);
      // }

      return (
        <ActionSheetProvider>
        <NavigationContainer>
          {/* {isUserLoggedIn === 'initializing' && <Initializing />} */}
          {/* {isUserLoggedIn === 'loggedIn' && (rest of code) */}
            <Tab.Navigator
              tabBarPosition="bottom"
              tabBarOptions={{
                inactiveTintColor: "grey",
                showIcon: "true",
                //showLabel: "false"
                style: { backgroundColor: "white", marginBottom: 18 },
                activeTintColor: "#00BFFF",
              }}
            >
              <Tab.Screen 
                name="Chats Screen" 
                component={AppNavigator} 
                //updateAuthState={updateAuthState}
                options={{
                  tabBarLabel: "Classes",
                  tabBarIcon: ({color}) => (
                    <MaterialCommunityIcons name="google-classroom" color={color} size={24} />
                  )
                }}
              />

              <Tab.Screen 
                name="Groups Home Screen" 
                component={GroupAppNavigator} 
                options={{
                  tabBarLabel: "Groups",
                  tabBarIcon: ({color}) => (
                    <MaterialCommunityIcons name="account-group" color={color} size={24} />
                  )
                }}
              />

              <Tab.Screen 
                name="Private Chat Home Screen" 
                component={PrivateAppNavigator} 
                options={{
                  tabBarLabel: "Private",
                  tabBarIcon: ({color}) => (
                    <MaterialCommunityIcons name="account" color={color} size={24} />
                  )
                }}
              />

              <Tab.Screen 
                name="Discover Home Screen" 
                component={DiscoverAppNavigator} 
                options={{
                  tabBarLabel: "Discover",
                  tabBarIcon: ({color}) => (
                    <MaterialCommunityIcons name="rocket-launch" color={color} size={24} />
                  )
                }}
              />
              
            </Tab.Navigator>
          {/* {isUserLoggedIn === 'loggedOut' && (
            <AuthenticationNavigator updateAuthState={updateAuthState} />
          )} */}
        </NavigationContainer>
        </ActionSheetProvider>
      );
    };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default withAuthenticator(App, {
  signUpConfig: {
    hiddenDefaults: ['phone_number']
  }
})
//export default App;
