import { Text, TouchableOpacity, Dimensions, Image, View, TextInput } from "react-native"

export const height = Dimensions.get("window").height
export const width = Dimensions.get("window").width

export const Buttoncomponent = ({disabled, onPress, title }) => {
    return (
        <TouchableOpacity style={{
            height: width / 6,
            width: width / 1.2,
            borderRadius: 20,
            backgroundColor: '#004CFF',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            opacity:disabled? 0.5:1
        }} onPress={onPress}>
            <Text style={{ color: 'white', fontSize: 20 }}>{title}</Text>
        </TouchableOpacity>
    )
}
export const InputComponent = ({ placeholder, eye, onPress, isPassword, keyboardType, onChangeText, value, onFocus, onBlur,secureTextEntry }) => {
    return (
        <View style={{ flexDirection: 'row' }}>
            <TextInput style={{
                height: width / 6,
                width: width / 1.25,
                borderRadius: 20,
                backgroundColor: '#F8F8F8',
                elevation: 2,
                padding: 20,
                marginVertical: 10,

            }} placeholder={placeholder}
                secureTextEntry={isPassword}
                keyboardType={keyboardType}
                onChangeText={onChangeText}
                value={value}
                onFocus={onFocus}
                onBlur={onBlur}
            />
            {eye && <TouchableOpacity style={{ alignSelf: 'center', position: 'absolute', right: 20 }} onPress={onPress}>
                <Image source={eye} style={{ height: width / 18, width: width / 18, alignSelf: 'center', tintColor: '#626262', }} resizeMode="contain" />
            </TouchableOpacity>}
        </View>
    )
}

export const CheckComponent = ({ text, txt, src, time }) => {
    return (
        <View style={{
            width: width / 2.7,
            height: width / 4,
            backgroundColor: 'white',
            marginTop: 20,
            borderRadius: 20,
            padding: 15
        }}>
            <View style={{
                flexDirection: 'row',

                alignItems: 'center'
            }}>
                <View style={{
                    height: 25, width: 25, borderRadius: width / 1, backgroundColor: '#e0ffff',
                    justifyContent: 'center', alignItems: 'center'
                }}>
                    <Image source={src} style={{ height: 20, width: 120, tintColor: '#00bfff' }} resizeMode="contain" />
                </View>
                <Text style={{ color: 'black', fontSize: 18, left: 10 }}>{text}</Text>
            </View>
            <Text style={{
                color: 'black',
                fontSize: 18,
                fontWeight: '600',
                top: 10
            }}>
                {time}
            </Text>
            <Text style={{ color: 'black', fontSize: 15, top: 10 }}>{txt}</Text>

        </View>
    )
}