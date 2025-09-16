import type React from "react";
import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";
import type {
	Task,
	TaskContextType,
	CreateTaskData,
	UpdateTaskData,
} from "../types/task";
import { useAuth } from "./AuthContext";
import * as TaskService from "../services/taskService";
import * as NotificationService from "../services/notifications";

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
	const context = useContext(TaskContext);
	if (context === undefined) {
		throw new Error("useTask must be used within a TaskProvider");
	}
	return context;
};

interface TaskProviderProps {
	children: React.ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
	const { user } = useAuth();
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Função para limpar erro após um tempo
	const clearError = useCallback(() => {
		if (error) {
			setTimeout(() => setError(null), 5000);
		}
	}, [error]);

	// Configurar listener em tempo real quando usuário estiver logado
	useEffect(() => {
		console.log("TaskContext: Usuário mudou:", user ? "Logado" : "Não logado");

		if (!user) {
			setTasks([]);
			setLoading(false);
			return;
		}

		console.log("TaskContext: Configurando listener para usuário:", user.uid);
		setLoading(true);
		setError(null);

		// Configurar notificações
		NotificationService.setupNotifications();

		const unsubscribe = TaskService.subscribeToUserTasks(
			user,
			(newTasks) => {
				console.log("TaskContext: Tarefas recebidas:", newTasks.length);
				setTasks(newTasks);
				setLoading(false);
				setError(null);
			},
			(err) => {
				console.error("Erro no listener de tarefas:", err);
				setError(`Erro ao sincronizar tarefas: ${err.message}`);
				setLoading(false);
			},
		);

		// Limpar listener quando componente for desmontado ou usuário mudar
		return () => {
			unsubscribe();
		};
	}, [user]);

	// Limpar erro automaticamente
	useEffect(() => {
		clearError();
	}, [clearError]);

	// Adicionar nova tarefa
	const addTask = useCallback(
		async (taskData: CreateTaskData): Promise<void> => {
			if (!user) {
				throw new Error("Usuário não está logado");
			}

			try {
				setError(null);
				const taskId = await TaskService.createTask(user, taskData);

				// Agendar notificações se a tarefa tiver data de vencimento
				if (taskData.dueDate) {
					const newTask: Task = {
						id: taskId,
						title: taskData.title,
						description: taskData.description,
						completed: false,
						dueDate: taskData.dueDate,
						createdAt: new Date(),
						updatedAt: new Date(),
						userId: user.uid,
					};
					await NotificationService.scheduleMultipleTaskNotifications(newTask);
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Erro ao adicionar tarefa";
				setError(errorMessage);
				throw new Error(errorMessage);
			}
		},
		[user],
	);

	// Atualizar tarefa existente
	const updateTask = useCallback(
		async (taskId: string, taskData: UpdateTaskData): Promise<void> => {
			try {
				setError(null);

				// Encontrar tarefa atual para comparação
				const currentTask = tasks.find((task) => task.id === taskId);
				if (!currentTask) {
					throw new Error("Tarefa não encontrada");
				}

				await TaskService.updateTask(taskId, taskData);

				// Reagendar notificações se necessário
				const updatedTask: Task = {
					...currentTask,
					...taskData,
					updatedAt: new Date(),
				};

				await NotificationService.rescheduleTaskNotifications(
					currentTask,
					updatedTask,
				);

				// Se a tarefa foi marcada como concluída, mostrar notificação
				if (taskData.completed === true && !currentTask.completed) {
					await NotificationService.showTaskCompletedNotification(updatedTask);
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Erro ao atualizar tarefa";
				setError(errorMessage);
				throw new Error(errorMessage);
			}
		},
		[tasks],
	);

	// Deletar tarefa
	const deleteTask = useCallback(async (taskId: string): Promise<void> => {
		try {
			setError(null);
			await TaskService.deleteTask(taskId);

			// Cancelar todas as notificações da tarefa
			await NotificationService.cancelAllTaskNotifications(taskId);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Erro ao deletar tarefa";
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, []);

	// Alternar status de conclusão
	const toggleTaskComplete = useCallback(
		async (taskId: string): Promise<void> => {
			const task = tasks.find((t) => t.id === taskId);
			if (!task) {
				throw new Error("Tarefa não encontrada");
			}

			await updateTask(taskId, { completed: !task.completed });
		},
		[tasks, updateTask],
	);

	// Recarregar tarefas manualmente
	const refreshTasks = useCallback(async (): Promise<void> => {
		if (!user) {
			return;
		}

		try {
			setLoading(true);
			setError(null);
			const userTasks = await TaskService.getUserTasks(user);
			setTasks(userTasks);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Erro ao recarregar tarefas";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	}, [user]);

	const contextValue: TaskContextType = {
		tasks,
		loading,
		error,
		addTask,
		updateTask,
		deleteTask,
		toggleTaskComplete,
		refreshTasks,
	};

	return (
		<TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>
	);
};
