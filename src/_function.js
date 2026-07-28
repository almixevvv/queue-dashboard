import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import Swal from "sweetalert2";
import { app, db } from "./_setup";

/** Firebase Messaging Function */
// export async function setupNotification(queueId) {
// 	try {

// 		const permission = await Notification.requestPermission()

// 		if (permission !== 'granted') {
// 			console.warn('User menolak notifikasi')
// 			return
// 		}

// 		const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js")
// 		const messaging = getMessaging(app)

// 		const token = await getToken(messaging, {
// 			vapidKey: process.env.FIREBASE_VAPID,
// 			serviceWorkerRegistration: registration
// 		})

// 		if (token) {
// 			// Simpan token ke dokumen antrian user di Firestore
// 			await updateDoc(doc(db), {
// 				fcmToken: token
// 			});
// 		}

// 		// Fallback: kalau tab sedang terbuka & fokus, tampilkan notifikasi langsung
// 		onMessage(messaging, (payload) => {
// 			const { title, body } = payload.notification || {};
// 			new Notification(title || "Giliran Anda", { body });
// 		})

// 	} catch (err) {
// 		console.error("Gagal setup push notification:", err)
// 	}
// }

export function listenToSingleQueue(queuePath, queueId) {
	const queueDocRef = doc(db, queuePath)
	const unsubscribe = onSnapshot(queueDocRef, (docSnap) => {
		if (docSnap.exists()) {
			const data = docSnap.data()

			if (data.status === 'called') {
				new Notification(`Giliran Anda Tiba! 🔔`, {
					body: `Halo, silakan menuju ke booth sekarang!`,
					icon: "/assets/img/icaneducation.png",
					vibrate: [500, 200, 500, 200, 800], // Pola getar HP
					tag: `queue-ABCDE`,
					requireInteraction: true
				})
			}
		}
	})
}

export function getSavedQueues() {
	return JSON.parse(localStorage.getItem('my_queue') || '[]')
}

export function saveQueueToStorage(queueData) {
	const queues = getSavedQueues();

	console.log(!queues.some(q => q.queueId === queueData.queueId))
	if (!queues.some(q => q.queueId === queueData.queueId)) {
		queues.push(queueData);
		localStorage.setItem('my_queues', JSON.stringify(queues));
	}
}

export function unlockAudioContext(queueStatus) {
	if (!queueStatus) {
		queueStatus = new Audio('/assets/audio/notification-bell.mp3')
		queueStatus.load()
	}

	// Pancing playback singkat

	queueStatus.play().then(() => {
		queueStatus.pause()
		queueStatus.currentTime = 0
	}).catch((err) => console.error('Audio locked', err))
}

export async function getFCM(serviceWorker) {
	try {
		const messaging = getMessaging(app)
		const token = await getToken(messaging, {
			vapidKey: process.env.FIREBASE_VAPID,
			serviceWorkerRegistration: serviceWorker
		})

		onMessage(messaging, (payload) => {
			const { title, body } = payload || {}
			new Notification(title || "Giliran Anda", { body })
		})

		return token
	} catch (err) {
		console.error('Gagal ngambil token', err)
		return null
	}
}

export async function fetchUniversity(data) {
	try {
		const reqs = await fetch('https://backend.icedalnusa.com/queue/get-university', {
			method: 'POST',
			body: JSON.stringify(data),
		})

		const resp = await reqs.json()

		return resp
	} catch (err) {
		console.log(err)
		throw err
	}
}

export const renderTable = function (data) {
	const $tRow = $("<tr>")

	const $tDataNo = $('<td>', {
		text: data.counter
	})

	const $tDataName = $('<td>', {
		text: escapeHtml(data.name) || 'Tanpa Nama'
	})

	const $tDataTime = $('<td>', {
		text: timeAgo(data.time)
	})

	const statObj = {
		class: '',
		text: ''
	}

	switch (data.status) {
		case 'waiting':
			statObj.class = 'badge bg-secondary'
			statObj.text = 'Waiting'
			break

		case 'consulting':
			statObj.class = 'badge bg-primary'
			statObj.text = 'Consulting'
			break

		case 'finished':
			statObj.class = 'badge bg-info'
			statObj.text = 'Finished'
			break
	}

	const $tDataStat = $('<td>')
	const $tDataBadge = $('<span>', statObj)

	$tDataStat.append($tDataBadge)
	$tRow.append($tDataNo, $tDataName, $tDataTime, $tDataStat)

	return $tRow
}

export const showLoader = function (stat) {
	if (stat) {
		Swal.fire({
			title: 'Loading...',
			text: 'Please Wait',
			allowOutsideClick: false,
			didOpen: () => {
				Swal.showLoading();
			}
		})
	} else {
		Swal.close()
	}
}

export const escapeHtml = function (str) {
	const div = document.createElement('div')
	div.textContent = str
	return div.innerHTML
}

export function timeAgo(ts) {
	const diffSec = Math.floor((Date.now() - ts) / 1000);
	if (diffSec < 60) return `${diffSec} detik lalu`;

	const diffMin = Math.floor(diffSec / 60);
	if (diffMin < 60) return `${diffMin} menit lalu`;

	const diffHour = Math.floor(diffMin / 60);
	if (diffHour < 24) return `${diffHour} jam lalu`;

	const diffDay = Math.floor(diffHour / 24);
	return `${diffDay} hari lalu`;
}

export function getUrlParameter(sParam) {
	var sPageURL = window.location.search.substring(1),
		sURLVariables = sPageURL.split('&'),
		sParameterName,
		i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
		}
	}
	return false;
}