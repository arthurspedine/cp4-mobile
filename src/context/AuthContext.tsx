import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	onAuthStateChanged as firebaseOnAuthStateChanged,
	type User,
} from "firebase/auth";
import { auth, signOut as firebaseSignOut } from "../services/firebaseConfig";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signOut: () => Promise<void>;
	setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	// Função para salvar no AsyncStorage (backup adicional)
	const saveUserToStorage = useCallback(async (user: User) => {
		try {
			const userData = {
				uid: user.uid,
				email: user.email,
				displayName: user.displayName,
				emailVerified: user.emailVerified,
			};
			await AsyncStorage.setItem("@user_backup", JSON.stringify(userData));
			console.log("AuthContext: Backup do usuário salvo no AsyncStorage");
		} catch (error) {
			console.error("Erro ao salvar backup do usuário:", error);
		}
	}, []);

	// Função para remover do AsyncStorage (backup adicional)
	const removeUserFromStorage = useCallback(async () => {
		try {
			await AsyncStorage.removeItem("@user_backup");
			console.log("AuthContext: Backup do usuário removido do AsyncStorage");
		} catch (error) {
			console.error("Erro ao remover backup do usuário:", error);
		}
	}, []);

	// Configuração do listener do Firebase Auth
	useEffect(() => {
		console.log("AuthContext: Configurando listener do Firebase Auth...");

		const unsubscribe = firebaseOnAuthStateChanged(
			auth,
			async (firebaseUser: User | null) => {
				console.log(
					"AuthContext: onAuthStateChanged:",
					firebaseUser
						? `Usuário logado: ${firebaseUser.email}`
						: "Usuário deslogado",
				);

				if (firebaseUser) {
					// Usuário autenticado
					setUser(firebaseUser);
					await saveUserToStorage(firebaseUser);
				} else {
					// Usuário deslogado
					setUser(null);
					await removeUserFromStorage();
				}

				// Para de carregar após a primeira verificação
				setLoading(false);
			},
			(error) => {
				console.error("Erro no onAuthStateChanged:", error);
				setLoading(false);
			},
		);

		return () => {
			console.log("AuthContext: Removendo listener do Firebase Auth");
			unsubscribe();
		};
	}, [saveUserToStorage, removeUserFromStorage]);

	const signOut = async () => {
		try {
			console.log("AuthContext: Iniciando logout...");

			// O Firebase Auth com persistência vai cuidar da remoção automática
			await firebaseSignOut();

			console.log("AuthContext: Logout realizado com sucesso");
		} catch (error) {
			console.error("Erro ao fazer logout:", error);
			throw error;
		}
	};

	// Função para atualizar usuário manualmente (raramente usada)
	const setUserManually = useCallback(
		async (newUser: User | null) => {
			setUser(newUser);
			if (newUser) {
				await saveUserToStorage(newUser);
			} else {
				await removeUserFromStorage();
			}
		},
		[saveUserToStorage, removeUserFromStorage],
	);

	const value: AuthContextType = {
		user,
		loading,
		signOut,
		setUser: setUserManually,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
