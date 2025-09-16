import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import type { Task } from "../types/task";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

// Configurar permissões de notificação
export const setupNotifications = async (): Promise<boolean> => {
	try {
		if (!Device.isDevice) {
			console.warn("Notificações só funcionam em dispositivos físicos");
			return false;
		}

		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;

		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}

		if (finalStatus !== "granted") {
			console.warn("Permissão de notificação negada");
			return false;
		}

		// Configuração para Android
		if (Platform.OS === "android") {
			await Notifications.setNotificationChannelAsync("tasks", {
				name: "Lembretes de Tarefas",
				importance: Notifications.AndroidImportance.HIGH,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: "#FF231F7C",
				sound: "default",
			});
		}

		return true;
	} catch (error) {
		console.error("Erro ao configurar notificações:", error);
		return false;
	}
};

// Agendar notificação para uma tarefa
export const scheduleTaskNotification = async (
	task: Task,
	minutesBefore: number = 15,
): Promise<string | null> => {
	try {
		if (!task.dueDate || task.completed) {
			return null;
		}

		const notificationTime = new Date(
			task.dueDate.getTime() - minutesBefore * 60 * 1000,
		);
		const now = new Date();

		// Não agendar se a data já passou
		if (notificationTime <= now) {
			console.log("Data de notificação já passou, não agendando");
			return null;
		}

		const secondsUntilNotification = Math.max(
			1,
			Math.floor((notificationTime.getTime() - now.getTime()) / 1000),
		);

		const notificationId = await Notifications.scheduleNotificationAsync({
			content: {
				title: "Lembrete de Tarefa",
				body: `${task.title} - vence em ${minutesBefore} minutos`,
				data: {
					taskId: task.id,
					type: "task_reminder",
				},
				sound: "default",
			},
			trigger: {
				type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
				seconds: secondsUntilNotification,
				repeats: false,
			},
			identifier: `task_${task.id}_${minutesBefore}min`,
		});

		console.log(
			`Notificação agendada para ${notificationTime.toLocaleString()}: ${task.title}`,
		);
		return notificationId;
	} catch (error) {
		console.error("Erro ao agendar notificação:", error);
		return null;
	}
};

// Cancelar notificação de uma tarefa
export const cancelTaskNotification = async (
	taskId: string,
	minutesBefore: number = 15,
): Promise<void> => {
	try {
		const identifier = `task_${taskId}_${minutesBefore}min`;
		await Notifications.cancelScheduledNotificationAsync(identifier);
		console.log(`Notificação cancelada: ${identifier}`);
	} catch (error) {
		console.error("Erro ao cancelar notificação:", error);
	}
};

// Agendar múltiplas notificações para uma tarefa (15min, 1h, 1dia antes)
export const scheduleMultipleTaskNotifications = async (
	task: Task,
): Promise<string[]> => {
	const notificationIds: string[] = [];
	const intervals = [15, 60, 1440]; // 15 min, 1 hora, 1 dia (em minutos)

	for (const minutes of intervals) {
		const id = await scheduleTaskNotification(task, minutes);
		if (id) {
			notificationIds.push(id);
		}
	}

	return notificationIds;
};

// Cancelar todas as notificações de uma tarefa
export const cancelAllTaskNotifications = async (
	taskId: string,
): Promise<void> => {
	const intervals = [15, 60, 1440];

	for (const minutes of intervals) {
		await cancelTaskNotification(taskId, minutes);
	}
};

// Reagendar notificações quando uma tarefa é atualizada
export const rescheduleTaskNotifications = async (
	oldTask: Task,
	newTask: Task,
): Promise<void> => {
	// Cancelar notificações antigas
	await cancelAllTaskNotifications(oldTask.id);

	// Agendar novas notificações se a tarefa não estiver completa e tiver data de vencimento
	if (!newTask.completed && newTask.dueDate) {
		await scheduleMultipleTaskNotifications(newTask);
	}
};

// Notificação imediata para tarefa concluída
export const showTaskCompletedNotification = async (
	task: Task,
): Promise<void> => {
	try {
		await Notifications.scheduleNotificationAsync({
			content: {
				title: "Tarefa Concluída! 🎉",
				body: `"${task.title}" foi marcada como concluída`,
				data: {
					taskId: task.id,
					type: "task_completed",
				},
				sound: "default",
			},
			trigger: null, // Notificação imediata
		});
	} catch (error) {
		console.error("Erro ao mostrar notificação de conclusão:", error);
	}
};

// Buscar todas as notificações agendadas (para debug)
export const getScheduledNotifications = async (): Promise<
	Notifications.NotificationRequest[]
> => {
	try {
		return await Notifications.getAllScheduledNotificationsAsync();
	} catch (error) {
		console.error("Erro ao buscar notificações agendadas:", error);
		return [];
	}
};

// Limpar todas as notificações de tarefas
export const clearAllTaskNotifications = async (): Promise<void> => {
	try {
		const scheduled = await getScheduledNotifications();
		const taskNotifications = scheduled.filter(
			(notif) =>
				notif.identifier.startsWith("task_") ||
				(notif.content.data && notif.content.data.type === "task_reminder"),
		);

		for (const notif of taskNotifications) {
			await Notifications.cancelScheduledNotificationAsync(notif.identifier);
		}

		console.log(
			`${taskNotifications.length} notificações de tarefas foram canceladas`,
		);
	} catch (error) {
		console.error("Erro ao limpar notificações de tarefas:", error);
	}
};
