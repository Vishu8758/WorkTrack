import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Loading = (props) => {
  useEffect(() => {
    Go()
  }, [])
  async function Go() {
    const uid = await AsyncStorage.getItem('uid')
    console.log(uid);
    if (uid !== '' && uid !== null && uid !== undefined) {
      props.navigation.navigate('Home')
    } else {
      props.navigation.navigate('Login')
    }
  }
  return (
    <View>
      <Text>Loading</Text>
    </View>
  )
}

export default Loading