import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { updatePassword,reauthenticateWithCredential , EmailAuthProvider} from 'firebase/auth';
import { auth } from "../src/services/firebaseConfig"
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function AlterarSenhaScreen() {
  // Estados para armazenar os valores digitados
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');

  const router = useRouter()//Hook de navegação..

  //Função de atualizar Senha
    const handleAlterarSenha = async()=>{
        if(!novaSenha || !confirmarSenha || !senhaAtual){
            Alert.alert("Atenção","Preencha todos os campos!")
            return
        }
        try{
            const user = auth.currentUser;
            if(!user || !user.email){
                Alert.alert("Error","Nenhum usuário logado")
                return
            }
            //Criar as credenciais com email e senha atual para reautenticar
            const credential = EmailAuthProvider.credential(user.email,senhaAtual);
            await reauthenticateWithCredential(user,credential)

            //Após autenticar, atualizar/alterar a senha
            await updatePassword(user,novaSenha)
            Alert.alert("Sucesso","Senha alterada com sucesso")
            router.push("/HomeScreen") 
        }catch(error:any){
            Alert.alert("Atenção","Error ao alterar")
            console.log("Erro ao alterar senha")
          }
      }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Criar Conta</Text>

      {/* Campo Nome */}
      <TextInput
        style={styles.input}
        placeholder="Digite a senha atual"
        placeholderTextColor="#aaa"
        value={senhaAtual}
        onChangeText={setSenhaAtual}
      />

      {/* Campo Email */}
      <TextInput
        style={styles.input}
        placeholder='Digite a nova senha'
        placeholderTextColor="#aaa"
        value={novaSenha}
        onChangeText={setNovaSenha}
      />

      {/* Campo Senha */}
      <TextInput
        style={styles.input}
        placeholder="Repita a nova senha"
        placeholderTextColor="#aaa"
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
      />

      {/* Botão */}
      <TouchableOpacity style={styles.botao} onPress={handleAlterarSenha}>
        <Text style={styles.textoBotao}>Alterar Senha</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilização
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#fff',
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
  },
  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
