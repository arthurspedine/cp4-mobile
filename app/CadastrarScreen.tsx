import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../src/services/firebaseConfig";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { useTheme } from "../src/context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function CadastroScreen() {
	const { t } = useTranslation();
	const { colors } = useTheme();
	const { setUser } = useAuth();
	const router = useRouter();

	// Estados para armazenar os valores digitados
	const [nome, setNome] = useState("");
	const [email, setEmail] = useState("");
	const [senha, setSenha] = useState("");
	const [confirmarSenha, setConfirmarSenha] = useState("");
	const [loading, setLoading] = useState(false);

	// Função para validar os dados
	const validarDados = () => {
		if (!nome.trim()) {
			Alert.alert(
				t("attention") || "Atenção",
				t("enterFullName") || "Digite seu nome completo!",
			);
			return false;
		}

		if (!email.trim()) {
			Alert.alert(
				t("attention") || "Atenção",
				t("enterEmail") || "Digite seu e-mail!",
			);
			return false;
		}

		if (!senha) {
			Alert.alert(
				t("attention") || "Atenção",
				t("enterPassword") || "Digite sua senha!",
			);
			return false;
		}

		if (senha.length < 6) {
			Alert.alert(
				t("attention") || "Atenção",
				t("passwordMinLength") || "A senha deve ter pelo menos 6 caracteres!",
			);
			return false;
		}

		if (senha !== confirmarSenha) {
			Alert.alert(
				t("attention") || "Atenção",
				t("passwordsDontMatch") || "As senhas não coincidem!",
			);
			return false;
		}

		return true;
	};

	// Função para cadastro com email e senha
	const handleCadastro = async () => {
		if (!validarDados()) return;

		setLoading(true);
		try {
			// Criar usuário
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email.trim(),
				senha,
			);
			const user = userCredential.user;

			// Atualizar o perfil com o nome
			await updateProfile(user, {
				displayName: nome.trim(),
			});

			// Atualizar o contexto
			setUser(user);

			Alert.alert(
				t("success") || "Sucesso",
				t("accountCreatedSuccessfully") || "Conta criada com sucesso!",
				[
					{
						text: "OK",
						onPress: () => router.replace("/HomeScreen"),
					},
				],
			);
		} catch (error: unknown) {
			console.log("Erro no cadastro:", error);

			let errorMessage =
				t("registrationError") || "Erro ao criar conta. Tente novamente.";

			if (error instanceof Error) {
				if (error.message.includes("auth/email-already-in-use")) {
					errorMessage =
						t("emailAlreadyInUse") || "Este e-mail já está cadastrado.";
				} else if (error.message.includes("auth/invalid-email")) {
					errorMessage = t("invalidEmail") || "E-mail inválido.";
				} else if (error.message.includes("auth/weak-password")) {
					errorMessage = t("weakPassword") || "Senha muito fraca.";
				}
			}

			Alert.alert(t("error") || "Erro", errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			style={[styles.container, { backgroundColor: colors.background }]}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<ScrollView
				contentContainerStyle={styles.scrollContainer}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.header}>
					<Text style={[styles.titulo, { color: colors.text }]}>
						{t("createAccount") || "Criar Conta"}
					</Text>
					<Text style={[styles.subtitle, { color: colors.textSecondary }]}>
						{t("signUpToContinue") || "Cadastre-se para continuar"}
					</Text>
				</View>

				<View style={styles.form}>
					{/* Campo Nome */}
					<View style={styles.inputContainer}>
						<Text style={[styles.inputLabel, { color: colors.text }]}>
							{t("fullName") || "Nome completo"}
						</Text>
						<TextInput
							style={[
								styles.input,
								{
									color: colors.text,
									borderColor: colors.border,
									backgroundColor: colors.inputBackground,
								},
							]}
							placeholder={t("enterYourFullName") || "Digite seu nome completo"}
							placeholderTextColor={colors.textSecondary}
							value={nome}
							onChangeText={setNome}
							editable={!loading}
							autoCapitalize="words"
						/>
					</View>

					{/* Campo Email */}
					<View style={styles.inputContainer}>
						<Text style={[styles.inputLabel, { color: colors.text }]}>
							{t("email") || "E-mail"}
						</Text>
						<TextInput
							style={[
								styles.input,
								{
									color: colors.text,
									borderColor: colors.border,
									backgroundColor: colors.inputBackground,
								},
							]}
							placeholder={t("enterYourEmail") || "Digite seu e-mail"}
							placeholderTextColor={colors.textSecondary}
							keyboardType="email-address"
							autoCapitalize="none"
							value={email}
							onChangeText={setEmail}
							editable={!loading}
						/>
					</View>

					{/* Campo Senha */}
					<View style={styles.inputContainer}>
						<Text style={[styles.inputLabel, { color: colors.text }]}>
							{t("password") || "Senha"}
						</Text>
						<TextInput
							style={[
								styles.input,
								{
									color: colors.text,
									borderColor: colors.border,
									backgroundColor: colors.inputBackground,
								},
							]}
							placeholder={
								t("enterYourPassword") || "Digite sua senha (min. 6 caracteres)"
							}
							placeholderTextColor={colors.textSecondary}
							secureTextEntry
							value={senha}
							onChangeText={setSenha}
							editable={!loading}
						/>
					</View>

					{/* Campo Confirmar Senha */}
					<View style={styles.inputContainer}>
						<Text style={[styles.inputLabel, { color: colors.text }]}>
							{t("confirmPassword") || "Confirmar senha"}
						</Text>
						<TextInput
							style={[
								styles.input,
								{
									color: colors.text,
									borderColor: colors.border,
									backgroundColor: colors.inputBackground,
								},
							]}
							placeholder={t("confirmYourPassword") || "Confirme sua senha"}
							placeholderTextColor={colors.textSecondary}
							secureTextEntry
							value={confirmarSenha}
							onChangeText={setConfirmarSenha}
							editable={!loading}
						/>
					</View>

					{/* Botão Cadastrar */}
					<TouchableOpacity
						style={[styles.botao, { backgroundColor: colors.primary }]}
						onPress={handleCadastro}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.textoBotao}>
								{t("register") || "Cadastrar"}
							</Text>
						)}
					</TouchableOpacity>

					{/* Divisor */}
					<View style={styles.divider}>
						<View
							style={[styles.dividerLine, { backgroundColor: colors.border }]}
						/>
						<Text style={[styles.dividerText, { color: colors.textSecondary }]}>
							{t("or") || "ou"}
						</Text>
						<View
							style={[styles.dividerLine, { backgroundColor: colors.border }]}
						/>
					</View>
				</View>

				{/* Link para Login */}
				<View style={styles.footer}>
					<TouchableOpacity onPress={() => router.back()}>
						<Text style={[styles.backToLoginText, { color: colors.text }]}>
							{t("alreadyHaveAccount") || "Já tem uma conta?"}{" "}
							<Text style={{ color: colors.primary }}>
								{t("signIn") || "Entrar"}
							</Text>
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
	},
	scrollContainer: {
		flexGrow: 1,
		justifyContent: "center",
	},
	header: {
		alignItems: "center",
		marginBottom: 40,
	},
	titulo: {
		fontSize: 32,
		fontWeight: "bold",
		marginBottom: 8,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 16,
		textAlign: "center",
	},
	form: {
		marginBottom: 30,
	},
	inputContainer: {
		marginBottom: 20,
	},
	inputLabel: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
	},
	input: {
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		borderWidth: 1.5,
	},
	botao: {
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
		marginBottom: 20,
	},
	textoBotao: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
	divider: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 20,
	},
	dividerLine: {
		flex: 1,
		height: 1,
	},
	dividerText: {
		marginHorizontal: 15,
		fontSize: 16,
	},
	footer: {
		alignItems: "center",
		marginTop: 20,
	},
	backToLoginText: {
		fontSize: 16,
		textAlign: "center",
	},
});
