import React, { useLayoutEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from "expo-status-bar";
import { Button, Input, Image, Text } from "react-native-elements";
import Icon from 'react-native-vector-icons/FontAwesome';
import { Auth } from 'aws-amplify';
import { Ionicons } from '@expo/vector-icons';




const SignUpScreen = ({ navigation }) => {
    const [username, setName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    // const [imageURL, setImageURL] = useState("");

    

    useLayoutEffect (() => {
        navigation.setOptions({
              headerLeft: () => (
                <View>
                  <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => navigation.navigate('Login')}>
                  <Ionicons
                        name="chevron-back-outline" 
                        size={35}
                        color = 'white'
                    />
                </TouchableOpacity>
                </View>
              )
    }), [navigation]});

    async function signUp() {
        if (!username) {
            Alert.alert('Please enter an username')
            return;
        } else if (!password) {
            Alert.alert('Please enter a password')
            return;
            // if password character is less than #, then alert that!
        } else if (!email) {
            Alert.alert('Please enter an email address')
        }
            try {
              await Auth.signUp({ username, password, attributes: { email } });
              console.log(' Sign-up Confirmed');
              navigation.navigate('Verification');
            } catch (error) {
              Alert.alert('Error signing up', 'Please provide a valid email address and password')
              console.log(' Error signing up...', error);
              setPassword('')
            }
          };

    return (
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
            <StatusBar style="light"/>

            <Text style={[styles.text, {color: "black", fontWeight: "700", fontSize: 35, marginBottom: 10 }]}>
                Let's Get Started!
            </Text>

            <Text style={[styles.text, { color: "#ABB4BD", fontSize: 15, textAlign: "center", marginBottom: 40}]}>
                Create an account to join your classes!
            </Text>

            <View style={styles.inputContainer}>
                <Input 
                    placeholder="Username" 
                    type='text'
                    value={username} 
                    onChangeText={(text) => setName(text)}
                    leftIcon={
                     <Icon name="user-circle" type="antdesign" size={22} color="#00BFFF"/>
                    }
                />
                <Input 
                    placeholder="Email" 
                    type="email"
                    value={email} 
                    onChangeText={(text) => setEmail(text)}
                    leftIcon={
                     <Icon name="envelope" type="antdesign" size={22} color="#00BFFF"/>
                    }
                />
                
                 <Input 
                    placeholder="Password (8 characters long)"
                    type="password"
                    secureTextEntry
                    value={password} 
                    onChangeText={(text) => setPassword(text)}
                    onSubmitEditing={signUp}
                    leftIcon={
                     <Icon name="eye-slash" type="antdesign" size={22} color="#00BFFF"/>
                    }
                />
                <View style={{ height: 40 }}/>
            </View>

             <TouchableOpacity 
                onPress={signUp}
                activeOpacity={0.5}>
                <View style={styles.buttons}>
                    <Text style={[styles.text,{color: "#fff", fontWeight: "600", fontSize: 18 }]}>
                        Sign Up
                    </Text>
                </View>
            </TouchableOpacity>

            <View style={{ height: 100 }}/>
        </KeyboardAvoidingView>
    )
}

export default SignUpScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        backgroundColor: "white",
    },
    inputContainer: {
        width: 300,
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
        width: 275
      },
      text: {
        fontFamily: "Avenir Next",
        color: "#1D2029"
      },
});