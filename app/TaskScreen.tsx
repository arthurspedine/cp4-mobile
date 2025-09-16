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

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme === "dark" ? "#000000" : "#f5f5f5",
		},
		header: {
			backgroundColor: theme === "dark" ? "#1C1C1E" : "#fff",
			padding: 20,
			paddingTop: 40,
			borderBottomWidth: 1,
			borderBottomColor: theme === "dark" ? "#2C2C2E" : "#eee",
		},
		headerTitle: {
			fontSize: 24,
			fontWeight: "bold",
			color: theme === "dark" ? "#FFFFFF" : "#000",
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
			color: "#007AFF",
		},
		statLabel: {
			fontSize: 12,
			color: theme === "dark" ? "#8E8E93" : "#666",
			marginTop: 2,
		},
		filters: {
			flexDirection: "row",
			padding: 15,
			backgroundColor: theme === "dark" ? "#1C1C1E" : "#fff",
			borderBottomWidth: 1,
			borderBottomColor: theme === "dark" ? "#2C2C2E" : "#eee",
		},
		filterButton: {
			paddingHorizontal: 15,
			paddingVertical: 8,
			marginRight: 10,
			borderRadius: 20,
			backgroundColor: theme === "dark" ? "#2C2C2E" : "#f0f0f0",
		},
		filterButtonActive: {
			backgroundColor: "#007AFF",
		},
		filterText: {
			fontSize: 14,
			color: theme === "dark" ? "#FFFFFF" : "#333",
		},
		filterTextActive: {
			color: "#fff",
		},
		content: {
			flex: 1,
			padding: 15,
		},
		taskCard: {
			backgroundColor: theme === "dark" ? "#1C1C1E" : "#fff",
			borderRadius: 12,
			padding: 15,
			marginBottom: 10,
			shadowColor: "#000",
			shadowOffset: {
				width: 0,
				height: 2,
			},
			shadowOpacity: theme === "dark" ? 0.3 : 0.1,
			shadowRadius: 4,
			elevation: 3,
		},
		taskTitle: {
			fontSize: 16,
			fontWeight: "600",
			color: theme === "dark" ? "#FFFFFF" : "#000",
			marginBottom: 8,
		},
		taskDescription: {
			fontSize: 14,
			color: theme === "dark" ? "#8E8E93" : "#666",
			marginBottom: 10,
		},
		taskFooter: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
		},
		taskDate: {
			fontSize: 12,
			color: theme === "dark" ? "#8E8E93" : "#999",
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
			backgroundColor: "#007AFF",
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
			justifyContent: "center",
			alignItems: "center",
		},
		modalContent: {
			backgroundColor: theme === "dark" ? "#1C1C1E" : "#fff",
			borderRadius: 20,
			margin: 20,
			padding: 20,
			width: "90%",
			maxHeight: "80%",
		},
		modalTitle: {
			fontSize: 20,
			fontWeight: "bold",
			color: theme === "dark" ? "#FFFFFF" : "#000",
			textAlign: "center",
			marginBottom: 20,
		},
		input: {
			borderWidth: 1,
			borderColor: theme === "dark" ? "#3A3A3C" : "#ddd",
			borderRadius: 10,
			padding: 12,
			marginBottom: 15,
			fontSize: 16,
			backgroundColor: theme === "dark" ? "#2C2C2E" : "#fff",
			color: theme === "dark" ? "#FFFFFF" : "#000",
		},
		textArea: {
			height: 80,
			textAlignVertical: "top",
		},
		dateTimeRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			marginBottom: 15,
		},
		dateTimeButton: {
			flex: 0.48,
			paddingVertical: 12,
			paddingHorizontal: 8,
			borderWidth: 1,
			borderColor: theme === "dark" ? "#3A3A3C" : "#ddd",
			borderRadius: 10,
			backgroundColor: theme === "dark" ? "#2C2C2E" : "#fff",
			alignItems: "center",
		},
		dateTimeButtonText: {
			fontSize: 14,
			color: theme === "dark" ? "#FFFFFF" : "#000",
		},
		shortcuts: {
			flexDirection: "row",
			justifyContent: "space-around",
			marginBottom: 15,
		},
		shortcutButton: {
			paddingVertical: 8,
			paddingHorizontal: 12,
			borderRadius: 15,
			backgroundColor: theme === "dark" ? "#2C2C2E" : "#f0f0f0",
		},
		shortcutText: {
			fontSize: 14,
			fontWeight: "500",
			color: theme === "dark" ? "#FFFFFF" : "#333",
		},
		pickerContainer: {
			position: "absolute",
			bottom: 0,
			left: 0,
			right: 0,
			backgroundColor: theme === "dark" ? "#2C2C2E" : "#fff",
			borderTopLeftRadius: 20,
			borderTopRightRadius: 20,
			paddingBottom: 20,
			shadowColor: "#000",
			shadowOffset: {
				width: 0,
				height: -4,
			},
			shadowOpacity: theme === "dark" ? 0.3 : 0.1,
			shadowRadius: 8,
			elevation: 10,
		},
		pickerHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingHorizontal: 20,
			paddingVertical: 16,
			borderBottomWidth: 1,
			borderBottomColor: theme === "dark" ? "#3A3A3C" : "#E5E5EA",
		},
		pickerCancel: {
			fontSize: 16,
			fontWeight: "500",
			color: theme === "dark" ? "#FF453A" : "#FF3B30",
		},
		pickerTitle: {
			fontSize: 18,
			fontWeight: "600",
			color: theme === "dark" ? "#FFFFFF" : "#000000",
		},
		pickerDone: {
			fontSize: 16,
			fontWeight: "600",
			color: "#007AFF",
		},
		datePicker: {
			height: 200,
		},
		modalButtons: {
			flexDirection: "row",
			justifyContent: "space-between",
			marginTop: 20,
		},
		button: {
			flex: 0.48,
			paddingVertical: 12,
			borderRadius: 10,
			alignItems: "center",
		},
		cancelButton: {
			backgroundColor: theme === "dark" ? "#2C2C2E" : "#f0f0f0",
		},
		saveButton: {
			backgroundColor: "#007AFF",
		},
		buttonText: {
			fontSize: 16,
			fontWeight: "600",
		},
		cancelButtonText: {
			color: theme === "dark" ? "#FFFFFF" : "#333",
		},
		saveButtonText: {
			color: "#fff",
		},
		emptyContainer: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			paddingVertical: 40,
		},
		emptyText: {
			fontSize: 18,
			color: theme === "dark" ? "#8E8E93" : "#666",
			textAlign: "center",
			marginTop: 10,
		},
		emptySubtext: {
			fontSize: 14,
			color: theme === "dark" ? "#8E8E93" : "#999",
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
			backgroundColor: theme === "dark" ? "#1C1C1E" : "#fff",
			marginHorizontal: 16,
			marginTop: 16,
			borderRadius: 8,
			overflow: "hidden",
		},
		filterButtonText: {
			fontSize: 14,
			fontWeight: "600",
			color: theme === "dark" ? "#FFFFFF" : "#666",
		},
		filterButtonTextActive: {
			color: "#fff",
		},
		list: {
			flex: 1,
			marginTop: 16,
		},
		fabText: {
			fontSize: 24,
			color: "#fff",
			fontWeight: "bold",
		},
		modalContainer: {
			flex: 1,
			backgroundColor: theme === "dark" ? "#1C1C1E" : "#fff",
		},
		modalHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingHorizontal: 20,
			paddingVertical: 16,
			borderBottomWidth: 1,
			borderBottomColor: theme === "dark" ? "#2C2C2E" : "#eee",
			paddingTop: 50,
		},
		modalHeaderButton: {
			fontSize: 16,
			color: "#007AFF",
		},
		inputContainer: {
			marginBottom: 20,
		},
		inputLabel: {
			fontSize: 16,
			fontWeight: "600",
			color: theme === "dark" ? "#FFFFFF" : "#333",
			marginBottom: 8,
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
		removeButton: {
			borderWidth: 1,
			borderColor: theme === "dark" ? "#3A3A3C" : "#ddd",
			borderRadius: 8,
			paddingVertical: 8,
			paddingHorizontal: 12,
			alignItems: "center",
			marginBottom: 12,
		},
		removeButtonText: {
			fontSize: 14,
			fontWeight: "500",
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
						{ borderColor: colors.text },
						!filterCompleted && styles.filterButtonActive,
					]}
					onPress={() => setFilterCompleted(false)}
				>
					<Text
						style={[
							styles.filterButtonText,
							{ color: colors.text },
							!filterCompleted && styles.filterButtonTextActive,
						]}
					>
						{t("pendingTasks")}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.filterButton,
						{ borderColor: colors.text },
						filterCompleted && styles.filterButtonActive,
					]}
					onPress={() => setFilterCompleted(true)}
				>
					<Text
						style={[
							styles.filterButtonText,
							{ color: colors.text },
							filterCompleted && styles.filterButtonTextActive,
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
				<View
					style={[
						styles.modalContainer,
						{ backgroundColor: colors.background },
					]}
				>
					<View
						style={[
							styles.modalHeader,
							{
								backgroundColor: colors.background,
								borderBottomColor: colors.text,
							},
						]}
					>
						<TouchableOpacity onPress={handleCloseModal}>
							<Text style={[styles.modalHeaderButton, { color: colors.text }]}>
								{t("cancel")}
							</Text>
						</TouchableOpacity>
						<Text style={[styles.modalTitle, { color: colors.text }]}>
							{editingTask ? t("editTask") : t("newTask")}
						</Text>
						<TouchableOpacity onPress={handleSaveTask}>
							<Text style={[styles.modalHeaderButton, styles.saveButton]}>
								{t("save")}
							</Text>
						</TouchableOpacity>
					</View>

					<ScrollView style={styles.modalContent}>
						{/* Título */}
						<View style={styles.inputContainer}>
							<Text style={[styles.inputLabel, { color: colors.text }]}>
								{t("taskTitle")} *
							</Text>
							<TextInput
								style={[
									styles.input,
									{
										backgroundColor: colors.background,
										borderColor: colors.text,
										color: colors.text,
									},
								]}
								value={formData.title}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, title: text }))
								}
								placeholder={t("taskTitlePlaceholder")}
								placeholderTextColor={colors.text}
								autoFocus
							/>
						</View>

						{/* Descrição */}
						<View style={styles.inputContainer}>
							<Text style={[styles.inputLabel, { color: colors.text }]}>
								{t("taskDescription")}
							</Text>
							<TextInput
								style={[
									styles.input,
									styles.textArea,
									{
										backgroundColor: colors.background,
										borderColor: colors.text,
										color: colors.text,
									},
								]}
								value={formData.description}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, description: text }))
								}
								placeholder={t("taskDescriptionPlaceholder")}
								placeholderTextColor={colors.text}
								multiline
								numberOfLines={3}
							/>
						</View>

						{/* Data e hora */}
						<View style={styles.inputContainer}>
							<Text style={[styles.inputLabel, { color: colors.text }]}>
								{t("dueDate")}
							</Text>

							{/* Botões de Data e Hora lado a lado */}
							<View style={styles.dateTimeRow}>
								<TouchableOpacity
									style={[
										styles.dateTimeButton,
										{
											backgroundColor: colors.background,
											borderColor: colors.text + "30",
										},
									]}
									onPress={() => setShowDatePicker(true)}
								>
									<Text style={styles.dateTimeIcon}>📅</Text>
									<Text style={[styles.dateTimeText, { color: colors.text }]}>
										{formData.dueDate
											? formData.dueDate.toLocaleDateString("pt-BR")
											: t("selectDate")}
									</Text>
								</TouchableOpacity>

								{formData.dueDate && (
									<TouchableOpacity
										style={[
											styles.dateTimeButton,
											{
												backgroundColor: colors.background,
												borderColor: colors.text + "30",
											},
										]}
										onPress={() => setShowTimePicker(true)}
									>
										<Text style={styles.dateTimeIcon}>🕐</Text>
										<Text style={[styles.dateTimeText, { color: colors.text }]}>
											{formData.dueDate.toLocaleTimeString("pt-BR", {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</Text>
									</TouchableOpacity>
								)}
							</View>

							{/* Botão para remover data */}
							{formData.dueDate && (
								<TouchableOpacity
									style={[
										styles.removeButton,
										{ borderColor: colors.text + "20" },
									]}
									onPress={handleRemoveDate}
								>
									<Text
										style={[
											styles.removeButtonText,
											{ color: colors.text + "70" },
										]}
									>
										✕ {t("removeDate")}
									</Text>
								</TouchableOpacity>
							)}

							{/* Atalhos de data */}
							<View style={styles.dateShortcuts}>
								<TouchableOpacity
									style={[
										styles.shortcutButton,
										{ borderColor: colors.text + "20" },
									]}
									onPress={() => {
										const tomorrow = new Date();
										tomorrow.setDate(tomorrow.getDate() + 1);
										tomorrow.setHours(9, 0, 0, 0);
										setFormData((prev) => ({ ...prev, dueDate: tomorrow }));
									}}
								>
									<Text style={[styles.shortcutText, { color: colors.text }]}>
										{t("tomorrow")}
									</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={[
										styles.shortcutButton,
										{ borderColor: colors.text + "20" },
									]}
									onPress={() => {
										const nextWeek = new Date();
										nextWeek.setDate(nextWeek.getDate() + 7);
										nextWeek.setHours(9, 0, 0, 0);
										setFormData((prev) => ({ ...prev, dueDate: nextWeek }));
									}}
								>
									<Text style={[styles.shortcutText, { color: colors.text }]}>
										{t("nextWeek")}
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</ScrollView>

					{/* Date Picker dentro do modal */}
					{showDatePicker && (
						<View
							style={[
								styles.pickerContainer,
								{ backgroundColor: colors.background },
							]}
						>
							<View
								style={[
									styles.pickerHeader,
									{ borderBottomColor: colors.text + "20" },
								]}
							>
								<TouchableOpacity onPress={() => setShowDatePicker(false)}>
									<Text style={[styles.pickerCancel, { color: colors.text }]}>
										{t("cancel")}
									</Text>
								</TouchableOpacity>
								<Text style={[styles.pickerTitle, { color: colors.text }]}>
									{t("selectDate")}
								</Text>
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
							/>
						</View>
					)}

					{/* Time Picker dentro do modal */}
					{showTimePicker && (
						<View
							style={[
								styles.pickerContainer,
								{ backgroundColor: colors.background },
							]}
						>
							<View
								style={[
									styles.pickerHeader,
									{ borderBottomColor: colors.text + "20" },
								]}
							>
								<TouchableOpacity onPress={() => setShowTimePicker(false)}>
									<Text style={[styles.pickerCancel, { color: colors.text }]}>
										{t("cancel")}
									</Text>
								</TouchableOpacity>
								<Text style={[styles.pickerTitle, { color: colors.text }]}>
									{t("selectTime")}
								</Text>
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
							/>
						</View>
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
