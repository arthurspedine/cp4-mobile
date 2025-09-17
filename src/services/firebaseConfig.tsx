import { initializeApp } from "firebase/app";
import {
	getAuth,
	initializeAuth,
	signOut as firebaseSignOut,
	// @ts-ignore
	getReactNativePersistence,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	sendPasswordResetEmail,
	updatePassword,
	type User,
	type Auth,
} from "firebase/auth";
import {
	getFirestore,
	collection,
	addDoc,
	getDocs,
	doc,
	updateDoc,
	deleteDoc,
	query,
	where,
	orderBy,
	onSnapshot,
	Timestamp,
	serverTimestamp,
	type DocumentData,
	type QueryDocumentSnapshot,
	type Unsubscribe,
} from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Sua configuração do Firebase
const firebaseConfig = {
	apiKey: "AIzaSyApt2eNCjjJfBLXKZ6vISGULooL1utqtt4",
	authDomain: "cp4-mobile-edf77.firebaseapp.com",
	projectId: "cp4-mobile-edf77",
	storageBucket: "cp4-mobile-edf77.firebasestorage.app",
	messagingSenderId: "181725761123",
	appId: "1:181725761123:web:00a1ec0fb2916866fc7256",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

let auth: Auth;
try {
	auth = initializeAuth(app, {
		persistence: getReactNativePersistence(ReactNativeAsyncStorage),
	});
	console.log("Firebase Auth inicializado com persistência AsyncStorage");
} catch (error: any) {
	// Se já foi inicializado, usa getAuth
	if (error.code === "auth/already-initialized") {
		auth = getAuth(app);
		console.log(
			"Firebase Auth já estava inicializado, usando instância existente",
		);
	} else {
		throw error;
	}
}

export { auth };

// Inicializar Firestore
export const db = getFirestore(app);

// Exportar funções do Firestore e autenticação
export {
	collection,
	addDoc,
	getDocs,
	doc,
	updateDoc,
	deleteDoc,
	query,
	where,
	orderBy,
	onSnapshot,
	Timestamp,
	serverTimestamp,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	sendPasswordResetEmail,
	updatePassword,
	type DocumentData,
	type QueryDocumentSnapshot,
	type Unsubscribe,
	type User,
};

// Wrapper para signOut com logs
export const signOut = async () => {
	try {
		console.log("Firebase: Iniciando signOut...");
		await firebaseSignOut(auth);
		console.log("Firebase: SignOut concluído");
	} catch (error) {
		console.error("Erro no signOut do Firebase:", error);
		throw error;
	}
};

export default app;
