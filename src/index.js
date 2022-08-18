import { initializeApp } from 'firebase/app';
import { addDoc, getFirestore, orderBy } from 'firebase/firestore';
import { collection, getDocs, query, setDoc, onSnapshot } from 'firebase/firestore';
import Swal from 'sweetalert2';
import uniqid from 'uniqid';

var $ = require('jquery');

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

$(() => {
	onSnapshot(query(collection(db, 'tickets'), orderBy('timestamp', 'asc')), (querySnapshot) => {
		$('#formBody').empty();

		querySnapshot.forEach((doc) => {
			let curTemplate = `
            <tr>
                <th scope="row">1</th>
                <td>${doc.data().name}</td>
                <td><span class="badge bg-secondary">${doc.data().isDone ? 'DONE' : 'WAITING'}</span></td> 
            </tr>`;

			$('#formBody').append(curTemplate).show('slide', { direction: 'left' }, 1000);
		});
	});

	$('#insBtn').on('click', function() {
		addDoc(collection(db, 'tickets'), {
			name: $('#namebox').val(),
			isDone: false,
			timestamp: Date.now()
		});

		$('#namebox').val(null);
	});
});
