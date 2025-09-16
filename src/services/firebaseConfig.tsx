// src/services/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import {
	getAuth,
	signOut as firebaseSignOut,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	sendPasswordResetEmail,
	updatePassword,
	type User,
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

// Inicializar Auth (React Native automaticamente persiste no AsyncStorage)
export const auth = getAuth(app);

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
	console.log("Firebase: Iniciando signOut...");
	const result = await firebaseSignOut(auth);
	console.log("Firebase: SignOut concluído");
	return result;
};

export default app;
