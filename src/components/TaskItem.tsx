import type React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import type { Task } from "../types/task";
import { useTask } from "../context/TaskContext";

interface TaskItemProps {
	task: Task;
	onEdit?: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit }) => {
	const { toggleTaskComplete, deleteTask } = useTask();

	const handleToggleComplete = async () => {
		try {
			await toggleTaskComplete(task.id);
		} catch {
			Alert.alert("Erro", "Não foi possível atualizar a tarefa");
		}
	};

	const handleDelete = () => {
		Alert.alert(
			"Confirmar Exclusão",
			`Tem certeza que deseja excluir a tarefa "${task.title}"?`,
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Excluir",
					style: "destructive",
					onPress: async () => {
						try {
							await deleteTask(task.id);
						} catch {
							Alert.alert("Erro", "Não foi possível excluir a tarefa");
						}
					},
				},
			],
		);
	};

	const handleEdit = () => {
		if (onEdit) {
			onEdit(task);
		}
	};

	const formatDate = (date: Date | null): string => {
		if (!date) return "";
		return date.toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const isOverdue = (): boolean => {
		if (!task.dueDate || task.completed) return false;
		return new Date() > task.dueDate;
	};

	const isDueSoon = (): boolean => {
		if (!task.dueDate || task.completed) return false;
		const now = new Date();
		const hoursDiff =
			(task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
		return hoursDiff > 0 && hoursDiff <= 24;
	};

	return (
		<View
			style={[
				styles.container,
				task.completed && styles.completedContainer,
				isOverdue() && styles.overdueContainer,
				isDueSoon() && styles.dueSoonContainer,
			]}
		>
			<TouchableOpacity
				style={styles.checkboxContainer}
				onPress={handleToggleComplete}
			>
				<View
					style={[styles.checkbox, task.completed && styles.checkboxCompleted]}
				>
					{task.completed && <Text style={styles.checkmark}>✓</Text>}
				</View>
			</TouchableOpacity>

			<View style={styles.content}>
				<TouchableOpacity onPress={handleEdit} style={styles.textContainer}>
					<Text style={[styles.title, task.completed && styles.completedText]}>
						{task.title}
					</Text>

					{task.description && (
						<Text
							style={[
								styles.description,
								task.completed && styles.completedText,
							]}
						>
							{task.description}
						</Text>
					)}

					{task.dueDate && (
						<View style={styles.dateContainer}>
							<Text
								style={[
									styles.dueDate,
									isOverdue() && styles.overdueText,
									isDueSoon() && styles.dueSoonText,
									task.completed && styles.completedText,
								]}
							>
								📅 {formatDate(task.dueDate)}
							</Text>
						</View>
					)}
				</TouchableOpacity>
			</View>

			<TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
				<Text style={styles.deleteButtonText}>🗑️</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		padding: 16,
		marginHorizontal: 16,
		marginVertical: 4,
		borderRadius: 8,
		borderLeftWidth: 4,
		borderLeftColor: "#007AFF",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.22,
		shadowRadius: 2.22,
		elevation: 3,
	},
	completedContainer: {
		backgroundColor: "#f8f9fa",
		borderLeftColor: "#28a745",
	},
	overdueContainer: {
		borderLeftColor: "#dc3545",
		backgroundColor: "#fff5f5",
	},
	dueSoonContainer: {
		borderLeftColor: "#ffc107",
		backgroundColor: "#fffdf0",
	},
	checkboxContainer: {
		marginRight: 12,
	},
	checkbox: {
		width: 24,
		height: 24,
		borderWidth: 2,
		borderColor: "#007AFF",
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	checkboxCompleted: {
		backgroundColor: "#28a745",
		borderColor: "#28a745",
	},
	checkmark: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	content: {
		flex: 1,
	},
	textContainer: {
		flex: 1,
	},
	title: {
		fontSize: 16,
		fontWeight: "600",
		color: "#333",
		marginBottom: 4,
	},
	description: {
		fontSize: 14,
		color: "#666",
		marginBottom: 4,
	},
	dateContainer: {
		marginTop: 4,
	},
	dueDate: {
		fontSize: 12,
		color: "#666",
	},
	overdueText: {
		color: "#dc3545",
		fontWeight: "600",
	},
	dueSoonText: {
		color: "#ffc107",
		fontWeight: "600",
	},
	completedText: {
		textDecorationLine: "line-through",
		color: "#999",
	},
	deleteButton: {
		padding: 8,
		marginLeft: 8,
	},
	deleteButtonText: {
		fontSize: 18,
	},
});
