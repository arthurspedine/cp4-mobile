import { SafeAreaView } from "react-native-safe-area-context";
import {
	Text,
	Button,
	TextInput,
	StyleSheet,
	ActivityIndicator,
	FlatList,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useRouter } from "expo-router";
import ItemLoja from "../src/components/ItemLoja";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { deleteUser } from "firebase/auth";
import {
	auth,
	db,
	addDoc,
	collection,
	getDocs,
} from "../src/services/firebaseConfig";
import { useAuth } from "../src/context/AuthContext";
import ThemeToggleButton from "../src/components/ThemeToggleButton";
import { useTheme } from "../src/context/ThemeContext";
import { useTranslation } from "react-i18next";
import * as Notifications from "expo-notifications";

export default function HomeScreen() {
	const { t } = useTranslation();
	const { colors } = useTheme();
	const { user, signOut } = useAuth();
	const router = useRouter();
	const [nomeProduto, setNomeProduto] = useState("");

	interface Item {
		id: string;
		nomeProduto: string;
		isChecked: boolean;
	}
	const [listaItems, setListaItems] = useState<Item[]>([]);

	const realizarLogoff = async () => {
		try {
			await signOut();
			router.replace("/");
		} catch (error) {
			console.error("Erro ao fazer logout:", error);
			Alert.alert(
				t("error") || "Erro",
				t("logoutError") || "Erro ao fazer logout",
			);
		}
	};

	const excluirConta = () => {
		Alert.alert(
			t("confirmDelete") || "Confirmar Exclusão",
			t("confirmDeleteMessage") ||
				"Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita.",
			[
				{ text: t("cancel") || "Cancelar", style: "cancel" },
				{
					text: t("delete") || "Excluir",
					style: "destructive",
					onPress: async () => {
						try {
							const currentUser = auth.currentUser;
							if (currentUser) {
								await deleteUser(currentUser);
								Alert.alert(
									t("accountDeleted") || "Conta Excluída",
									t("accountDeletedMessage") ||
										"Sua conta foi excluída com sucesso.",
								);
								router.replace("/");
							} else {
								Alert.alert("Error", "Nenhu usuário logado");
							}
						} catch (error) {
							console.log("Erro ao excluir conta");
							Alert.alert("Error", "Não foi possivel excluir a conta");
						}
					},
				},
			],
		);
	};
	const salvarItem = async () => {
		try {
			const docRef = await addDoc(collection(db, "tasks"), {
				nomeProduto: nomeProduto,
				isChecked: false,
			});
			setNomeProduto(""); //Limpa o Text Input
			Alert.alert("Sucesso", "Produto Salvo com Sucesso.");
		} catch (e) {
			console.log("Erro ao criar o produto", e);
		}
	};

	const buscarTasks = async () => {
		try {
			const querySnapshot = await getDocs(collection(db, "tasks"));
			const tasks: any = [];

			querySnapshot.forEach((item) => {
				tasks.push({
					...item.data(),
					id: item.id,
				});
			});
			setListaItems(tasks);
			console.log("Tasks carregadas", tasks);
		} catch (e) {
			console.log("Erro ao carregar as tasks", e);
		}
	};
	//Função para disparar a notificação local
	const dispararNotificacao = async () => {
		await Notifications.scheduleNotificationAsync({
			content: {
				title: "Promoções do dia!",
				body: "Aproveite as melhores ofertas!!",
			},
			trigger: {
				type: "timeInterval", //tipo de trigger: intervalo de tempo
				seconds: 2, //aguarda 02 segundos para disparar
				repeats: false,
			} as Notifications.TimeIntervalTriggerInput,
		});
	};

	const registerForPushNotificationsAsync = async (): Promise<
		string | null
	> => {
		try {
			const tokenData = await Notifications.getExpoPushTokenAsync();
			const token = tokenData.data;
			console.log("Token gerado com sucesso: ", token);
			return token;
		} catch (error) {
			console.log("Error ao gerar token", error);
			return null;
		}
	};
	useEffect(() => {
		//Ficar escutando se houve recebimento de notificação
		const subscription = Notifications.addNotificationReceivedListener(
			(notification) => {
				console.log("Notificação recebida: ", notification);
			},
		);
		//Função de limpeza que irá ser chamada quando for desfeito
		//Remove o listener para evitar multiplas chamadas.
		return () => subscription.remove();
	}, []);

	useEffect(() => {
		//Solicitar a permissão das notificações do aparelho
		(async () => {
			//Verificar o status da permissão de notificação do dispositivo
			const { status: existingStatus } =
				await Notifications.getPermissionsAsync();
			let finalStatus = existingStatus;

			//Solicita a permissão das notificações do dispositivo
			if (existingStatus !== "granted") {
				const { status } = await Notifications.requestPermissionsAsync();
				finalStatus = status;
			}
		})();
	}, []);

	useEffect(() => {
		buscarTasks();
	}, [listaItems]);

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<KeyboardAvoidingView //Componente que se ajuste automaticamente o layout
				style={styles.container}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={20} //descoloca o conteúdo em 20px
			>
				<Text style={[{ color: colors.text }]}>
					Seja bem-vindo, vc está logado!!!
				</Text>
				<ThemeToggleButton />
				<Button title="Realizar logoff" onPress={realizarLogoff} />
				<Button
					title="Alterar Senha"
					color="orange"
					onPress={() => router.push("/AlterarSenhaScreen")}
				/>
				<Button title="Excluir" color="red" onPress={excluirConta} />
				<Button
					title="Disparar notificação"
					color="purple"
					onPress={dispararNotificacao}
				/>

				{listaItems.length <= 0 ? (
					<ActivityIndicator />
				) : (
					<FlatList
						data={listaItems}
						renderItem={({ item }) => {
							return (
								<ItemLoja
									nomeProduto={item.nomeProduto}
									isChecked={item.isChecked}
									id={item.id}
								/>
							);
						}}
					/>
				)}

				<TextInput
					placeholder="Digite o nome produto"
					style={styles.input}
					value={nomeProduto}
					onChangeText={(value) => setNomeProduto(value)}
					onSubmitEditing={salvarItem}
				/>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	input: {
		backgroundColor: "lightgray",
		width: "90%",
		alignSelf: "center",
		marginTop: "auto",
		borderRadius: 10,
		paddingLeft: 20,
	},
});
