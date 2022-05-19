import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Button, Input, Image} from "react-native-elements";
import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView } from 'react-native';
import Amplify, { Auth, API, graphqlOperation, nav } from 'aws-amplify';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = ( {updateAuthState} ) => {
    const [username,setUsername] = useState("");
    const [password,setPassword] = useState("");

    const navigation = useNavigation();

    async function signIn() {
        if(!username) {
            Alert.alert('Enter your username')
            return;
        } else if (!password) {
            Alert.alert('Enter your password')
            return;
        }
        try {
            await Auth.signIn(username, password);
            console.log('Success');
            updateAuthState('loggedIn');
        } catch (error) {
            Alert.alert('Login failed', 'Username and password did not match ')
            console.log('Could not sign up...', error)
            }
        };

    return (
        <KeyboardAvoidingView behavior='padding' style={styles.container}>
            <StatusBar style="light"/>
            <Image
                source={require('../assets/MyClass.png')}
                style={{width: 110, height: 110, marginBottom: 5}}
                />

            <View>
                <Text style={[styles.text, { fontSize: 17, fontWeight: "600" }]}>MyClass</Text>
            </View>

            <View style={styles.inputContainer}>
                <Input 
                    placeholder="Username" 
                    autoFocus
                    type="username" 
                    value={username} 
                    onChangeText={(text) => setUsername(text)}
                    leftIcon={
                     <Icon name="envelope" type="antdesign" size={24} color="#00BFFF"/>
                    }
                />
                <View style={{  height: 30 }}/>
                <Input 
                    placeholder="Password" 
                    secureTextEntry  
                    type="password"
                    value={password} 
                    onChangeText={(text) => setPassword(text)}
                    onSubmitEditing= {signIn}
                    leftIcon={
                     <Icon name="eye-slash" type="antdesign" size={24} color="#00BFFF"/>
                    }
                />
            </View>

            <TouchableOpacity 
                onPress={signIn}
                activeOpacity={0.5}>
                <View style={styles.buttons}>
                    <Text style={[styles.text,{color: "#fff", fontWeight: "600", fontSize: 18 }]}>
                        Login
                    </Text>
                </View>
            </TouchableOpacity>

            <View>
                <Text
                    style={[styles.text, { color: "#ABB4BD", fontSize: 20, textAlign: "center", marginTop: 20, marginBottom: 20}]}>
                    or
                </Text>
            </View>

            <TouchableOpacity
                onPress={() => navigation.navigate("Sign Up")} //navigate can go back; replace cannot
                activeOpacity={0.5}>
                <View style={styles.buttons}>
                    <Text style={[styles.text, {color: "#fff", fontWeight: "600", fontSize: 18 }]}>
                        Create an Account
                    </Text>
                </View>
            </TouchableOpacity>

            <View style={{ height: 100 }}/>

        </KeyboardAvoidingView>
    );
};

export default LoginScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
        backgroundColor: "white"
    },
    inputContainer: {
        width: 325,
        marginBottom: 40,
        marginTop: 40,
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