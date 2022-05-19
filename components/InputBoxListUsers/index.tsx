import React, { useLayoutEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { User } from '../../types';
import styles from './style';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

import { API, graphqlOperation, Auth} from 'aws-amplify';
import {createChatRoom, createChatRoomUser, createPrivateRoom, createPrivateRoomUser} from '../../src/graphql/mutations'
import {S3Image} from 'aws-amplify-react-native';

export type InputBoxListUsersProps = {
    user: User;
    setSelectedListUser: () => void
}

const InputBoxListUsers = (props: InputBoxListUsersProps) => {
    const { user, setSelectedListUser } = props;

    return (
        <TouchableOpacity onPress={setSelectedListUser}
        >
            <View style={styles.container}>
                <View style={styles.leftContainer}>
                    <S3Image imgKey={ user.imageUri } style={styles.avatar} />
                    <View style={styles.midContainer}>
                        <Text style={styles.username}>{user.name}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
};

export default InputBoxListUsers;