import React, { useEffect } from 'react'
import { LogBox ,AppState, StatusBar, Alert} from 'react-native'
import Stack from './src/routes/Stack'
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PermissionsAndroid} from 'react-native';
import messaging from '@react-native-firebase/messaging';
LogBox.ignoreAllLogs()


const App = () => {
  useEffect(()=>{
       requestPermissionAndroid();
  },[])
  const requestPermissionAndroid =async ()=>{
    const granted =await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS); 
  if (granted === PermissionsAndroid.RESULTS.GRANTED){
    // Alert.alert('Permission Granted')
    getToken()
  }else {
    // Alert.alert('Permission Denied')
  }
  
  }
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });
    return unsubscribe;
  }, []);

  const getToken =async()=>{
    const token = await messaging().getToken();
    console.log("token notification",token);
    
  }

  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      try {
        const uid = await AsyncStorage.getItem('uid');
        // console.log(uid,"meraaaaaa naaaam");
        
        if (!uid) {
          console.log('UID not found, skipping Firestore update');
          return;
        }

        if (nextAppState === 'active') {
         
          await firestore()
            .collection('Users')
            .doc(uid)
            .update({ Status: true });
          console.log('App has come to the foreground. Status set to true.');
        } else if (nextAppState.match(/inactive|background/)) {
          
          await firestore()
            .collection('Users')
            .doc(uid)
            .update({ Status: false });
          console.log('App has gone to the background. Status set to false.');
        }
      } catch (error) {
        console.error('Error updating user status:', error);
      }

      appState.current = nextAppState;
      console.log('AppState', appState.current);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);
  return (
    <>
    
    <StatusBar backgroundColor='white' barStyle={'dark-content'} />
    <Stack />
    </>
  )
}

export default App