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
import {
	updatePassword,
	reauthenticateWithCredential,
	EmailAuthProvider,
} from "firebase/auth";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { useTheme } from "../src/context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function AlterarSenhaScreen() {
	const { t } = useTranslation();
	const { colors } = useTheme();
	const { user } = useAuth();
	const router = useRouter();

	// Estados para armazenar os valores digitados
	const [senhaAtual, setSenhaAtual] = useState("");
	const [novaSenha, setNovaSenha] = useState("");
	const [confirmarSenha, setConfirmarSenha] = useState("");
	const [loading, setLoading] = useState(false);

	// Função para validar os dados
	const validarDados = () => {
		if (!novaSenha) {
			Alert.alert(
				t("attention") || "Atenção",
				t("enterNewPassword") || "Digite a nova senha!",
			);
			return false;
		}

		if (novaSenha.length < 6) {
			Alert.alert(
				t("attention") || "Atenção",
				t("passwordMinLength") || "A senha deve ter pelo menos 6 caracteres!",
			);
			return false;
		}

		if (novaSenha !== confirmarSenha) {
			Alert.alert(
				t("attention") || "Atenção",
				t("passwordsDontMatch") || "As senhas não coincidem!",
			);
			return false;
		}

		// Se o usuário tem um provedor de email, precisa da senha atual
		if (
			user?.providerData.some(
				(provider) => provider.providerId === "password",
			) &&
			!senhaAtual
		) {
			Alert.alert(
				t("attention") || "Atenção",
				t("enterCurrentPassword") || "Digite sua senha atual para confirmar!",
			);
			return false;
		}

		return true;
	};

	// Função para reautenticar usuário com email/senha
	const reautenticarComEmail = async () => {
		if (!user?.email || !senhaAtual) {
			throw new Error("E-mail ou senha atual não fornecidos");
		}

		const credential = EmailAuthProvider.credential(user.email, senhaAtual);
		await reauthenticateWithCredential(user, credential);
	};

	// Função principal para alterar senha
	const handleAlterarSenha = async () => {
		if (!validarDados()) return;

		if (!user) {
			Alert.alert(
				t("error") || "Erro",
				t("noUserLoggedIn") || "Nenhum usuário logado",
			);
			return;
		}

		setLoading(true);
		try {
			// Verificar se o usuário tem provedor de email
			const hasEmailProvider = user.providerData.some(
				(provider) => provider.providerId === "password",
			);

			// Se tem provedor de email, reautenticar com email/senha
			if (hasEmailProvider) {
				await reautenticarComEmail();
			}

			// Atualizar a senha
			await updatePassword(user, novaSenha);

			Alert.alert(
				t("success") || "Sucesso",
				t("passwordChangedSuccessfully") || "Senha alterada com sucesso!",
				[{ text: "OK", onPress: () => router.back() }],
			);
		} catch (error: unknown) {
			console.log("Erro ao alterar senha:", error);

			let errorMessage =
				t("passwordChangeError") || "Erro ao alterar senha. Tente novamente.";

			if (error instanceof Error) {
				if (error.message.includes("auth/wrong-password")) {
					errorMessage = t("wrongCurrentPassword") || "Senha atual incorreta.";
				} else if (error.message.includes("auth/weak-password")) {
					errorMessage = t("weakPassword") || "Nova senha muito fraca.";
				} else if (error.message.includes("auth/requires-recent-login")) {
					errorMessage =
						t("requiresRecentLogin") ||
						"Por segurança, faça login novamente antes de alterar a senha.";
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
						{t("changePassword") || "Alterar Senha"}
					</Text>
					<Text style={[styles.subtitle, { color: colors.textSecondary }]}>
						{t("enterNewPasswordToChange") ||
							"Digite sua nova senha para alterar"}
					</Text>
				</View>

				<View style={styles.form}>
					{/* Campo Senha Atual - só mostra se o usuário tem provedor de email */}
					{user?.providerData.some(
						(provider) => provider.providerId === "password",
					) && (
						<View style={styles.inputContainer}>
							<Text style={[styles.inputLabel, { color: colors.text }]}>
								{t("currentPassword") || "Senha atual"}
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
									t("enterCurrentPassword") || "Digite sua senha atual"
								}
								placeholderTextColor={colors.textSecondary}
								secureTextEntry
								value={senhaAtual}
								onChangeText={setSenhaAtual}
								editable={!loading}
							/>
						</View>
					)}

					{/* Campo Nova Senha */}
					<View style={styles.inputContainer}>
						<Text style={[styles.inputLabel, { color: colors.text }]}>
							{t("newPassword") || "Nova senha"}
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
								t("enterNewPassword") ||
								"Digite sua nova senha (min. 6 caracteres)"
							}
							placeholderTextColor={colors.textSecondary}
							secureTextEntry
							value={novaSenha}
							onChangeText={setNovaSenha}
							editable={!loading}
						/>
					</View>

					{/* Campo Confirmar Nova Senha */}
					<View style={styles.inputContainer}>
						<Text style={[styles.inputLabel, { color: colors.text }]}>
							{t("confirmNewPassword") || "Confirmar nova senha"}
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
							placeholder={t("confirmNewPassword") || "Confirme sua nova senha"}
							placeholderTextColor={colors.textSecondary}
							secureTextEntry
							value={confirmarSenha}
							onChangeText={setConfirmarSenha}
							editable={!loading}
						/>
					</View>

					{/* Botão Alterar Senha */}
					<TouchableOpacity
						style={[styles.botao, { backgroundColor: colors.primary }]}
						onPress={handleAlterarSenha}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.textoBotao}>
								{t("changePassword") || "Alterar Senha"}
							</Text>
						)}
					</TouchableOpacity>
				</View>

				{/* Botão Voltar */}
				<View style={styles.footer}>
					<TouchableOpacity onPress={() => router.back()}>
						<Text style={[styles.backText, { color: colors.primary }]}>
							← {t("back") || "Voltar"}
						</Text>
					</TouchableOpacity>
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
	infoContainer: {
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		padding: 16,
		borderRadius: 12,
		marginTop: 20,
	},
	infoText: {
		fontSize: 14,
		lineHeight: 20,
	},
	footer: {
		alignItems: "center",
		marginTop: 20,
	},
	backText: {
		fontSize: 16,
		fontWeight: "600",
	},
});
