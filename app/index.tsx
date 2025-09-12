import { Link } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword,sendPasswordResetEmail } from 'firebase/auth';
import {auth} from '../src/services/firebaseConfig'
import { useTheme } from '../src/context/ThemeContext';
import ThemeToggleButton from '../src/components/ThemeToggleButton';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  //Hook que fornece a função 't' para tradução do idioma atual
  const{t,i18n}=useTranslation()

  //Função para mudar o idioma
  const mudarIdioma = (lang:string)=>{
    i18n.changeLanguage(lang)
  }

  //Colors do nosso ThemeContext
  const{colors} = useTheme()

  // Estados para armazenar os valores digitados

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const router = useRouter()//Hook de navegação..

  const verificarUsuarioLogado = async () => {
    try {
      const usuarioSalvo = await AsyncStorage.getItem("@user")
      if (usuarioSalvo) {
        router.push('/HomeScreen')//Redireciona para tela HomeScreen(usuario logado)
      }

    } catch (error) {
      console.log("Error ao verificar login", error)
    }
  }

  useEffect(() => {
    verificarUsuarioLogado()//Chama a função
  }, [])

  // Função para simular o envio do formulário
  const handleLogin = () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }
    //backend do login
    signInWithEmailAndPassword(auth, email, senha)
      .then(async(userCredential) => {
      const user = userCredential.user;
      await AsyncStorage.setItem('@user',JSON.stringify(user))
      router.push('/HomeScreen')
    
  })
      .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("Error:",errorMessage)
      if(error.code==="auth/invalid-credential"){
        Alert.alert("Atenção","E-mail ou senha incorretos, verifique.")
      }
  });
  };

  const esqueceuSenha = () =>{
    if(!email){
      alert("Digite o e-mail para recuperar a senha")
      return
    }
    sendPasswordResetEmail(auth,email)
      .then(()=>{
        alert("Email de recuperação enviado")
      })
      .catch((error)=>{
        console.log("Error",error.message)
        alert("Erro ao enviar e-mail de reset de senha")
      })

  }

  return (
    <View style={[styles.container,{backgroundColor:colors.background}]}>
      <Text style={[styles.titulo,{color:colors.text}]}>{t("welcome")}</Text>


      {/* Campo Email */}
      <TextInput
        style={[styles.input,{color:colors.text}]}
        placeholder="E-mail"
        placeholderTextColor={colors.text}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Campo Senha */}
      <TextInput
        style={[styles.input,{color:colors.text}]}
        placeholder={t("password")}
        placeholderTextColor={colors.text}
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      {/* Botão */}
      <TouchableOpacity style={styles.botao} onPress={handleLogin}>
        <Text style={styles.textoBotao}>Login</Text>
      </TouchableOpacity>

      <View style={
        {flexDirection:'row',
         justifyContent:'center',
         marginBottom:15}}>
        <TouchableOpacity 
          onPress={()=>mudarIdioma("en")}
          style={[styles.botao,{backgroundColor:"#007bff"}]}
        >
          <Text>EN</Text>
        </TouchableOpacity> 

        <TouchableOpacity  
          onPress={()=>mudarIdioma("pt")}
           style={[styles.botao,{backgroundColor:"#14e641"}]}
          >
          <Text>PT</Text>
        </TouchableOpacity> 
      </View>
      

      <ThemeToggleButton />

      <Link href="CadastrarScreen" style={{ marginTop: 20, color:colors.text, marginLeft: 150 }}>{t("register")}</Link>

      <Text style={{ marginTop: 20, color:colors.text, marginLeft: 130 }} onPress={esqueceuSenha}>Esquece a senha</Text>
    </View>
  );
}

// Estilização
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  botao: {
    backgroundColor: '#00B37E',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginRight:10,
    marginTop:10
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});