import { SafeAreaView } from "react-native-safe-area-context";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	RefreshControl,
	ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { deleteUser } from "firebase/auth";
import { useQuery } from "@tanstack/react-query";
import { auth } from "../src/services/firebaseConfig";
import { useAuth } from "../src/context/AuthContext";
import { useTask } from "../src/context/TaskContext";
import ThemeToggleButton from "../src/components/ThemeToggleButton";
import { useTheme } from "../src/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { TaskItem } from "../src/components/TaskItem";
import type { Task } from "../src/types/task";

// Interface para a API de citações
interface Quote {
	text: string;
	author: string;
}

// Função para buscar citação motivacional
const fetchMotivationalQuote = async (): Promise<Quote> => {
	try {
		const response = await fetch("https://api.api-ninjas.com/v1/quotes", {
			headers: { "X-Api-Key": "v0FL8QxnLZdWoRYpnaodnA==mSkr1lSnvKaN4Vy3" },
		});
		if (!response.ok) {
			throw new Error("Erro ao buscar citação");
		}
		const data = await response.json();

		return {
			text: data[0].quote,
			author: data[0].author,
		};
	} catch (error) {
		console.error("Erro ao buscar citação:", error);
		// Fallback caso a API falhe
		return {
			text: "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
			author: "Robert Collier",
		};
	}
};

