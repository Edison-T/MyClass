import React from 'react';
import { FlatList, Text, View, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ChatMessage from '../components/ChatMessage';
import InputBox from '../components/InputBox';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useLayoutEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

const DiscoverHomeScreen = () => {
    const navigation = useNavigation();

    const navigateToSettings = () => {
        navigation.navigate('Settings', 
        // { role: role, userID: userID}
        );
    };

    useLayoutEffect (() => {
        navigation.setOptions({
            title: "Discover",
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
              </View>)
        }), [navigation]
    });

    return (
        <View style={{flex: 1}}>
            <View></View>
            <TouchableOpacity style={[styles.buttons, { marginBottom: 20 }]} activeOpacity={0.7} >
                <Ionicons 
                    name="school-outline"
                    size={50}
                    color = '#00BFFF'
                />
                <Text style={styles.text}>
                    Seek {`&`} Offer Advice
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.buttons, { marginTop: 20 }]} activeOpacity={0.7} >
                <Ionicons 
                    name="planet-outline"
                    size={50}
                    color = '#00BFFF'
                />
                <Text style={styles.text}>
                    Explore Skills
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    buttons: {
        borderRadius: 20, 
        flex: 1, 
        margin: 40, 
        backgroundColor: "white", 
        shadowColor: "#00BFFF", 
        shadowOffset: { width: 1, height: 2 }, 
        shadowOpacity: 0.4, 
        shadowRadius: 10,
        alignItems: "center", 
        justifyContent: "center"
    },
    text: {
        fontFamily: "Avenir Next",
        color: "#1D2029",
        fontWeight: "600", 
        fontSize: 18,
        top: 30
    },
})
  
export default DiscoverHomeScreen;