import React from "react";
import { TouchableOpacity,Text,StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggleButton(){
    const{toggleTheme,colors}=useTheme()

    return(
        <TouchableOpacity
            style={[styles.button,{backgroundColor:colors.button}]}
            onPress={toggleTheme}        >
            <Text style={[styles.text,{color:colors.buttonText}]}>Alternar Tema</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button:{
        paddingVertical:12,
        paddingHorizontal:24,
        borderRadius:8,
        marginTop:20
    },
    text:{
        fontSize:16,
        fontWeight:'bold'
    }
})