export default function HomeScreen() {
	const { t } = useTranslation();
	const { colors } = useTheme();
	const { user, signOut } = useAuth();
	const { tasks, loading, refreshTasks } = useTask();
	const router = useRouter();
	const [refreshing, setRefreshing] = useState(false);

	// Query para buscar frase motivacional
	const {
		data: quote,
		isLoading: quoteLoading,
		refetch: refetchQuote,
	} = useQuery({
		queryKey: ["motivationalQuote"],
		queryFn: fetchMotivationalQuote,
	});

	// Filtrar tarefas por status
	const pendingTasks = tasks.filter((task) => !task.completed);
	const completedTasks = tasks.filter((task) => task.completed);
	const overdueTasks = pendingTasks.filter((task) => {
		if (!task.dueDate) return false;
		return new Date() > task.dueDate;
	});
	const dueSoonTasks = pendingTasks.filter((task) => {
		if (!task.dueDate || overdueTasks.includes(task)) return false;
		const now = new Date();
		const hoursDiff =
			(task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
		return hoursDiff > 0 && hoursDiff <= 24;
	});

	// Tarefas recentes (últimas 3 adicionadas)
	const recentTasks = tasks
		.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
		.slice(0, 3);

	const onRefresh = async () => {
		setRefreshing(true);
		try {
			await refreshTasks();
			// Também atualiza a citação no refresh
			await refetchQuote();
		} finally {
			setRefreshing(false);
		}
	};

	const realizarLogoff = async () => {
		Alert.alert(t("logoutTitle"), t("logoutMessage"), [
			{ text: t("cancel"), style: "cancel" },
			{
				text: t("logout"),
				style: "destructive",
				onPress: async () => {
					try {
						await signOut();
						router.replace("/");
					} catch (error) {
						console.error("Erro ao fazer logout:", error);
						Alert.alert(t("error"), t("loginError"));
					}
				},
			},
		]);
	};

	const excluirConta = () => {
		Alert.alert(t("deleteAccountTitle"), t("deleteAccountMessage"), [
			{ text: t("cancel"), style: "cancel" },
			{
				text: t("delete"),
				style: "destructive",
				onPress: async () => {
					try {
						const currentUser = auth.currentUser;
						if (currentUser) {
							await deleteUser(currentUser);
							Alert.alert(t("accountDeleted"), t("accountDeletedMessage"));
							router.replace("/");
						}
					} catch (error) {
						console.error("Erro ao excluir conta:", error);
						Alert.alert(t("error"), "Não foi possível excluir a conta");
					}
				},
			},
		]);
	};

	const handleEditTask = (_task: Task) => {
		// Navegar para TaskScreen com task específica para edição
		router.push("/TaskScreen");
	};

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			<ScrollView
				style={styles.scrollView}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View style={[styles.header, { backgroundColor: colors.background }]}>
					<View style={styles.headerTop}>
						<View>
							<Text style={[styles.welcomeText, { color: colors.text }]}>
								{t("welcome")}! 👋
							</Text>
							<Text style={[styles.userEmail, { color: colors.text }]}>
								{user?.email}
							</Text>
						</View>
						<ThemeToggleButton />
					</View>
				</View>

				{/* Seção da Frase Motivacional */}
				<View style={styles.quoteSection}>
					{quoteLoading ? (
						<View
							style={[
								styles.quoteContainer,
								{
									backgroundColor: colors.inputBackground,
									borderColor: colors.border,
								},
							]}
						>
							<View style={styles.quoteLoading}>
								<ActivityIndicator size="small" color={colors.primary} />
								<Text
									style={[
										styles.quoteLoadingText,
										{ color: colors.textSecondary },
									]}
								>
									{t("inspirationLoading")}
								</Text>
							</View>
						</View>
					) : quote ? (
						<TouchableOpacity
							style={[
								styles.quoteContainer,
								{
									backgroundColor: colors.inputBackground,
									borderColor: colors.border,
								},
							]}
							onPress={() => refetchQuote()}
							activeOpacity={0.7}
						>
							<Text style={[styles.quoteText, { color: colors.text }]}>
								"{quote.text}"
							</Text>
							<Text style={[styles.quoteAuthor, { color: colors.primary }]}>
								— {quote.author}
							</Text>
							<View style={styles.quoteFooter}>
								<Text
									style={[styles.quoteHint, { color: colors.textSecondary }]}
								>
									💡 {t("inspirationRefresh")}
								</Text>
							</View>
						</TouchableOpacity>
					) : null}
				</View>

				{/* Statistics Cards */}
				<View style={styles.statsContainer}>
					<View
						style={[styles.statCard, { backgroundColor: colors.background }]}
					>
						<View style={[styles.statIcon, { backgroundColor: "#007AFF20" }]}>
							<Text style={styles.statIconText}>📋</Text>
						</View>
						<Text style={[styles.statNumber, { color: "#007AFF" }]}>
							{pendingTasks.length}
						</Text>
						<Text style={[styles.statLabel, { color: colors.text }]}>
							{t("pendingTasks")}
						</Text>
					</View>

					<View
						style={[styles.statCard, { backgroundColor: colors.background }]}
					>
						<View style={[styles.statIcon, { backgroundColor: "#FF324020" }]}>
							<Text style={styles.statIconText}>⏰</Text>
						</View>
						<Text style={[styles.statNumber, { color: "#FF3240" }]}>
							{overdueTasks.length}
						</Text>
						<Text style={[styles.statLabel, { color: colors.text }]}>
							{t("overdueTasks")}
						</Text>
					</View>

					<View
						style={[styles.statCard, { backgroundColor: colors.background }]}
					>
						<View style={[styles.statIcon, { backgroundColor: "#28A74520" }]}>
							<Text style={styles.statIconText}>✅</Text>
						</View>
						<Text style={[styles.statNumber, { color: "#28A745" }]}>
							{completedTasks.length}
						</Text>
						<Text style={[styles.statLabel, { color: colors.text }]}>
							{t("completedTasks")}
						</Text>
					</View>
				</View>

				{/* Quick Actions */}
				<View style={styles.section}>
					<Text style={[styles.sectionTitle, { color: colors.text }]}>
						{t("quickActions")}
					</Text>
					<View style={styles.quickActionsContainer}>
						<TouchableOpacity
							style={[styles.quickActionCard, { backgroundColor: "#007AFF" }]}
							onPress={() => router.push("/TaskScreen")}
						>
							<Text style={styles.quickActionIcon}>➕</Text>
							<Text style={styles.quickActionText}>{t("addTask")}</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.quickActionCard, { backgroundColor: "#28A745" }]}
							onPress={() => router.push("/TaskScreen")}
						>
							<Text style={styles.quickActionIcon}>📋</Text>
							<Text style={styles.quickActionText}>{t("myTasks")}</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Recent Tasks */}
				{recentTasks.length > 0 && (
					<View style={styles.section}>
						<View style={styles.sectionHeader}>
							<Text style={[styles.sectionTitle, { color: colors.text }]}>
								{t("recentTasks")}
							</Text>
							<TouchableOpacity onPress={() => router.push("/TaskScreen")}>
								<Text style={[styles.seeAllText, { color: "#007AFF" }]}>
									Ver todas
								</Text>
							</TouchableOpacity>
						</View>
						<View style={styles.recentTasksContainer}>
							{recentTasks.map((task) => (
								<TaskItem key={task.id} task={task} onEdit={handleEditTask} />
							))}
						</View>
					</View>
				)}

				{/* Due Soon Tasks */}
				{dueSoonTasks.length > 0 && (
					<View style={styles.section}>
						<Text style={[styles.sectionTitle, { color: colors.text }]}>
							{t("taskDueSoon")} ⚠️
						</Text>
						<View style={styles.dueSoonContainer}>
							{dueSoonTasks.map((task) => (
								<TaskItem key={task.id} task={task} onEdit={handleEditTask} />
							))}
						</View>
					</View>
				)}

				{/* Settings Section */}
				<View style={styles.section}>
					<Text style={[styles.sectionTitle, { color: colors.text }]}>
						{t("settings")}
					</Text>
					<View style={styles.settingsContainer}>
						<TouchableOpacity
							style={[
								styles.settingItem,
								{ backgroundColor: colors.background },
							]}
							onPress={() => router.push("/AlterarSenhaScreen")}
						>
							<View style={styles.settingIconContainer}>
								<Text style={styles.settingIcon}>🔑</Text>
							</View>
							<Text style={[styles.settingText, { color: colors.text }]}>
								{t("changePassword")}
							</Text>
							<Text style={styles.settingArrow}>›</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.settingItem,
								{ backgroundColor: colors.background },
							]}
							onPress={realizarLogoff}
						>
							<View style={styles.settingIconContainer}>
								<Text style={styles.settingIcon}>🚪</Text>
							</View>
							<Text style={[styles.settingText, { color: colors.text }]}>
								{t("logout")}
							</Text>
							<Text style={styles.settingArrow}>›</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.settingItem,
								{ backgroundColor: colors.background },
							]}
							onPress={excluirConta}
						>
							<View style={styles.settingIconContainer}>
								<Text style={styles.settingIcon}>⚠️</Text>
							</View>
							<Text style={[styles.settingText, { color: "#FF3240" }]}>
								{t("deleteAccount")}
							</Text>
							<Text style={styles.settingArrow}>›</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Empty State */}
				{tasks.length === 0 && !loading && (
					<View style={styles.emptyState}>
						<Text style={styles.emptyIcon}>📝</Text>
						<Text style={[styles.emptyTitle, { color: colors.text }]}>
							{t("noTasksYet")}
						</Text>
						<Text style={[styles.emptySubtitle, { color: colors.text }]}>
							{t("tapToAddTask")}
						</Text>
						<TouchableOpacity
							style={styles.emptyButton}
							onPress={() => router.push("/TaskScreen")}
						>
							<Text style={styles.emptyButtonText}>{t("addTask")}</Text>
						</TouchableOpacity>
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	header: {
		paddingHorizontal: 20,
		paddingTop: 10,
		paddingBottom: 20,
	},
	headerTop: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	welcomeText: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 4,
	},
	userEmail: {
		fontSize: 14,
		opacity: 0.7,
	},
	// Estilos para a seção de citação
	quoteSection: {
		paddingHorizontal: 20,
		marginBottom: 20,
	},
	quoteContainer: {
		padding: 20,
		borderRadius: 16,
		borderWidth: 1,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 6,
		marginBottom: 4,
	},
	quoteText: {
		fontSize: 16,
		fontStyle: "italic",
		textAlign: "center",
		lineHeight: 24,
		marginBottom: 12,
		fontWeight: "500",
	},
	quoteAuthor: {
		fontSize: 14,
		fontWeight: "600",
		textAlign: "center",
		marginBottom: 12,
	},
	quoteFooter: {
		alignItems: "center",
	},
	quoteHint: {
		fontSize: 12,
		opacity: 0.8,
	},
	quoteLoading: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 16,
	},
	quoteLoadingText: {
		marginLeft: 8,
		fontSize: 14,
	},
	statsContainer: {
		flexDirection: "row",
		paddingHorizontal: 20,
		marginBottom: 24,
		gap: 12,
	},
	statCard: {
		flex: 1,
		backgroundColor: "#F8F9FA",
		borderRadius: 16,
		padding: 16,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	statIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 8,
	},
	statIconText: {
		fontSize: 18,
	},
	statNumber: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 12,
		textAlign: "center",
		fontWeight: "500",
	},
	section: {
		paddingHorizontal: 20,
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 16,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	seeAllText: {
		fontSize: 14,
		fontWeight: "600",
	},
	quickActionsContainer: {
		flexDirection: "row",
		gap: 12,
	},
	quickActionCard: {
		flex: 1,
		borderRadius: 16,
		padding: 20,
		alignItems: "center",
		justifyContent: "center",
		minHeight: 80,
	},
	quickActionIcon: {
		fontSize: 24,
		marginBottom: 8,
	},
	quickActionText: {
		color: "white",
		fontSize: 14,
		fontWeight: "600",
	},
	recentTasksContainer: {
		gap: 8,
	},
	dueSoonContainer: {
		gap: 8,
	},
	settingsContainer: {
		backgroundColor: "#F8F9FA",
		borderRadius: 16,
		overflow: "hidden",
	},
	settingItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 16,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#E9ECEF",
	},
	settingIconContainer: {
		width: 32,
		height: 32,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	settingIcon: {
		fontSize: 18,
	},
	settingText: {
		flex: 1,
		fontSize: 16,
		fontWeight: "500",
	},
	settingArrow: {
		fontSize: 18,
		color: "#6C757D",
	},
	emptyState: {
		alignItems: "center",
		paddingVertical: 60,
		paddingHorizontal: 40,
	},
	emptyIcon: {
		fontSize: 64,
		marginBottom: 16,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 8,
		textAlign: "center",
	},
	emptySubtitle: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 24,
		opacity: 0.7,
	},
	emptyButton: {
		backgroundColor: "#007AFF",
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 12,
	},
	emptyButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
});
