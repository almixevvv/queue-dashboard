import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_KEY,
    authDomain: 'ticket-expo.firebaseapp.com',
    databaseUrl: process.env.FIREBASE_DBURL,
    projectId: 'ticket-expo',
    storageBucket: 'ticket-expo.appspot.com',
    messagingSenderId: process.env.FIREBASE_SENDERID,
    appId: process.env.FIREBASE_APPID
};

export const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export const db = getFirestore(app);