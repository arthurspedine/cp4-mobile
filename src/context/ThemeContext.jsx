import React,{createContext,useContext,useState} from "react";
import { Appearance } from "react-native";

//Cirando o contexto
const ThemeContext = createContext()

//Hook customizado para acesar o tema
export function useTheme(){
    return useContext(ThemeContext)
}

//Provider que irá envolver toda a aplicação
export default function ThemeProvider({children}){
    //Detectar o tema do dispositivo
    const colorScheme = Appearance.getColorScheme()
    //Estado para armazenar o tema (light ou dark)
    const[theme,setTheme]=useState(colorScheme||'light')

    //Alternar entre os temas
    const toggleTheme = ()=>{
        setTheme((prev)=>(prev === "light"?"dark":"light"));
    }

    //Definição das cores por tema
    const themeColors = {
        light:{
            background:'#fff',
            text:'#000',
            button:'#007',
            buttonText:'#fff'
        },
        dark:{
            background:'#121212',
            text:'#fff',
            button:'#59e067',
            buttonText:'#000'
        }
    }
    return(
        <ThemeContext.Provider value={{theme,toggleTheme,colors:themeColors[theme]}}>
            {children}
        </ThemeContext.Provider>
    )
}