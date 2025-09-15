import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "firebase/auth";
import {
	auth,
	onAuthStateChanged,
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const checkStoredUser = useCallback(async () => {
		try {
			const storedUser = await AsyncStorage.getItem("@user");
			if (storedUser && !auth.currentUser) {
				// Se há usuário armazenado mas não há usuário autenticado no Firebase,
				// aguarda a verificação do Firebase Auth
				return;
			}
		} catch (error) {
			console.log("Erro ao verificar usuário armazenado:", error);
		}
	}, []);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				setUser(firebaseUser);
				// Salva o usuário no AsyncStorage
				await AsyncStorage.setItem(
					"@user",
					JSON.stringify({
						uid: firebaseUser.uid,
						email: firebaseUser.email,
						displayName: firebaseUser.displayName,
						photoURL: firebaseUser.photoURL,
					}),
				);
			} else {
				setUser(null);
				// Remove o usuário do AsyncStorage
				await AsyncStorage.removeItem("@user");
			}
			setLoading(false);
		});

		// Verifica se há usuário salvo no AsyncStorage
		checkStoredUser();

		return unsubscribe;
	}, [checkStoredUser]);

	const signOut = async () => {
		try {
			await firebaseSignOut(auth);
			await AsyncStorage.removeItem("@user");
			setUser(null);
		} catch (error) {
			console.error("Erro ao fazer logout:", error);
			throw error;
		}
	};

	const value: AuthContextType = {
		user,
		loading,
		signOut,
		setUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
