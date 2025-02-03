import { View, Text, useColorScheme } from 'react-native'
import React from 'react'
import { NavigationContainer,DarkTheme, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Home from '../screens/Home';
import Activity from '../screens/Activity';
import Loading from '../screens/Loading';


const stack = createNativeStackNavigator();

const Stack = () => {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaProvider>
    <NavigationContainer  theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme} >
      <stack.Navigator screenOptions={{ headerShown: false }}>
        <stack.Screen name="Loading" component={Loading} />
        <stack.Screen name="Login" component={Login} />
        <stack.Screen name="Register" component={Register} />
        <stack.Screen name="Home" component={Home} />
        <stack.Screen name="Activity" component={Activity} /> 
      </stack.Navigator>
    </NavigationContainer>
  </SafeAreaProvider>
  )
}

export default Stack