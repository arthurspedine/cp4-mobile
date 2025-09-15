import { Link } from "expo-router";
import React, { useState, useEffect } from "react";
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
import { useRouter } from "expo-router";
import {
	signInWithEmailAndPassword,
	sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../src/services/firebaseConfig";
import { useAuth } from "../src/context/AuthContext";
import { useTheme } from "../src/context/ThemeContext";
import ThemeToggleButton from "../src/components/ThemeToggleButton";
import { useTranslation } from "react-i18next";

export default function LoginScreen() {
	const { t, i18n } = useTranslation();
	const { colors } = useTheme();
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [senha, setSenha] = useState("");
	const [loading, setLoading] = useState(false);

	// Redireciona se o usuário já está logado
	useEffect(() => {
		if (!authLoading && user) {
			router.replace("/HomeScreen");
		}
	}, [user, authLoading, router]);

	// Função para mudar o idioma
	const mudarIdioma = (lang: string) => {
		i18n.changeLanguage(lang);
	};

	// Login com email e senha
	const handleLogin = async () => {
		if (!email || !senha) {
			Alert.alert(
				t("attention") || "Atenção",
				t("fillAllFields") || "Preencha todos os campos!",
			);
			return;
		}

		setLoading(true);
		try {
			await signInWithEmailAndPassword(auth, email, senha);
			// O AuthContext irá lidar com o redirecionamento
		} catch (error: unknown) {
			console.log("Error:", error);

			let errorMessage =
				t("loginError") || "Erro ao fazer login. Tente novamente.";

			if (error instanceof Error) {
				if (error.message.includes("auth/invalid-credential")) {
					errorMessage =
						t("invalidCredentials") || "E-mail ou senha incorretos, verifique.";
				}
			}

			Alert.alert(t("attention") || "Atenção", errorMessage);
		} finally {
			setLoading(false);
		}
	};

	// Esqueceu a senha
	const esqueceuSenha = async () => {
		if (!email) {
			Alert.alert(
				t("attention") || "Atenção",
				t("enterEmailToRecover") || "Digite o e-mail para recuperar a senha",
			);
			return;
		}

		try {
			await sendPasswordResetEmail(auth, email);
			Alert.alert(
				t("success") || "Sucesso",
				t("recoveryEmailSent") || "Email de recuperação enviado",
			);
		} catch (error: unknown) {
			console.log("Error", error);
			Alert.alert(
				t("error") || "Erro",
				t("errorSendingRecoveryEmail") ||
					"Erro ao enviar e-mail de reset de senha",
			);
		}
	};

	if (authLoading) {
		return (
			<View
				style={[
					styles.container,
					styles.centered,
					{ backgroundColor: colors.background },
				]}
			>
				<ActivityIndicator size="large" color={colors.primary} />
				<Text style={[styles.loadingText, { color: colors.text }]}>
					{t("loading") || "Carregando..."}
				</Text>
			</View>
		);
	}

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
						{t("welcome") || "Bem-vindo"}
					</Text>
					<Text style={[styles.subtitle, { color: colors.textSecondary }]}>
						{t("signInToContinue") || "Faça login para continuar"}
					</Text>
				</View>

				<View style={styles.form}>
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
							placeholder={t("enterYourPassword") || "Digite sua senha"}
							placeholderTextColor={colors.textSecondary}
							secureTextEntry
							value={senha}
							onChangeText={setSenha}
							editable={!loading}
						/>
					</View>

					{/* Botão Login com Email */}
					<TouchableOpacity
						style={[styles.botao, { backgroundColor: colors.primary }]}
						onPress={handleLogin}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.textoBotao}>{t("signIn") || "Entrar"}</Text>
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

					{/* Link Esqueceu Senha */}
					<TouchableOpacity
						onPress={esqueceuSenha}
						style={styles.forgotPassword}
					>
						<Text
							style={[styles.forgotPasswordText, { color: colors.primary }]}
						>
							{t("forgotPassword") || "Esqueceu a senha?"}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Rodapé */}
				<View style={styles.footer}>
					{/* Botões de Idioma */}
					<View style={styles.languageContainer}>
						<TouchableOpacity
							onPress={() => mudarIdioma("en")}
							style={[styles.languageButton, { backgroundColor: "#007bff" }]}
						>
							<Text style={styles.languageButtonText}>EN</Text>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => mudarIdioma("pt")}
							style={[styles.languageButton, { backgroundColor: "#14e641" }]}
						>
							<Text style={styles.languageButtonText}>PT</Text>
						</TouchableOpacity>
					</View>

					<ThemeToggleButton />

					{/* Link para Cadastro */}
					<Link href="CadastrarScreen" asChild>
						<TouchableOpacity style={styles.registerLink}>
							<Text style={[styles.registerLinkText, { color: colors.text }]}>
								{t("dontHaveAccount") || "Não tem uma conta?"}{" "}
								<Text style={{ color: colors.primary }}>
									{t("register") || "Cadastre-se"}
								</Text>
							</Text>
						</TouchableOpacity>
					</Link>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

// Estilização
const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
	},
	centered: {
		justifyContent: "center",
		alignItems: "center",
	},
	scrollContainer: {
		flexGrow: 1,
		justifyContent: "center",
	},
	loadingText: {
		marginTop: 10,
		fontSize: 16,
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
	forgotPassword: {
		alignItems: "center",
		marginVertical: 10,
	},
	forgotPasswordText: {
		fontSize: 16,
		fontWeight: "600",
	},
	footer: {
		alignItems: "center",
	},
	languageContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 20,
	},
	languageButton: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 8,
		marginHorizontal: 10,
	},
	languageButtonText: {
		color: "#fff",
		fontWeight: "bold",
	},
	registerLink: {
		marginTop: 20,
		alignItems: "center",
	},
	registerLinkText: {
		fontSize: 16,
		textAlign: "center",
	},
});
