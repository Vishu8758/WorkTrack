import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, SafeAreaView, Alert, useColorScheme } from 'react-native';
import GetLocation from 'react-native-get-location';
import { width, CheckComponent, Buttoncomponent } from '../utilites/Helper';
import CalendarStrip from 'react-native-calendar-strip';
import moment from 'moment';
import firestore from '@react-native-firebase/firestore'; // Import Firestore
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from "react-native-modal";
import { io } from "socket.io-client";

const Home = (props) => {
    const socket = io("http://3.110.104.79:3000/");
    const [selectedDate, setSelectedDate] = useState(moment());
    const [loading, setLoading] = useState(false);
    const [checkInTime, setCheckInTime] = useState('00:00');
    const [checkOutTime, setCheckOutTime] = useState('00:00');
    const [hasCheckedIn, setHasCheckedIn] = useState(false);
    const [hasCheckedOut, setHasCheckedOut] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [totalBreakTime, setTotalBreakTime] = useState(0); // State for total break time
    const [check, setCheck] = useState({
        checkInTime: '00:00',
        checkout: '00:00',
        checkInStatus: 'No Status',
        checkOutStatus: 'No Status',
    });
    const [name, setName] = useState('');
    const [role, setRole] = useState('');

    const testData = {
        email: 'vchgdh2dj@2gmail.com',
        latitude: 30,
        longitude: 70
    };

    const sendBreakData = () => {
        socket.emit('track.employee', testData);
    };

    const getDataSocket = () => {
        socket.on('employee.recent.details', (data) => console.log(data));
    };

    useEffect(() => {
        fetchNameAndRole();
        getDataSocket();
        fetchActivityData(); // Fetch data immediately on component mount

        // Set up an interval to fetch data every 5 minutes
        const intervalId = setInterval(fetchActivityData, 5 * 60 * 1000); // 5 minutes in milliseconds

        // Set up an interval to send break data every 5 minutes
        const breakIntervalId = setInterval(sendBreakData, 5 * 60 * 1000); // 5 minutes in milliseconds

        // Clean up the intervals when the component unmounts
        return () => {
            clearInterval(intervalId);
            clearInterval(breakIntervalId);
        };
    }, []);

    const fetchActivityData = async () => {
        try {
            const Token = await AsyncStorage.getItem('token');
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${Token}`);

            const requestOptions = {
                method: "GET",
                headers: myHeaders,
                redirect: "follow",
            };

            const response = await fetch("http://3.110.104.79:3000/v1/auth/fetchEmployeeActivity", requestOptions);
            const result = await response.json();

            console.log("API Response:", result); // Debugging ke liye response log karen

            if (result.success && result.employeeActivity) {
                const { totalBreakTime, checkInTime, checkout } = result.employeeActivity;

                // Format check-in and check-out time to hh:mm
                const formattedCheckInTime = moment(checkInTime).format('HH:mm');
                const formattedCheckOutTime = checkout ? moment(checkout).format('HH:mm') : '00:00';

                let obj = {
                    checkInTime: formattedCheckInTime,
                    checkout: formattedCheckOutTime,
                    checkInStatus: result.employeeActivity.checkInStatus || 'No Status',
                    checkOutStatus: result.employeeActivity.checkOutStatus || 'No Status',
                }
                console.log(obj)

                setCheck(obj);

                setTotalBreakTime(totalBreakTime); // Set total break time in state
            
            } else {
                console.log("Invalid API response structure:", result);
            }
        } catch (error) {
            console.error("Error fetching activity data:", error);
        }
    };

    const fetchNameAndRole = async () => {
        try {
            const storedName = await AsyncStorage.getItem('name');
            const storedRole = await AsyncStorage.getItem('role');
            setName(storedName || '');
            setRole(storedRole || '');
        } catch (error) {
            console.error('Failed to fetch data from AsyncStorage:', error);
        }
    };

    const locationn = () => {
        GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 60000,
        })
            .then(location => {
                setLatitude(location.latitude);
                setLongitude(location.longitude);
            })
            .catch(error => {
                console.log(error);
            });
    };

    useEffect(() => {
        locationn();
    }, []);

    const time = async (d) => {
        const date = moment(d).format('YYYY-MM-DD');
        const Token = await AsyncStorage.getItem('token');
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${Token}`);

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow",
        };

        try {
            const response = await fetch(`http://3.110.104.79:3000/v1/auth/fetchEmployeeActivityByDate?date=${date}`, requestOptions);
            const result = await response.json();

            if (result.employeeActivity) {
                const formattedCheckInTime = moment(result.employeeActivity.checkInTime).format('HH:mm');
                const formattedCheckOutTime = result.employeeActivity.checkout ? moment(result.employeeActivity.checkout).format('HH:mm') : '00:00';

                setCheck({
                    checkInTime: formattedCheckInTime,
                    checkout: formattedCheckOutTime,
                    checkInStatus: result.employeeActivity.checkInStatus || 'No Status',
                    checkOutStatus: result.employeeActivity.checkOutStatus || 'No Status',
                });
            } else {
                setCheck({
                    checkInTime: '00:00',
                    checkout: '00:00',
                    checkInStatus: 'No Status',
                    checkOutStatus: 'No Status',
                });
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setCheck({
                checkInTime: '00:00',
                checkout: '00:00',
                checkInStatus: 'No Status',
                checkOutStatus: 'No Status',
            });
        }
    };

    const checkIn = async () => {
        try {
            const Token = await AsyncStorage.getItem('token');
            if (!Token) {
                Alert.alert("Error", "Token not found. Please log in again.");
                return;
            }

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("Authorization", `Bearer ${Token}`);

            if (latitude === null || longitude === null) {
                Alert.alert("Error", "Location not available. Please try again.");
                return;
            }

            const raw = JSON.stringify({
                latitude: latitude,
                longitude: longitude,
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow",
            };

            const response = await fetch("http://3.110.104.79:3000/v1/auth/employeeCheckIn", requestOptions);
            const result = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Successfully checked in!");
                setHasCheckedIn(true);
                setHasCheckedOut(false);
            } else {
                const errorMessage = "user is outside the office area" || "Something went wrong. Please try again.";
                Alert.alert("Error", errorMessage);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "An unexpected error occurred. Please try again.");
        }
    };

    const checkOut = async () => {
        try {
            const Token = await AsyncStorage.getItem('token');
            const employId = await AsyncStorage.getItem('uid');

            if (!Token || !employId) {
                Alert.alert("Error", "Token or Employee ID not found. Please log in again.");
                return;
            }

            // Validate latitude and longitude
            if (isNaN(latitude) || isNaN(longitude)) {
                Alert.alert("Error", "Invalid location data. Please try again.");
                return;
            }

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("Authorization", `Bearer ${Token}`);

            const raw = JSON.stringify({
                latitude: latitude,
                longitude: longitude,
            });

            const requestOptions = {
                method: "PUT",
                headers: myHeaders,
                body: raw,
                redirect: "follow"
            };

            const response = await fetch(`http://3.110.104.79:3000/v1/auth/employeeCheckOut?employeeActivityId=${employId}&latitude=${latitude}&longitude=${longitude}`, requestOptions);
            const result = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Successfully checked out!");
                setHasCheckedOut(true);
                setHasCheckedIn(false);
            } else {
                const errorMessage =  "user is outside the office area" || "Something went wrong. Please try again.";
                Alert.alert("Error", errorMessage);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "An unexpected error occurred. Please try again.");
        }
    };

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);
    };

    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const Logout = async () => {
        try {
            await AsyncStorage.removeItem("uid");
            await AsyncStorage.removeItem("name");
            await AsyncStorage.removeItem("role");
            await AsyncStorage.removeItem("token");
            props.navigation.replace('Login');
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };
    // useEffect(() => {
    //     BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    // }, []);

    // const handleBackPress = () => {
    //     if (props.navigation.isFocused()) {
    //         Alert.alert(
    //             "Exit App",
    //             "Do you want to exit?",
    //             [
    //                 { text: "No", style: "cancel" },
    //                 { text: "Yes", onPress: () => BackHandler.exitApp() },
    //             ],
    //             { cancelable: false }
    //         );
    //         return true;
    //     } else {
    //         return false;
    //     }
    // };

    return (
        <SafeAreaView style={{ ...Styles.main, backgroundColor: isDarkMode ? "black" : "white" }}>
            <TouchableOpacity
                style={Styles.floatingButton}
                onPress={toggleModal}
            >
                <Image source={require('../utilites/Images/10.png')} style={{ height: 35, width: 120, tintColor: '#00bfff' }} resizeMode="contain" />
            </TouchableOpacity>
            <ScrollView>
                <View style={Styles.V1}>
                    <TouchableOpacity style={Styles.touch}>
                        <Image source={require('../utilites/Images/1.png')} style={Styles.img} />
                    </TouchableOpacity>
                    <View style={Styles.V2}>
                        <Text style={{ ...Styles.txt1, color: isDarkMode ? 'white' : 'black' }}>
                            {name || 'Loading...'}
                        </Text>
                        <Text style={{ ...Styles.txt, color: isDarkMode ? 'white' : 'black' }}>
                            {role || 'Loading...'}
                        </Text>
                    </View>
                    <TouchableOpacity style={Styles.touch1} onPress={() => props.navigation.navigate('Activity')}>
                        <Image source={require('../utilites/Images/4.png')} style={Styles.img1} resizeMode='contain' />
                    </TouchableOpacity>
                </View>

                <View>
                    <CalendarStrip
                        style={{ paddingTop: 20, paddingBottom: 0 }}
                        calendarColor={'#ffffff'}
                        calendarHeaderStyle={{ color: '#000000' }}
                        dateNameStyle={{ color: 'black', fontSize: 15 }}
                        dateNumberStyle={{ color: 'black' }}
                        highlightDateContainerStyle={{ backgroundColor: '#004CFF' }}
                        highlightDateNameStyle={{ color: 'white' }}
                        highlightDateNumberStyle={{ color: 'white' }}
                        showMonth={false}
                        selectedDate={selectedDate}
                        onDateSelected={(date) => {
                            time(date);
                            setSelectedDate(moment(date));
                        }}
                        useScrollView={true}
                        scrollable={true}
                        leftSelector={<></>}
                        rightSelector={<></>}
                        maxDate={new Date()}
                        datesBlacklist={(date) => date.isoWeekday() === 6 || date.isoWeekday() === 7}
                    />
                </View>
                <View style={Styles.V3}>
                    <Text style={Styles.txt2}>Today Attendance</Text>
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', width: width / 1.3 }}>
                        <CheckComponent
                            text={'Check In'}
                            time={check.checkInTime}
                            txt={check.checkInStatus}
                            src={require('../utilites/Images/11.png')}
                        />
                        <CheckComponent
                            text={'Check Out'}
                            time={check.checkout}
                            txt={'Go Home'}
                            src={require('../utilites/Images/6.png')}
                        />
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', width: width / 1.3 }}>
                        <CheckComponent
                            text={'Break'}
                            txt={'Total Break Time'}
                            time={`${totalBreakTime.toFixed(2)} min`} // Display total break time in minutes
                            src={require('../utilites/Images/7.png')}
                        />
                        <CheckComponent
                            text={'Overtime'}
                            txt={'Time'}
                            time={'00:00 min'}
                            src={require('../utilites/Images/8.png')}
                        />
                    </View>
                </View>
                {selectedDate.isSame(moment(), 'day') && (
                    <View>
                        <View style={{ marginVertical: 20 }}>
                            <Buttoncomponent
                                title={'Check In'}
                                disabled={hasCheckedIn || loading}
                                onPress={checkIn}
                                style={!hasCheckedIn ? {} : Styles.disabledButton}
                            />
                        </View>
                        <Buttoncomponent
                            title={'Check Out'}
                            disabled={!hasCheckedIn || hasCheckedOut || loading}
                            onPress={checkOut}
                            style={hasCheckedIn && !hasCheckedOut ? {} : Styles.disabledButton}
                        />
                    </View>
                )}

                <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
                    <View style={Styles.modalContent}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: 'black', textAlign: 'center' }}>
                            Are you sure you want to logout?
                        </Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 20 }}>
                            <TouchableOpacity onPress={toggleModal} style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 5 }}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={Logout} style={{ padding: 10, backgroundColor: '#004CFF', borderRadius: 5 }}>
                                <Text style={{ color: 'white' }}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
};

