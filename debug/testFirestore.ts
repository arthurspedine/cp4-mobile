import { auth, db, collection, getDocs } from "../src/services/firebaseConfig";

// Função para testar a conexão e permissões do Firestore
export const testFirestoreConnection = async () => {
	console.log("=== TESTE DE CONEXÃO FIRESTORE ===");

	try {
		// Verificar se o usuário está autenticado
		const currentUser = auth.currentUser;
		console.log(
			"Usuário atual:",
			currentUser
				? {
						uid: currentUser.uid,
						email: currentUser.email,
						emailVerified: currentUser.emailVerified,
					}
				: "Não logado",
		);

		if (!currentUser) {
			console.log("❌ Usuário não está autenticado");
			return false;
		}

		// Testar acesso à coleção tasks
		console.log("Testando acesso à coleção tasks...");
		const tasksCollection = collection(db, "tasks");
		const snapshot = await getDocs(tasksCollection);

		console.log("✅ Conexão com Firestore bem-sucedida");
		console.log(`📊 Documentos encontrados: ${snapshot.size}`);

		// Listar documentos (apenas IDs para privacy)
		snapshot.docs.forEach((doc, index) => {
			const data = doc.data();
			console.log(`Documento ${index + 1}:`, {
				id: doc.id,
				hasUserId: !!data.userId,
				userIdMatch: data.userId === currentUser.uid,
				hasTitle: !!data.title,
				completed: data.completed,
			});
		});

		return true;
	} catch (error) {
		console.error("❌ Erro ao testar Firestore:", error);

		if (error && typeof error === "object" && "code" in error) {
			const firebaseError = error as { code: string; message: string };
			console.log("Código do erro:", firebaseError.code);
			console.log("Mensagem:", firebaseError.message);

			switch (firebaseError.code) {
				case "permission-denied":
					console.log("🔒 PROBLEMA: Permissões do Firestore negadas");
					console.log("SOLUÇÃO: Configure as regras de segurança do Firestore");
					break;
				case "unauthenticated":
					console.log("🔑 PROBLEMA: Usuário não autenticado");
					console.log("SOLUÇÃO: Faça login novamente");
					break;
				default:
					console.log("⚠️ Erro desconhecido do Firebase");
			}
		}

		return false;
	}
};

// Função para testar permissões específicas
export const testTaskPermissions = async () => {
	console.log("\n=== TESTE DE PERMISSÕES DE TAREFAS ===");

	try {
		const currentUser = auth.currentUser;
		if (!currentUser) {
			console.log("❌ Usuário não logado");
			return;
		}

		// Tentar criar uma tarefa de teste
		console.log("Testando criação de tarefa...");
		const { createTask } = await import("../src/services/taskService");

		const testTask = {
			title: "Teste de Permissão",
			description: "Tarefa criada para testar permissões",
			dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas no futuro
		};

		const taskId = await createTask(currentUser, testTask);
		console.log("✅ Tarefa criada com sucesso:", taskId);

		// Tentar buscar tarefas
		console.log("Testando busca de tarefas...");
		const { getUserTasks } = await import("../src/services/taskService");
		const tasks = await getUserTasks(currentUser);
		console.log("✅ Tarefas encontradas:", tasks.length);

		return true;
	} catch (error) {
		console.error("❌ Erro ao testar permissões de tarefas:", error);
		return false;
	}
};
