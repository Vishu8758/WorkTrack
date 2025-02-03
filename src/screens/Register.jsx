import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, SafeAreaView, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
// import AsyncStorage from '@react-native-async-storage/async-storage';abd 
import { Buttoncomponent, InputComponent, width } from '../utilites/Helper'
import firestore from '@react-native-firebase/firestore';
import { useFormik } from "formik";
import { registerSchema } from '../utilites/Schema';
import GetLocation from 'react-native-get-location'
// import AsyncStorage from "@react-native-async-storage/async-storage";

const Register = (props) => {

    // const [location,setLocation]=useState('')
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')

    const locationn = () => {
        GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 60000,
        })
            .then(location => {
                console.log(location);
                // setLocation(location)
                setLatitude(location.latitude)
                setLongitude(location.longitude)
            })
            .catch(error => {
                const { code, message } = error;
                console.warn(code, message);
            })
    }
    useEffect(() => {
        //   data()
        locationn()
    }, [])


    const data = () => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            name: formik.values.name,
            jobRole: formik.values.jobRole,
            password: formik.values.password,
            employeeId: formik.values.employeeId,
            email: formik.values.email,
            longitude: latitude,
            latitude: longitude
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch("http://3.110.104.79:3000/v1/auth/signup", requestOptions)
            .then((response) => response.json())
            .then((result) => {console.log(result)
                if(result){
                    props.navigation.navigate('Login') 
                }
            })
            .catch((error) => console.error(error));
    }

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            employeeId: "",
            jobRole: "",
            Status: false,
        },
        validationSchema: registerSchema,
        onSubmit: () => { data(), Alert.alert('Success', 'User registered successfully!')},
    });


    const handleAdd = async () => {
        try {
            const userRef = firestore().collection('Users');
            const querySnapshot = await userRef.where('email', '==', formik.values.email).get();
            if (!querySnapshot.empty) {
                Alert.alert('Error', 'This email is already registered. Please use a different email.');
                return;
            }
            const newUserRef = userRef.doc();
            const uid = newUserRef.id;
            await newUserRef.set({
                id: uid, // Store the unique document ID
                name: formik.values.name,
                email: formik.values.email,
                password: formik.values.password,
                confirmPassword: formik.values.confirmPassword,
                employeeId: formik.values.employeeId,
                jobRole: formik.values.jobRole,

            });

            Alert.alert('Success', 'User registered successfully!');
            props.navigation.navigate('Login');
        } catch (error) {
            console.error('Error saving user data:', error);
            Alert.alert('Error', 'Failed to register. Please try again.');
        }
    };

    return (
        <View>
            <SafeAreaView Style={Styles.main}>
                <ImageBackground source={require('../utilites/Images/2.png')} style={{ height: '100%', width: '100%' }}>
                    <KeyboardAwareScrollView>
                        <View style={Styles.V1}>
                            <Text style={Styles.txt} >Register !!</Text>

                            <InputComponent placeholder={'Name'} value={formik.values.name}
                                onChangeText={formik.handleChange("name")} />
                            {formik.touched.name && formik.errors.name && (
                                <Text style={Styles.errorText}>{formik.errors.name}</Text>
                            )}

                            <InputComponent placeholder={'Email'} value={formik.values.email}
                                onChangeText={formik.handleChange("email")} />
                            {formik.touched.email && formik.errors.email && (
                                <Text style={Styles.errorText}>{formik.errors.email}</Text>
                            )}
                            <InputComponent placeholder={'Password'} value={formik.values.password}
                                onChangeText={formik.handleChange("password")} />
                            {formik.touched.password && formik.errors.password && (
                                <Text style={Styles.errorText}>{formik.errors.password}</Text>
                            )}
                            <InputComponent placeholder={' Confirm Password'} value={formik.values.confirmPassword}
                                onChangeText={formik.handleChange("confirmPassword")} />
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                <Text style={Styles.errorText}>{formik.errors.confirmPassword}</Text>
                            )}
                            <InputComponent placeholder={' Employee Id'} value={formik.values.employeeId}
                                onChangeText={formik.handleChange("employeeId")} />
                            {formik.touched.employeeId && formik.errors.employeeId && (
                                <Text style={Styles.errorText}>{formik.errors.employeeId}</Text>
                            )}
                            <InputComponent placeholder={' Job Role'} value={formik.values.jobRole}
                                onChangeText={formik.handleChange("jobRole")} />
                            {formik.touched.jobRole && formik.errors.jobRole && (
                                <Text style={Styles.errorText}>{formik.errors.jobRole}</Text>
                            )}
                        </View>
                        <View style={Styles.V2}>
                            <Buttoncomponent title={'Next'} onPress={formik.handleSubmit} />
                            <TouchableOpacity onPress={() => props.navigation.navigate('Login')} >
                                <Text style={Styles.txt2}>Cancel</Text>
                            </TouchableOpacity>
                        </View>

                    </KeyboardAwareScrollView>
                </ImageBackground>
            </SafeAreaView>
        </View>
    )
}

export default Register

const Styles = StyleSheet.create({
    main: {
        flex: 1
    },
    txt: {
        fontSize: 45,
        color: 'white'
    }, V1: {
        marginTop: width / 12,
        marginHorizontal: width / 11
    },
    txt1: {
        fontSize: 20,
        color: 'black',
        marginVertical: width / 25
    }, V2: {
        marginVertical: 50
    }, txt2: {
        fontSize: 20,
        marginVertical: width / 25,
        textAlign: 'center'
    }, errorText: {
        color: 'red',
        fontSize: 14,
        marginTop: 5,
    },
})