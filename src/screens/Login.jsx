import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, SafeAreaView, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Buttoncomponent, InputComponent, width } from '../utilites/Helper';
import { useFormik } from "formik";
import firestore from '@react-native-firebase/firestore';
import { loginSchema } from '../utilites/Schema';
import AsyncStorage from "@react-native-async-storage/async-storage";
import GetLocation from 'react-native-get-location'

const Login = (props) => {

    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')

    const locationn = () => {
        GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 60000,
        })
            .then(location => {
                console.log(location);
                setLatitude(location.latitude)
                setLongitude(location.longitude)
            })
            .catch(error => {
                const { code, message } = error;
                console.warn(code, message);
            })
    }
    useEffect(() => {
        locationn()
    }, [])

    const details = async () => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            password: formik.values.password,
            email: formik.values.email,
            longitude: latitude,
            latitude: longitude
        });
        console.log(raw);

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        try {
            const response = await fetch("http://3.110.104.79:3000/v1/auth/login", requestOptions);
            const result = await response.json();
            console.log(result,"[[[[[[[[[[[[[[");

            if (result.success) {
                const { employeeId, name, jobRole,} = result.user;
                await AsyncStorage.setItem("token", result.token);
                await AsyncStorage.setItem("uid", employeeId);
                await AsyncStorage.setItem("name", name);
                await AsyncStorage.setItem("role", jobRole);

                Alert.alert("Success", "Login successful!", [
                    { text: "OK", onPress: () => props.navigation.navigate('Home') }
                ]);
            } else {
                Alert.alert("Error", result.message || "Something went wrong. Please try again.");
            }
        } catch (error) {
            console.error(error);
          
            Alert.alert("Error", "An unexpected error occurred. Please try again.");
        }
    };

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: loginSchema,
        onSubmit: async (values) => {
            details()
        },
    });

    return (
        <SafeAreaView style={Styles.main}>
            <ImageBackground source={require('../utilites/Images/2.png')} style={{ height: '100%', width: '100%' }}>
                <KeyboardAwareScrollView>
                    <View style={Styles.V1}>
                        <Text style={Styles.txt} onPress={() => props.navigation.navigate("Home")}>Login</Text>
                        <Text style={Styles.txt1}>Good to see you back! 🖤</Text>
                        <InputComponent
                            placeholder="Email"
                            value={formik.values.email}
                            onChangeText={formik.handleChange("email")}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <Text style={Styles.errorText}>{formik.errors.email}</Text>
                        )}
                        <InputComponent
                            placeholder="Password"
                            value={formik.values.password}
                            onChangeText={formik.handleChange("password")}
                            secureTextEntry={true}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <Text style={Styles.errorText}>{formik.errors.password}</Text>
                        )}
                    </View>

                    <View style={Styles.V2}>
                        <Buttoncomponent title="Next" onPress={formik.handleSubmit} />
                        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                            <Text style={Styles.txt3}>Don't have an account?</Text>
                            <Text style={Styles.txt4} onPress={() => props.navigation.navigate('Register')}>Register</Text>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default Login;

const Styles = StyleSheet.create({
    main: {
        flex: 1,
    },
    txt: {
        fontSize: 45,
        color: 'black',
    },
    V1: {
        marginTop: width / 1.5,
        marginHorizontal: width / 11,
    },
    txt1: {
        fontSize: 20,
        color: 'black',
        marginVertical: width / 25,
    },
    V2: {
        marginVertical: 50,
    },
    txt3: {
        fontSize: 20,
        color: 'black',
        marginVertical: width / 25,
        alignSelf: "center",
    },
    txt4: {
        fontSize: 20,
        color: '#004CFF',
        marginVertical: width / 25,
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginTop: 5,
    },
});