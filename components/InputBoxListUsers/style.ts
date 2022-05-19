import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    avatar: {
        width: 30,
        height: 30,
        marginRight: 15,
        borderRadius: 30,
    },
    container: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        padding: 10,
    },
    midContainer: {
        justifyContent: 'space-around',
    },
    leftContainer: {
        flexDirection: 'row',
        flex: 1,
    },
    username: {
        fontWeight: 'bold',
        fontSize: 15,
        fontFamily: 'Avenir Next',
    },
    status: {
        fontSize: 16,
        color: 'grey',
    },
});

export default styles;