import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	Alert,
	Modal,
	TextInput,
	ScrollView,
	RefreshControl,
	Platform,
	ActivityIndicator,
} from "react-native";
import { useState, useCallback } from "react";
import DateTimePicker, {
	type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { TaskItem } from "../src/components/TaskItem";
import { useTask } from "../src/context/TaskContext";
import { useTheme } from "../src/context/ThemeContext";
import { useTranslation } from "react-i18next";
import type { Task, CreateTaskData, UpdateTaskData } from "../src/types/task";

export default function TaskScreen() {
	const { t } = useTranslation();
	const { colors, theme } = useTheme();
	const { tasks, loading, error, addTask, updateTask, refreshTasks } =
		useTask();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		dueDate: null as Date | null,
	});
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showTimePicker, setShowTimePicker] = useState(false);
	const [filterCompleted, setFilterCompleted] = useState(false);
	const [titleFocused, setTitleFocused] = useState(false);
	const [descriptionFocused, setDescriptionFocused] = useState(false);
	const [saving, setSaving] = useState(false);

	// Funções auxiliares para verificar datas
	const isToday = (date: Date): boolean => {
		const today = new Date();
		return date.toDateString() === today.toDateString();
	};

	const isTomorrow = (date: Date): boolean => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return date.toDateString() === tomorrow.toDateString();
	};

	const isNextWeek = (date: Date): boolean => {
		const nextWeek = new Date();
		nextWeek.setDate(nextWeek.getDate() + 7);
		const diffDays =
			Math.abs(date.getTime() - nextWeek.getTime()) / (1000 * 60 * 60 * 24);
		return diffDays < 1;
	};

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.background,
		},
		header: {
			backgroundColor: colors.background,
			padding: 20,
			paddingTop: 40,
			borderBottomWidth: 1,
			borderBottomColor: colors.border,
		},
		headerTitle: {
			fontSize: 24,
			fontWeight: "bold",
			color: colors.text,
			marginBottom: 8,
		},
		stats: {
			flexDirection: "row",
			justifyContent: "space-around",
			marginTop: 10,
		},
		stat: {
			alignItems: "center",
		},
		statNumber: {
			fontSize: 20,
			fontWeight: "bold",
			color: colors.primary,
		},
		statLabel: {
			fontSize: 12,
			color: colors.textSecondary,
			marginTop: 2,
		},
		filters: {
			flexDirection: "row",
			padding: 15,
			backgroundColor: colors.background,
			borderBottomWidth: 1,
			borderBottomColor: colors.border,
		},
		content: {
			flex: 1,
			padding: 15,
		},
		taskCard: {
			backgroundColor: colors.background,
			borderRadius: 12,
			padding: 15,
			marginBottom: 10,
			shadowColor: "#000",
			shadowOffset: {
				width: 0,
				height: 2,
			},
			shadowOpacity: 0.1,
			shadowRadius: 4,
			elevation: 3,
			borderWidth: 1,
			borderColor: colors.border,
		},
		taskTitle: {
			fontSize: 16,
			fontWeight: "600",
			color: colors.text,
			marginBottom: 8,
		},
		taskDescription: {
			fontSize: 14,
			color: colors.textSecondary,
			marginBottom: 10,
		},
		taskFooter: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
		},
		taskDate: {
			fontSize: 12,
			color: colors.textSecondary,
		},
		taskActions: {
			flexDirection: "row",
		},
		fab: {
			position: "absolute",
			bottom: 20,
			right: 20,
			width: 56,
			height: 56,
			borderRadius: 28,
			backgroundColor: colors.primary,
			justifyContent: "center",
			alignItems: "center",
			shadowColor: "#000",
			shadowOffset: {
				width: 0,
				height: 4,
			},
			shadowOpacity: 0.3,
			shadowRadius: 8,
			elevation: 8,
		},
		modalOverlay: {
			flex: 1,
			backgroundColor: "rgba(0, 0, 0, 0.5)",
			justifyContent: "flex-end",
		},
		modalContent: {
			backgroundColor: colors.background,
			borderTopLeftRadius: 20,
			borderTopRightRadius: 20,
			maxHeight: "90%",
			minHeight: "50%",
		},
		modalTitle: {
			fontSize: 20,
			fontWeight: "bold",
			color: colors.text,
			textAlign: "center",
		},
		input: {
			borderWidth: 1,
			borderColor: colors.border,
			borderRadius: 12,
			padding: 16,
			marginBottom: 16,
			fontSize: 16,
			backgroundColor: colors.inputBackground,
			color: colors.text,
		},
		inputFocused: {
			borderColor: colors.primary,
			borderWidth: 2,
		},
		textArea: {
			height: 100,
			textAlignVertical: "top",
		},
		dateTimeRow: {
			gap: 12,
			marginBottom: 16,
		},
		dateTimeButton: {
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: 16,
			paddingHorizontal: 16,
			borderWidth: 1,
			borderColor: colors.border,
			borderRadius: 12,
			backgroundColor: colors.inputBackground,
			minHeight: 56,
		},
		dateTimeButtonSelected: {
			borderColor: colors.primary,
			backgroundColor: colors.primary,
		},
		dateTimeButtonText: {
			fontSize: 16,
			color: colors.text,
			flex: 1,
		},
		dateTimeButtonIcon: {
			fontSize: 20,
			marginRight: 12,
		},
		shortcuts: {
			flexDirection: "row",
			gap: 8,
			marginBottom: 16,
		},
		shortcutButton: {
			paddingVertical: 8,
			paddingHorizontal: 16,
			borderRadius: 20,
			backgroundColor: colors.inputBackground,
			borderWidth: 1,
			borderColor: colors.border,
		},
		shortcutButtonActive: {
			backgroundColor: colors.primary,
			borderColor: colors.primary,
		},
		shortcutText: {
			fontSize: 14,
			fontWeight: "500",
			color: colors.text,
		},
		shortcutTextActive: {
			color: colors.buttonText,
		},
		pickerContainer: {
			position: "absolute",
			bottom: 0,
			left: 0,
			right: 0,
			backgroundColor: colors.background,
			borderTopLeftRadius: 20,
			borderTopRightRadius: 20,
			paddingBottom: Platform.OS === "ios" ? 34 : 20, // Safe area para iOS
			shadowColor: "#000",
			shadowOffset: {
				width: 0,
				height: -8,
			},
			shadowOpacity: theme === "light" ? 0.15 : 0.3,
			shadowRadius: 12,
			elevation: 16,
			borderTopWidth: 1,
			borderTopColor: colors.border,
		},
		pickerHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingHorizontal: 20,
			paddingVertical: 16,
			borderBottomWidth: 1,
			borderBottomColor: colors.border,
			backgroundColor: colors.background,
		},
		pickerCancel: {
			fontSize: 16,
			fontWeight: "600",
			color: "#FF3B30",
		},
		pickerTitle: {
			fontSize: 18,
			fontWeight: "600",
			color: colors.text,
		},
		pickerDone: {
			fontSize: 16,
			fontWeight: "600",
			color: colors.primary,
		},
		datePicker: {
			height: 220,
			backgroundColor: colors.background,
		},
		modalButtons: {
			flexDirection: "row",
			gap: 12,
			marginTop: 24,
		},
		button: {
			flex: 1,
			paddingVertical: 16,
			borderRadius: 12,
			alignItems: "center",
			justifyContent: "center",
			minHeight: 48,
		},
		cancelButton: {
			backgroundColor: colors.inputBackground,
			borderWidth: 1,
			borderColor: colors.border,
		},
		saveButton: {
			backgroundColor: colors.primary,
		},
		saveButtonDisabled: {
			backgroundColor: colors.border,
			opacity: 0.5,
		},
		buttonText: {
			fontSize: 16,
			fontWeight: "600",
		},
		cancelButtonText: {
			color: colors.text,
		},
		saveButtonText: {
			color: colors.buttonText,
		},
		emptyContainer: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			paddingVertical: 40,
		},
		emptyText: {
			fontSize: 18,
			color: colors.text,
			textAlign: "center",
			marginTop: 10,
		},
		emptySubtext: {
			fontSize: 14,
			color: colors.textSecondary,
			textAlign: "center",
			marginTop: 5,
		},
		priorityHigh: {
			borderLeftWidth: 4,
			borderLeftColor: "#FF3B30",
		},
		priorityMedium: {
			borderLeftWidth: 4,
			borderLeftColor: "#FF9500",
		},
		priorityLow: {
			borderLeftWidth: 4,
			borderLeftColor: "#34C759",
		},
		completedTask: {
			opacity: 0.6,
		},
		completedTitle: {
			textDecorationLine: "line-through",
		},
		statsContainer: {
			flexDirection: "row",
			justifyContent: "space-around",
		},
		overdueNumber: {
			color: "#dc3545",
		},
		completedNumber: {
			color: "#28a745",
		},
		filterContainer: {
			flexDirection: "row",
			backgroundColor: colors.background,
			marginHorizontal: 16,
			marginTop: 8,
			marginBottom: 8,
			borderRadius: 12,
			padding: 4,
			borderWidth: 1,
			borderColor: colors.border,
		},
		filterButton: {
			flex: 1,
			paddingVertical: 12,
			paddingHorizontal: 16,
			borderRadius: 8,
			alignItems: "center",
		},
		filterButtonActive: {
			backgroundColor: colors.primary,
		},
		filterText: {
			fontSize: 14,
			fontWeight: "600",
			color: colors.text,
		},
		filterTextActive: {
			color: colors.buttonText,
		},
		list: {
			flex: 1,
			marginTop: 16,
		},
		fabText: {
			fontSize: 24,
			color: colors.buttonText,
			fontWeight: "bold",
		},
		modalContainer: {
			flex: 1,
			backgroundColor: colors.background,
		},
		modalHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingHorizontal: 20,
			paddingVertical: 16,
			borderBottomWidth: 1,
			borderBottomColor: colors.border,
			paddingTop: 50,
		},
		modalHeaderButton: {
			fontSize: 16,
			color: colors.primary,
		},
		inputContainer: {
			marginBottom: 24,
		},
		inputLabel: {
			fontSize: 16,
			fontWeight: "600",
			color: colors.text,
			marginBottom: 8,
		},
		removeButton: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			borderWidth: 1,
			borderColor: colors.border,
			borderRadius: 12,
			paddingVertical: 12,
			paddingHorizontal: 16,
			marginBottom: 16,
			backgroundColor: colors.inputBackground,
		},
		removeButtonText: {
			fontSize: 14,
			fontWeight: "500",
			color: colors.textSecondary,
			marginLeft: 8,
		},
		dateTimeIcon: {
			fontSize: 20,
			marginRight: 8,
		},
		dateTimeText: {
			fontSize: 16,
			fontWeight: "500",
			flex: 1,
		},
		dateShortcuts: {
			flexDirection: "row",
			gap: 8,
		},
		errorContainer: {
			position: "absolute",
			bottom: 90,
			left: 20,
			right: 20,
			backgroundColor: "#dc3545",
			padding: 12,
			borderRadius: 8,
		},
		errorText: {
			color: "#fff",
			fontSize: 14,
			textAlign: "center",
		},
	});

	// Resetar formulário
	const resetForm = useCallback(() => {
		setFormData({
			title: "",
			description: "",
			dueDate: null,
		});
		setEditingTask(null);
	}, []);

	// Abrir modal para nova tarefa
	const handleAddTask = () => {
		resetForm();
		setIsModalVisible(true);
	};

	// Abrir modal para editar tarefa
	const handleEditTask = (task: Task) => {
		setFormData({
			title: task.title,
			description: task.description,
			dueDate: task.dueDate,
		});
		setEditingTask(task);
		setIsModalVisible(true);
	};

	// Fechar modal
	const handleCloseModal = () => {
		setIsModalVisible(false);
		resetForm();
	};

	// Salvar tarefa (criar ou editar)
	const handleSaveTask = async () => {
		if (!formData.title.trim()) {
			Alert.alert("Erro", "O título da tarefa é obrigatório");
			return;
		}

		setSaving(true);
		try {
			if (editingTask) {
				// Editando tarefa existente
				const updateData: UpdateTaskData = {
					title: formData.title.trim(),
					description: formData.description.trim(),
					dueDate: formData.dueDate,
				};
				await updateTask(editingTask.id, updateData);
			} else {
				// Criando nova tarefa
				const createData: CreateTaskData = {
					title: formData.title.trim(),
					description: formData.description.trim(),
					dueDate: formData.dueDate,
				};
				await addTask(createData);
			}
			handleCloseModal();
		} catch {
			Alert.alert("Erro", "Não foi possível salvar a tarefa");
		} finally {
			setSaving(false);
		}
	};

	// Configurar data
	const handleDateChange = (
		_event: DateTimePickerEvent,
		selectedDate?: Date,
	) => {
		setShowDatePicker(false);
		if (selectedDate) {
			const newDate = formData.dueDate
				? new Date(formData.dueDate)
				: new Date();
			newDate.setFullYear(selectedDate.getFullYear());
			newDate.setMonth(selectedDate.getMonth());
			newDate.setDate(selectedDate.getDate());
			setFormData((prev) => ({ ...prev, dueDate: newDate }));

			// No iOS, mostrar seletor de hora após selecionar data
			if (Platform.OS === "ios") {
				setShowTimePicker(true);
			}
		}
	};

	// Configurar hora
	const handleTimeChange = (
		_event: DateTimePickerEvent,
		selectedTime?: Date,
	) => {
		setShowTimePicker(false);
		if (selectedTime && formData.dueDate) {
			const newDate = new Date(formData.dueDate);
			newDate.setHours(selectedTime.getHours());
			newDate.setMinutes(selectedTime.getMinutes());
			setFormData((prev) => ({ ...prev, dueDate: newDate }));
		}
	};

	// Remover data
	const handleRemoveDate = () => {
		setFormData((prev) => ({ ...prev, dueDate: null }));
	};

	// Filtrar tarefas
	const filteredTasks = tasks.filter((task) => {
		if (filterCompleted) {
			return task.completed;
		}
		return !task.completed;
	});

	// Agrupar tarefas por status
	const pendingTasks = tasks.filter((task) => !task.completed);
	const completedTasks = tasks.filter((task) => task.completed);
	const overdueTasks = pendingTasks.filter((task) => {
		if (!task.dueDate) return false;
		return new Date() > task.dueDate;
	});

	const renderTaskItem = ({ item }: { item: Task }) => (
		<TaskItem task={item} onEdit={handleEditTask} />
	);

	const renderEmpty = () => (
		<View style={styles.emptyContainer}>
			<Text style={[styles.emptyText, { color: colors.text }]}>
				{filterCompleted ? t("noCompletedTasks") : t("noPendingTasks")}
			</Text>
			<Text style={[styles.emptySubtext, { color: colors.text }]}>
				{!filterCompleted && t("tapToAddTask")}
			</Text>
		</View>
	);

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: colors.background }]}
		>
			{/* Header com estatísticas */}
			<View style={[styles.header, { backgroundColor: colors.background }]}>
				<Text style={[styles.headerTitle, { color: colors.text }]}>
					{t("myTasks")}
				</Text>
				<View style={styles.statsContainer}>
					<View style={styles.stat}>
						<Text style={[styles.statNumber, { color: colors.text }]}>
							{pendingTasks.length}
						</Text>
						<Text style={[styles.statLabel, { color: colors.text }]}>
							{t("pendingTasks")}
						</Text>
					</View>
					<View style={styles.stat}>
						<Text style={[styles.statNumber, styles.overdueNumber]}>
							{overdueTasks.length}
						</Text>
						<Text style={[styles.statLabel, { color: colors.text }]}>
							{t("overdueTasks")}
						</Text>
					</View>
					<View style={styles.stat}>
						<Text style={[styles.statNumber, styles.completedNumber]}>
							{completedTasks.length}
						</Text>
						<Text style={[styles.statLabel, { color: colors.text }]}>
							{t("completedTasks")}
						</Text>
					</View>
				</View>
			</View>

			{/* Filtros */}
			<View style={styles.filterContainer}>
				<TouchableOpacity
					style={[
						styles.filterButton,
						!filterCompleted && styles.filterButtonActive,
					]}
					onPress={() => setFilterCompleted(false)}
				>
					<Text
						style={[
							styles.filterText,
							!filterCompleted && styles.filterTextActive,
						]}
					>
						{t("pendingTasks")}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.filterButton,
						filterCompleted && styles.filterButtonActive,
					]}
					onPress={() => setFilterCompleted(true)}
				>
					<Text
						style={[
							styles.filterText,
							filterCompleted && styles.filterTextActive,
						]}
					>
						{t("completedTasks")}
					</Text>
				</TouchableOpacity>
			</View>

			{/* Lista de tarefas */}
			<FlatList
				data={filteredTasks}
				renderItem={renderTaskItem}
				keyExtractor={(item) => item.id}
				style={styles.list}
				ListEmptyComponent={renderEmpty}
				refreshControl={
					<RefreshControl refreshing={loading} onRefresh={refreshTasks} />
				}
			/>

			{/* Botão de adicionar */}
			<TouchableOpacity style={styles.fab} onPress={handleAddTask}>
				<Text style={styles.fabText}>+</Text>
			</TouchableOpacity>

			{/* Modal de criar/editar tarefa */}
			<Modal
				visible={isModalVisible}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={handleCloseModal}
			>
				<View style={styles.modalContainer}>
					{/* Header do Modal */}
					<View style={styles.modalHeader}>
						<TouchableOpacity onPress={handleCloseModal}>
							<Text style={styles.modalHeaderButton}>{t("cancel")}</Text>
						</TouchableOpacity>
						<Text style={styles.modalTitle}>
							{editingTask ? t("editTask") : t("newTask")}
						</Text>
						<TouchableOpacity
							onPress={handleSaveTask}
							disabled={!formData.title.trim() || saving}
							style={{ flexDirection: "row", alignItems: "center" }}
						>
							{saving && (
								<ActivityIndicator
									size="small"
									color={colors.primary}
									style={{ marginRight: 8 }}
								/>
							)}
							<Text
								style={[
									styles.modalHeaderButton,
									(!formData.title.trim() || saving) && { opacity: 0.5 },
								]}
							>
								{saving ? t("saving") || "Salvando..." : t("save")}
							</Text>
						</TouchableOpacity>
					</View>

					<ScrollView
						style={{ flex: 1 }}
						contentContainerStyle={{ padding: 20 }}
						keyboardShouldPersistTaps="handled"
					>
						{/* Campo Título */}
						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>{t("taskTitle")} *</Text>
							<TextInput
								style={[styles.input, titleFocused && styles.inputFocused]}
								value={formData.title}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, title: text }))
								}
								onFocus={() => setTitleFocused(true)}
								onBlur={() => setTitleFocused(false)}
								placeholder={t("taskTitlePlaceholder")}
								placeholderTextColor={colors.textSecondary}
								autoFocus
								returnKeyType="next"
							/>
						</View>

						{/* Campo Descrição */}
						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>{t("taskDescription")}</Text>
							<TextInput
								style={[
									styles.input,
									styles.textArea,
									descriptionFocused && styles.inputFocused,
								]}
								value={formData.description}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, description: text }))
								}
								onFocus={() => setDescriptionFocused(true)}
								onBlur={() => setDescriptionFocused(false)}
								placeholder={t("taskDescriptionPlaceholder")}
								placeholderTextColor={colors.textSecondary}
								multiline
								numberOfLines={4}
								returnKeyType="done"
							/>
						</View>

						{/* Seção de Data e Hora */}
						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>{t("dueDate")}</Text>

							{/* Atalhos rápidos */}
							<View style={styles.shortcuts}>
								<TouchableOpacity
									style={[
										styles.shortcutButton,
										formData.dueDate &&
											isToday(formData.dueDate) &&
											styles.shortcutButtonActive,
									]}
									onPress={() => {
										const today = new Date();
										today.setHours(23, 59, 0, 0);
										setFormData((prev) => ({ ...prev, dueDate: today }));
									}}
								>
									<Text
										style={[
											styles.shortcutText,
											formData.dueDate &&
												isToday(formData.dueDate) &&
												styles.shortcutTextActive,
										]}
									>
										{t("today")}
									</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={[
										styles.shortcutButton,
										formData.dueDate &&
											isTomorrow(formData.dueDate) &&
											styles.shortcutButtonActive,
									]}
									onPress={() => {
										const tomorrow = new Date();
										tomorrow.setDate(tomorrow.getDate() + 1);
										tomorrow.setHours(9, 0, 0, 0);
										setFormData((prev) => ({ ...prev, dueDate: tomorrow }));
									}}
								>
									<Text
										style={[
											styles.shortcutText,
											formData.dueDate &&
												isTomorrow(formData.dueDate) &&
												styles.shortcutTextActive,
										]}
									>
										{t("tomorrow")}
									</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={[
										styles.shortcutButton,
										formData.dueDate &&
											isNextWeek(formData.dueDate) &&
											styles.shortcutButtonActive,
									]}
									onPress={() => {
										const nextWeek = new Date();
										nextWeek.setDate(nextWeek.getDate() + 7);
										nextWeek.setHours(9, 0, 0, 0);
										setFormData((prev) => ({ ...prev, dueDate: nextWeek }));
									}}
								>
									<Text
										style={[
											styles.shortcutText,
											formData.dueDate &&
												isNextWeek(formData.dueDate) &&
												styles.shortcutTextActive,
										]}
									>
										{t("nextWeek")}
									</Text>
								</TouchableOpacity>
							</View>

							{/* Botões de Data e Hora */}
							<View style={styles.dateTimeRow}>
								<TouchableOpacity
									style={[
										styles.dateTimeButton,
										formData.dueDate && styles.dateTimeButtonSelected,
									]}
									onPress={() => setShowDatePicker(true)}
								>
									<Text style={styles.dateTimeButtonIcon}>📅</Text>
									<Text style={styles.dateTimeButtonText}>
										{formData.dueDate
											? formData.dueDate.toLocaleDateString("pt-BR")
											: t("selectDate")}
									</Text>
								</TouchableOpacity>
							</View>

							{formData.dueDate && (
								<>
									<View style={styles.dateTimeRow}>
										<TouchableOpacity
											style={[
												styles.dateTimeButton,
												styles.dateTimeButtonSelected,
											]}
											onPress={() => setShowTimePicker(true)}
										>
											<Text style={styles.dateTimeButtonIcon}>🕐</Text>
											<Text style={styles.dateTimeButtonText}>
												{formData.dueDate.toLocaleTimeString("pt-BR", {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</Text>
										</TouchableOpacity>
									</View>

									{/* Botão para remover data */}
									<TouchableOpacity
										style={styles.removeButton}
										onPress={handleRemoveDate}
									>
										<Text style={{ fontSize: 16 }}>✕</Text>
										<Text style={styles.removeButtonText}>
											{t("removeDate")}
										</Text>
									</TouchableOpacity>
								</>
							)}
						</View>
					</ScrollView>

					{/* Date Picker */}
					{showDatePicker && (
						<>
							{/* Backdrop */}
							<TouchableOpacity
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									backgroundColor: "rgba(0, 0, 0, 0.3)",
								}}
								activeOpacity={1}
								onPress={() => setShowDatePicker(false)}
							/>
							<View style={styles.pickerContainer}>
								<View style={styles.pickerHeader}>
									<TouchableOpacity onPress={() => setShowDatePicker(false)}>
										<Text style={styles.pickerCancel}>{t("cancel")}</Text>
									</TouchableOpacity>
									<Text style={styles.pickerTitle}>{t("selectDate")}</Text>
									<TouchableOpacity
										onPress={() => {
											setShowDatePicker(false);
											if (Platform.OS === "ios") {
												setShowTimePicker(true);
											}
										}}
									>
										<Text style={styles.pickerDone}>{t("done")}</Text>
									</TouchableOpacity>
								</View>
								<DateTimePicker
									value={formData.dueDate || new Date()}
									mode="date"
									display={Platform.OS === "ios" ? "spinner" : "default"}
									onChange={handleDateChange}
									minimumDate={new Date()}
									style={styles.datePicker}
									textColor={colors.text}
									accentColor={colors.primary}
									themeVariant={theme}
								/>
							</View>
						</>
					)}

					{/* Time Picker */}
					{showTimePicker && (
						<>
							{/* Backdrop */}
							<TouchableOpacity
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									backgroundColor: "rgba(0, 0, 0, 0.3)",
								}}
								activeOpacity={1}
								onPress={() => setShowTimePicker(false)}
							/>
							<View style={styles.pickerContainer}>
								<View style={styles.pickerHeader}>
									<TouchableOpacity onPress={() => setShowTimePicker(false)}>
										<Text style={styles.pickerCancel}>{t("cancel")}</Text>
									</TouchableOpacity>
									<Text style={styles.pickerTitle}>{t("selectTime")}</Text>
									<TouchableOpacity onPress={() => setShowTimePicker(false)}>
										<Text style={styles.pickerDone}>{t("done")}</Text>
									</TouchableOpacity>
								</View>
								<DateTimePicker
									value={formData.dueDate || new Date()}
									mode="time"
									display={Platform.OS === "ios" ? "spinner" : "default"}
									onChange={handleTimeChange}
									style={styles.datePicker}
									textColor={colors.text}
									accentColor={colors.primary}
									themeVariant={theme}
								/>
							</View>
						</>
					)}
				</View>
			</Modal>

			{/* Exibir erro se houver */}
			{error && (
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>{error}</Text>
				</View>
			)}
		</SafeAreaView>
	);
}
