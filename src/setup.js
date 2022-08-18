import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
	apiKey: process.env.FIREBASE_KEY,
	authDomain: 'ticket-expo.firebaseapp.com',
	projectId: 'ticket-expo',
	storageBucket: 'ticket-expo.appspot.com',
	messagingSenderId: process.env.FIREBASE_SENDERID,
	appId: process.env.FIREBASE_APPID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
