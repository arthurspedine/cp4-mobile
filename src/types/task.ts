export interface Task {
	id: string;
	title: string;
	description: string;
	completed: boolean;
	dueDate: Date | null;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
}

export interface CreateTaskData {
	title: string;
	description: string;
	dueDate?: Date | null;
}

export interface UpdateTaskData {
	title?: string;
	description?: string;
	completed?: boolean;
	dueDate?: Date | null;
}

export interface TaskContextType {
	tasks: Task[];
	loading: boolean;
	error: string | null;
	addTask: (taskData: CreateTaskData) => Promise<void>;
	updateTask: (taskId: string, taskData: UpdateTaskData) => Promise<void>;
	deleteTask: (taskId: string) => Promise<void>;
	toggleTaskComplete: (taskId: string) => Promise<void>;
	refreshTasks: () => Promise<void>;
}
