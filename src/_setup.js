import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
	apiKey: process.env.FIREBASE_KEY,
	authDomain: 'ticket-expo.firebaseapp.com',
	databaseUrl: process.env.FIREBASE_DBURL,
	projectId: 'ticket-expo',
	storageBucket: 'ticket-expo.appspot.com',
	messagingSenderId: process.env.FIREBASE_SENDERID,
	appId: process.env.FIREBASE_APPID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const messaging = getMessaging(app)
