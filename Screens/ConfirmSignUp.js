import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView } from 'react-native';
import { Auth } from 'aws-amplify';
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from 'react-native-elements/dist/input/Input';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';


export default function ConfirmSignUp({ navigation }) {

  const [username, setUsername] = useState('');
  const [authCode, setAuthCode] = useState('');

  useLayoutEffect (() => {
    navigation.setOptions({
          headerLeft: () => (
            <View>
              <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => navigation.navigate('Sign Up')}>
              <Ionicons
                    name="chevron-back-outline" 
                    size={35}
                    color = 'white'
                />
            </TouchableOpacity>
            </View>
          )
  }), [navigation]});


  async function confirmSignUp() {
    if(!username) {
      Alert.alert('Please enter your username');
      return;
    } else if (!authCode) {
      Alert.alert('Please enter your 6-digit verification code');
      return;
    }
    try {
      await Auth.confirmSignUp(username, authCode);
      console.log('Code confirmed');
      Alert.alert('Code confirmed','Sign-up was successful!')
      navigation.navigate('Login');
    } catch (error) {
      console.log(
        'Verification code does not match. Please enter a valid verification code.',
        error.code
      );
      Alert.alert('Verification code and username do not match', 'Please enter a valid verification code.')
    }
  }
  return (
    <KeyboardAvoidingView behavior= 'padding' style={styles.safeAreaContainer}>
      <StatusBar style="light"/>

      <Text style={[styles.text, {color: "black", fontWeight: "700", fontSize: 35, marginBottom: 10 }]}>
        Confirm Sign Up
      </Text>

      <Text style={[styles.text, { color: "#ABB4BD", fontSize: 15, textAlign: "center", marginBottom: 40}]}>
        Check your email for your verification code!
      </Text>

      <View style={styles.inputContainer}>
        <Input
          value={username}
          onChangeText={text => setUsername(text)}
          leftIcon="account"
          placeholder="Enter username"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          leftIcon={
            <Icon name="user-circle" type="antdesign" size={22} color="#00BFFF"/>
          }
        />
        <Input
          value={authCode}
          onChangeText={text => setAuthCode(text)}
          leftIcon="numeric"
          placeholder="6-digit verification code"
          keyboardType="numeric"
          leftIcon={
            <Icon name="check" type="antdesign" size={22} color="#00BFFF"/>
          }
        />
      </View>
      <TouchableOpacity 
        onPress={confirmSignUp}
        activeOpacity={0.5}>
          <View style={styles.buttons}>
            <Text style={[styles.text,{color: "#fff", fontWeight: "600", fontSize: 18 }]}>
               Confirm
            </Text>
          </View>
      </TouchableOpacity>
      <View style={{ height: 40 }}/>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
      safeAreaContainer: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
      },
      title: {
        fontSize: 20,
        color: '#202020',
        fontWeight: '500',
        marginVertical: 15
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