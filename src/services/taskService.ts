import {
	db,
	collection,
	addDoc,
	getDocs,
	doc,
	updateDoc,
	deleteDoc,
	query,
	where,
	onSnapshot,
	Timestamp,
	serverTimestamp,
	type DocumentData,
	type QueryDocumentSnapshot,
} from "./firebaseConfig";
import type { Task, CreateTaskData, UpdateTaskData } from "../types/task";
import type { User } from "firebase/auth";

// Função auxiliar para tratar erros do Firebase
const handleFirebaseError = (error: unknown): string => {
	if (error && typeof error === "object" && "code" in error) {
		const firebaseError = error as { code: string; message: string };
		switch (firebaseError.code) {
			case "permission-denied":
				return "Permissão negada. Verifique se você está logado e tem acesso aos dados.";
			case "unavailable":
				return "Serviço temporariamente indisponível. Tente novamente.";
			case "deadline-exceeded":
				return "Operação cancelada por timeout. Verifique sua conexão.";
			case "unauthenticated":
				return "Usuário não autenticado. Faça login novamente.";
			default:
				return `Erro do Firebase: ${firebaseError.message}`;
		}
	}
	return "Erro desconhecido";
};

const COLLECTION_NAME = "tasks";

// Converte documento do Firestore para Task
const firestoreToTask = (doc: QueryDocumentSnapshot<DocumentData>): Task => {
	const data = doc.data();
	return {
		id: doc.id,
		title: data.title,
		description: data.description,
		completed: data.completed,
		dueDate: data.dueDate ? data.dueDate.toDate() : null,
		createdAt: data.createdAt.toDate(),
		updatedAt: data.updatedAt.toDate(),
		userId: data.userId,
	};
};

// Converte dados de tarefa para formato do Firestore
const taskToFirestore = (
	taskData: CreateTaskData | UpdateTaskData,
	userId?: string,
): Record<string, unknown> => {
	const firestoreData: Record<string, unknown> = {};

	if ("title" in taskData && taskData.title !== undefined) {
		firestoreData.title = taskData.title;
	}

	if ("description" in taskData && taskData.description !== undefined) {
		firestoreData.description = taskData.description;
	}

	if ("completed" in taskData && taskData.completed !== undefined) {
		firestoreData.completed = taskData.completed;
	}

	if ("dueDate" in taskData) {
		firestoreData.dueDate = taskData.dueDate
			? Timestamp.fromDate(taskData.dueDate)
			: null;
	}

	if (userId) {
		firestoreData.userId = userId;
		firestoreData.createdAt = serverTimestamp();
	}

	firestoreData.updatedAt = serverTimestamp();

	return firestoreData;
};

// Criar nova tarefa
export const createTask = async (
	user: User,
	taskData: CreateTaskData,
): Promise<string> => {
	try {
		const tasksCollection = collection(db, COLLECTION_NAME);
		const firestoreData = taskToFirestore(taskData, user.uid);
		firestoreData.completed = false; // Sempre começa como não concluída

		const docRef = await addDoc(tasksCollection, firestoreData);
		return docRef.id;
	} catch (error) {
		console.error("Erro ao criar tarefa:", error);
		throw new Error(handleFirebaseError(error));
	}
};

// Buscar todas as tarefas do usuário
export const getUserTasks = async (user: User): Promise<Task[]> => {
	try {
		const tasksCollection = collection(db, COLLECTION_NAME);
		// Removendo orderBy temporariamente para evitar erro de índice
		const q = query(tasksCollection, where("userId", "==", user.uid));

		const querySnapshot = await getDocs(q);
		// Ordenando no cliente
		return querySnapshot.docs
			.map((doc) => firestoreToTask(doc))
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
	} catch (error) {
		console.error("Erro ao buscar tarefas:", error);
		throw new Error(handleFirebaseError(error));
	}
};

// Atualizar tarefa
export const updateTask = async (
	taskId: string,
	taskData: UpdateTaskData,
): Promise<void> => {
	try {
		const taskRef = doc(db, COLLECTION_NAME, taskId);
		const firestoreData = taskToFirestore(taskData);

		await updateDoc(taskRef, firestoreData);
	} catch (error) {
		console.error("Erro ao atualizar tarefa:", error);
		throw new Error(handleFirebaseError(error));
	}
};

// Deletar tarefa
export const deleteTask = async (taskId: string): Promise<void> => {
	try {
		const taskRef = doc(db, COLLECTION_NAME, taskId);
		await deleteDoc(taskRef);
	} catch (error) {
		console.error("Erro ao deletar tarefa:", error);
		throw new Error(handleFirebaseError(error));
	}
};

// Alternar status de conclusão da tarefa
export const toggleTaskComplete = async (
	taskId: string,
	currentStatus: boolean,
): Promise<void> => {
	return updateTask(taskId, { completed: !currentStatus });
};

// Listener em tempo real para tarefas do usuário
export const subscribeToUserTasks = (
	user: User,
	onTasksUpdate: (tasks: Task[]) => void,
	onError: (error: Error) => void,
): (() => void) => {
	try {
		const tasksCollection = collection(db, COLLECTION_NAME);
		// Removendo orderBy temporariamente para evitar erro de índice
		const q = query(tasksCollection, where("userId", "==", user.uid));

		const unsubscribe = onSnapshot(
			q,
			(querySnapshot) => {
				try {
					// Ordenando no cliente
					const tasks = querySnapshot.docs
						.map((doc) => firestoreToTask(doc))
						.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
					onTasksUpdate(tasks);
				} catch (error) {
					console.error("Erro ao processar atualização de tarefas:", error);
					onError(new Error("Erro ao processar tarefas"));
				}
			},
			(error) => {
				console.error("Erro no listener de tarefas:", error);
				const errorMessage = handleFirebaseError(error);
				onError(new Error(errorMessage));
			},
		);

		return unsubscribe;
	} catch (error) {
		console.error("Erro ao configurar listener de tarefas:", error);
		const errorMessage = handleFirebaseError(error);
		onError(new Error(errorMessage));
		return () => {}; // Retorna função vazia em caso de erro
	}
};

// Buscar tarefas com vencimento próximo (para notificações)
export const getTasksDueSoon = async (
	user: User,
	hoursAhead: number = 24,
): Promise<Task[]> => {
	try {
		const tasksCollection = collection(db, COLLECTION_NAME);
		const now = new Date();
		const future = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

		const q = query(
			tasksCollection,
			where("userId", "==", user.uid),
			where("completed", "==", false),
			where("dueDate", ">=", Timestamp.fromDate(now)),
			where("dueDate", "<=", Timestamp.fromDate(future)),
		);

		const querySnapshot = await getDocs(q);
		return querySnapshot.docs.map((doc) => firestoreToTask(doc));
	} catch (error) {
		console.error("Erro ao buscar tarefas próximas do vencimento:", error);
		throw new Error(handleFirebaseError(error));
	}
};
