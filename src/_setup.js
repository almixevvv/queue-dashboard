import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
	apiKey: "AIzaSyBDZfdt9SmJ083cFo6pMkzknAuaosU1I9E",
	authDomain: "ticket-expo.firebaseapp.com",
	databaseURL: "https://ticket-expo-default-rtdb.firebaseio.com",
	projectId: "ticket-expo",
	storageBucket: "ticket-expo.firebasestorage.app",
	messagingSenderId: "649813844821",
	appId: "1:649813844821:web:c86b43f9204ce98d6a45dc"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const messaging = getMessaging(app)
