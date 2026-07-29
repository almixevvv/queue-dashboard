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

/** Storage Function */
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

export function removeQueueFromStorage(queueId) {
	const queues = getSavedQueues()
	queues = queues.filter(q => q.queueId !== queueId)
	localStorage.setItem('my_queues', JSON.stringify(queues))
}

/** EoL Storage Function */

// export function listenToSingleQueue(queuePath, queueId) {
// 	const queueDocRef = doc(db, queuePath)
// 	const unsubscribe = onSnapshot(queueDocRef, (docSnap) => {
// 		if (docSnap.exists()) {
// 			const data = docSnap.data()

// 			if (data.status === 'called') {
// 				new Notification(`Giliran Anda Tiba! 🔔`, {
// 					body: `Halo, silakan menuju ke booth sekarang!`,
// 					icon: "/assets/img/icaneducation.png",
// 					vibrate: [500, 200, 500, 200, 800], // Pola getar HP
// 					tag: `queue-ABCDE`,
// 					requireInteraction: true
// 				})
// 			}
// 		}
// 	})
// }


/** Audio Function */
let audioCtx = null

export function unlockAudioContext() {
	if (!audioCtx) {
		audioCtx = new Audio('/assets/audio/notification-bell.mp3')
		audioCtx.load()
	}

	// Pancing playback singkat
	audioCtx.play().then(() => {
		audioCtx.pause()
		audioCtx.currentTime = 0
	}).catch((err) => console.error('Audio locked', err))
}

export function playSound() {
	if (audioCtx) {
		audioCtx.currentTime = 0
		audioCtx
			.play()
			.catch(e => console.log('Autoplay blocked', e))
	}
}

/** EoL Audio Function */

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