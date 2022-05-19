import { StatusBar } from 'expo-status-bar';
import React, {useLayoutEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { Image } from 'react-native-elements';
import { User } from '../types';
import { Ionicons } from '@expo/vector-icons';

import * as mutations from '../src/graphql/mutations';
import { API, graphqlOperation, Auth} from 'aws-amplify';
import { useNavigation } from '@react-navigation/core';
import { NavigationHelpersContext } from '@react-navigation/native';

const CreateOrJoinGroupsScreen = () => {
    const navigation = useNavigation();

    useLayoutEffect (() => {
        navigation.setOptions({
              headerLeft: () => (
                <View>
                  <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => navigation.navigate('Groups Home Screen')}>
                  <Ionicons
                        name="chevron-back-outline" 
                        size={35}
                        color = 'white'
                    />
                </TouchableOpacity>
                </View>
              )
    }), [navigation]});

    return (
        <KeyboardAvoidingView behavior='padding' style={styles.container}>
            <StatusBar style="light"/>

            <Text style={styles.text}>
                I want to . . .
            </Text>

            <TouchableOpacity
                onPress={() => {navigation.navigate("Create a Group")}}
                activeOpacity={0.5}
            >
                <Image
                 source={require('../assets/joinAGroupPNG.png')}
                 style={styles.avatars}
                />
                <Text  style={styles.avatarText}>Create a Group</Text>
            </TouchableOpacity>

            <View style={{  height: 40 }}/>

            <TouchableOpacity
                onPress={() => {navigation.navigate("Join a Group")}}
                activeOpacity={0.5}>
                <Image
                 source={require('../assets/createAGroupPNG.png')}
                 style={styles.avatars}
                />
                <Text  style={styles.avatarText}>Join a Group</Text>
            </TouchableOpacity>
         </KeyboardAvoidingView>
    );
}

export default CreateOrJoinGroupsScreen;
const styles = StyleSheet.create ({
    container: {
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        fontFamily: "Avenir Next",
        color: "#1D2029",
        fontWeight: "600",
        fontSize: 35, 
        marginBottom: 40,
      },
    avatars: {
        width: 200,
        height: 200,
        marginBottom: 5,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: "600",
        fontFamily: "Avenir Next",
        color: "#1D2029",
        textAlign: 'center',
    },
});