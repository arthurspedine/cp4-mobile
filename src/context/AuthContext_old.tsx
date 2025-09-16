import { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged as firebaseOnAuthStateChanged, type User } from "firebase/auth";
import {
	auth,
	signOut as firebaseSignOut,
} from "../services/firebaseConfig";

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

const USER_STORAGE_KEY = "@user";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	// Função para salvar usuário no AsyncStorage (como backup)
	const saveUserToStorage = useCallback(async (firebaseUser: User) => {
		try {
			const userData = {
				uid: firebaseUser.uid,
				email: firebaseUser.email,
				displayName: firebaseUser.displayName,
				photoURL: firebaseUser.photoURL,
				emailVerified: firebaseUser.emailVerified,
			};
			await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
			console.log("AuthContext: Usuário salvo no AsyncStorage");
		} catch (error) {
			console.error("Erro ao salvar usuário no AsyncStorage:", error);
		}
	}, []);

	// Função para remover usuário do AsyncStorage
	const removeUserFromStorage = useCallback(async () => {
		try {
			await AsyncStorage.removeItem(USER_STORAGE_KEY);
			console.log("AuthContext: Usuário removido do AsyncStorage");
		} catch (error) {
			console.error("Erro ao remover usuário do AsyncStorage:", error);
		}
	}, []);

	useEffect(() => {
		console.log("AuthContext: Configurando listener do Firebase Auth...");

		// O Firebase Auth com persistência correta já gerencia a restauração do estado
		const unsubscribe = firebaseOnAuthStateChanged(auth, async (firebaseUser: User | null) => {
			console.log(
				"AuthContext: onAuthStateChanged:",
				firebaseUser
					? `Usuário logado: ${firebaseUser.email}`
					: "Usuário deslogado",
			);

			if (firebaseUser) {
				// Usuário logado
				setUser(firebaseUser);
				await saveUserToStorage(firebaseUser);
			} else {
				// Usuário deslogado
				setUser(null);
				await removeUserFromStorage();
			}

			// Sempre atualiza loading após a primeira verificação
			setLoading(false);
		});

		return () => {
			console.log("AuthContext: Removendo listener do Firebase Auth");
			unsubscribe();
		};
	}, [saveUserToStorage, removeUserFromStorage]);

	const signOut = async () => {
		try {
			setLoading(true);
			console.log("AuthContext: Iniciando logout...");

			// Remove do AsyncStorage primeiro
			await removeUserFromStorage();

			// Depois faz logout do Firebase
			await firebaseSignOut();
			// O onAuthStateChanged vai atualizar o estado
			console.log("AuthContext: Logout realizado com sucesso");
		} catch (error) {
			console.error("Erro ao fazer logout:", error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const value: AuthContextType = {
		user,
		loading,
		signOut,
		setUser: (newUser: User | null) => {
			setUser(newUser);
			if (newUser) {
				saveUserToStorage(newUser);
			} else {
				removeUserFromStorage();
			}
		},
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
