import { initializeApp } from "firebase/app";
import {
	getFirestore,
	collection,
	addDoc,
	getDocs,
	doc,
	updateDoc,
	deleteDoc,
} from "firebase/firestore";
import {
	getAuth,
	signInWithCredential,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	updatePassword,
	sendPasswordResetEmail,
	reauthenticateWithCredential,
	EmailAuthProvider,
	onAuthStateChanged,
	type User,
	type Auth,
} from "firebase/auth";

const firebaseConfig = {
	apiKey: "AIzaSyApt2eNCjjJfBLXKZ6vISGULooL1utqtt4",
	authDomain: "cp4-mobile-edf77.firebaseapp.com",
	projectId: "cp4-mobile-edf77",
	storageBucket: "cp4-mobile-edf77.firebasestorage.app",
	messagingSenderId: "181725761123",
	appId: "1:181725761123:web:00a1ec0fb2916866fc7256",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Auth - usar getAuth para evitar warnings de persistência
const auth: Auth = getAuth(app);

export {
	auth,
	db,
	collection,
	addDoc,
	getDocs,
	doc,
	updateDoc,
	deleteDoc,
	signInWithCredential,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	updatePassword,
	sendPasswordResetEmail,
	reauthenticateWithCredential,
	EmailAuthProvider,
	onAuthStateChanged,
};

export type { User };
