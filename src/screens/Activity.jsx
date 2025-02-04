import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { width } from '../utilites/Helper';

const Activity = (props) => {
  const [apiData, setApiData] = useState(null); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApiData();
  }, []);

  const fetchApiData = async () => {
    try {
      setLoading(true);
      const Token = await AsyncStorage.getItem('token');
      if (!Token) {
        console.error('No token found!');
        setLoading(false);
        return;
      }

      const requestOptions = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${Token}`,
        },
        redirect: 'follow',
      };

      const response = await fetch(
        'http://3.110.104.79:3000/v1/auth/fetchEmployeeActivity',
        requestOptions
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Data:', result);
      setApiData(result?.employeeActivity || null); // Extract the employeeActivity object
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDynamicItem = (data) => (
    <View style={Styles.listItem}>
      {/* Check-In Block */}
      <View style={{
        width: '100%',
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <Image
          source={require('../utilites/Images/11.png')}
          style={Styles.itemImage}
        />
        <View style={{ flex: 1 }}>
          <Text style={Styles.itemText}>Check-In</Text>
          <Text style={{ color: 'gray' }}>
            Time: {new Date(data.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text style={{ color: 'gray' }}>
           {data.checkInStatus} 
        </Text>
      </View>
  
      {/* Check-Out Block */}
      <View style={{
        width: '100%',
        backgroundColor: '#f5f5f5',
        marginTop: 20,
        borderRadius: 20,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <Image
          source={require('../utilites/Images/6.png')}
          style={Styles.itemImage}
        />
        <View style={{ flex: 1 }}>
          <Text style={Styles.itemText}>Check-Out</Text>
          <Text style={{ color: 'gray' }}>
            Time: {new Date(data.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    </View>
  );
  



  return (
    <SafeAreaView style={Styles.main}>
      <ScrollView>
        <View style={Styles.v1}>
          <TouchableOpacity
            style={Styles.touch}
            activeOpacity={0.7}
            onPress={() => props.navigation.navigate('Home')}
          >
            <Image
              source={require('../utilites/Images/9.png')}
              style={Styles.img}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={Styles.txt1}>Your Activity</Text>
        </View>

        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading...</Text>
        ) : apiData ? (
          renderDynamicItem(apiData)
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No data available
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Activity;

const Styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  img: {
    height: 20,
    width: 20,
  },
  v1: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txt1: {
    fontSize: 23,
    color: 'black',
    fontWeight: '600',
    marginLeft: 20,
  },
  touch: {
    height: 30,
    width: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: width / 2,
  },
  listItem: {
    width: '100%',
    // backgroundColor: '#f5f5f5',
    marginTop: 20,
    borderRadius: 20,
    // padding: 15,
    // flexDirection: 'row',
    alignItems: 'center',
  },
  timeBlock: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
  },

  itemImage: {
    height: 40,
    width: 40,
    marginRight: 15,
    tintColor: '#00bfff',
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
});
