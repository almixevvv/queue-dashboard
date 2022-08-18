import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
	apiKey: 'AIzaSyBDZfdt9SmJ083cFo6pMkzknAuaosU1I9E',
	authDomain: 'ticket-expo.firebaseapp.com',
	projectId: 'ticket-expo',
	storageBucket: 'ticket-expo.appspot.com',
	messagingSenderId: '649813844821',
	appId: '1:649813844821:web:63647b156522f95d6a45dc'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
