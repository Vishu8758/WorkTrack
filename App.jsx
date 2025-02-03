import React, { useEffect } from 'react'
import { LogBox ,AppState, StatusBar} from 'react-native'
import Stack from './src/routes/Stack'
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
LogBox.ignoreAllLogs()


const App = () => {

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