const Styles = StyleSheet.create({
    main: {
        flex: 1,
        padding: 10,
    },
    V1: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        width: width / 1.1,
    },
    touch: {
        height: width / 6,
        width: width / 6,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: width / 1,
        elevation: 5,
    },
    img: {
        height: width / 7,
        width: width / 7,
        borderWidth: 2,
    },
    txt1: {
        fontSize: 23,
        fontWeight: '600',
    },
    txt: {
        color: "black",
    },
    V2: {
        marginLeft: 15,
    },
    touch1: {
        height: width / 10,
        width: width / 10,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: width / 1,
        elevation: 5,
        marginLeft: width / 2.2,
    },
    img1: {
        height: width / 15,
        width: width / 15,
    },
    V3: {
        width: width / 1.13,
        height: width / 1.3,
        backgroundColor: '#f5f5f5',
        marginTop: width / 10,
        borderRadius: 20,
        padding: 20,
        alignSelf: "center",
    },
    txt2: {
        fontSize: 18,
        fontWeight: '600',
    },
    disabledButton: {
        backgroundColor: '#f0f0f0',
        opacity: 0.5,
    },
    floatingButton: {
        height: 45,
        width: 45,
        borderRadius: width / 1,
        backgroundColor: '#e0ffff',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
        position: "absolute",
        bottom: 25,
        right: 15,
        zIndex: 1,
    },
    modalContent: {
        backgroundColor: "white",
        height: 140,
        justifyContent: "space-evenly",
        borderRadius: 13,
        padding: 10,
    },
});

export default Home;