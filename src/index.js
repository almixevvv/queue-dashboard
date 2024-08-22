import { addDoc, orderBy } from 'firebase/firestore';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { getToken } from "firebase/messaging";


import Swal from 'sweetalert2';

import { db, messaging } from './setup';
import { getUrlParameter, getUniversityDetails, showLoader } from './functions';

var $ = require('jquery');

$(() => {

	// let curToken = null

	// function requestNotificationPermissionAndGetToken() {
	// 	if (Notification.permission === 'granted') {
	// 		getFCMToken();
	// 	} else if (Notification.permission === 'default') {
	// 		Notification.requestPermission().then((permission) => {
	// 			if (permission === 'granted') {
	// 				getFCMToken();
	// 			} else {
	// 				alert('Please enable notifications to receive messages.');
	// 			}
	// 		});
	// 	} else {
	// 		alert('Notifications are blocked. Please enable them in your browser settings.');
	// 	}
	// }

	// function getFCMToken() {
	// 	getToken(messaging, { vapidKey: process.env.FIREBASE_MESSAGEKEY })
	// 		.then((currentToken) => {
	// 			if (currentToken) {
	// 				console.log('FCM Token:', currentToken);

	// 				curToken = currentToken
	// 				// sendTokenToServer(currentToken)
	// 				listenForMessages()
	// 			} else {
	// 				console.warn('No registration token available. Request permission to generate one.');
	// 			}
	// 		})
	// 		.catch((err) => {
	// 			console.error('An error occurred while retrieving the token. ', err);
	// 		});
	// }

	// function listenForMessages() {
	// 	onMessage(messaging, (payload) => {
	// 		console.log('Message received. ', payload);

	// 		const notificationTitle = payload.notification.title;
	// 		const notificationOptions = {
	// 			body: payload.notification.body,
	// 			icon: payload.notification.icon
	// 		};

	// 		if (Notification.permission === 'granted') {
	// 			new Notification(notificationTitle, notificationOptions);
	// 		} else {
	// 			console.warn('Notification permission not granted.');
	// 		}
	// 	});

	// 	console.log('Listening for messages...');
	// }

	// function sendTokenToServer(token) {
	// 	addDoc(collection(db, `Tokens/Users/${curParams.id}`), {
	// 		token: token,
	// 		status: 'active',
	// 	})
	// }

	// requestNotificationPermissionAndGetToken();

	showLoader(true)

	let curParams = {
		id: getUrlParameter('uid'),
		event: getUrlParameter('event')
	}

	if (curParams.id == '') {
		Swal.fire({
			title: 'Invalid Url',
			text: 'URL tidak valid, silahkan coba lagi',
			icon: 'warning',
			showConfirmButton: false,
			showCancelButton: false,
			allowOutsideClick: false,
			didOpen: () => {
				Swal.hideLoading()
			}
		})

		return;
	}

	getUniversityDetails(curParams).then((res) => {
		if (res.code == 200) {

			$('#uniName').text(res.body.name)
			$('#uniCountry').text(res.body.country)

			if (res.body.image != null || res.body.image != '') {
				$('#uniImage').attr('src', res.body.image)
			}

			showLoader(false)
		} else {
			showLoader(false)

			Swal.fire({
				title: 'Error!',
				text: 'URL tidak valid, silahkan coba lagi',
				icon: 'warning',
				showConfirmButton: false,
				showCancelButton: false,
				allowOutsideClick: false,
				didOpen: () => {
					Swal.hideLoading()
				}
			});

			return;
		}
	});

	// let curCounter = 0;

	let curPath = ''

	if (curParams.event == null) {
		curPath = curParams.id;
	} else {
		curPath = `${'Event/' + curParams.event + '/' + curParams.id}`
	}

	onSnapshot(query(collection(db, curPath), orderBy('timestamp', 'asc')), (querySnapshot) => {

		let curCounter = 0

		$('#formBody').empty()

		querySnapshot.forEach((doc) => {

			curCounter++

			let curTemplate = `
			    <tr>
			        <th scope="row">${curCounter}</th>
			        <td>${doc.data().name}</td>
			        <td><span class="badge ${doc.data().isDone ? 'bg-success' : 'bg-secondary'}">${doc.data().isDone
					? 'FINISHED'
					: 'WAITING'}</span></td> 
			    </tr>`;

			$('#formBody').append(curTemplate).show('slide', { direction: 'left' }, 1000);

		});


	})


	$('#insBtn').on('click', function () {
		let curBtn = $(this);

		curBtn.attr('disabled', true);
		curBtn.text('Please Wait');

		addDoc(collection(db, curPath), {
			name: $('#namebox').val(),
			isDone: false,
			timestamp: Date.now(),
			status: 'waiting',
		}).then(() => {
			Swal.fire({
				title: 'Success!',
				text: 'Silahkan tunggu nama Anda dipanggil oleh tim kami',
				icon: 'success',
				showConfirmButton: true,
				confirmButtonText: 'Tutup',
				showCancelButton: false
			});

			$('#namebox').val(null);
			curBtn.attr('disabled', false);
			curBtn.text('Daftar');
		});
	});
});
