import { StyleSheet, View, Text, Pressable, Alert } from "react-native";
import { FontAwesome, MaterialIcons } from '@expo/vector-icons'
import { useEffect, useState } from "react";
import { doc, updateDoc, db, deleteDoc } from '../services/firebaseConfig'

export default function ItemLoja(props: any) {
    const [isChecked, setIsChecked] = useState(props.isChecked)

    const updateIsChecked = async () => {
        const produtoRef = doc(db, 'items', props.id)

        await updateDoc(produtoRef, {
            isChecked: isChecked
        })
    }

    const deleteProduto = async () => {
        Alert.alert("Deseja Excluir?", "Essa ação não poderá ser desfeita", [
            { text: 'Cancelar' },
            {
                text: 'Excluir',
                onPress: async () => await deleteDoc(doc(db, 'items', props.id))
            }
        ],{cancelable:true})

    }

    useEffect(() => {
        updateIsChecked()
    }, [isChecked])

    return (
        <View style={styles.container}>
            <Pressable onPress={() => setIsChecked(!isChecked)}>
                {isChecked ? (
                    <FontAwesome name='check-circle' size={24} color='black' />
                ) : (
                    <FontAwesome name='check-circle-o' size={24} color='black' />
                )}


            </Pressable>
            <Text style={styles.texto}>{props.nomeProduto}</Text>
            <Pressable onPress={deleteProduto}>
                <MaterialIcons name='delete' size={24} color='black' />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'lightgray',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '90%',
        alignSelf: 'center',
        marginTop: 10,
        padding: 10,
        borderRadius: 10
    },
    texto: {
        flex: 1,
        marginLeft: 10,
        fontSize: 17,
        fontWeight: 500
    }
})