import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import Swal from "sweetalert2";
import { app, db } from "./_setup";

/** Request FCM Token */
// Helper untuk mengambil FCM Token
export async function getFcmToken() {
	try {
		const swRegistration = await navigator.serviceWorker.ready;

		const messaging = getMessaging();
		const token = await getToken(messaging, {
			vapidKey: process.env.FIREBASE_VAPID
		});
		return token;
	} catch (err) {
		console.error('Gagal mengambil FCM Token:', err);
		return null;
	}
}

export function getDeviceId() {
	let deviceId = localStorage.getItem('app_device_id');

	if (!deviceId) {
		deviceId = crypto.randomUUID();
		localStorage.setItem('app_device_id', deviceId);
	}

	return deviceId;
}

/** Storage Function */
export function saveQueueToLocaleStorage(newItem) {
	const existingQueues = JSON.parse(localStorage.getItem('my_active_queues') || '[]');

	// Hindari duplikasi jika queueId sudah ada
	const isExist = existingQueues.some(q => q.queueId === newItem.queueId);
	if (!isExist) {
		existingQueues.push(newItem);
		localStorage.setItem('my_active_queues', JSON.stringify(existingQueues));
	}
}

// Panggil fungsi ini saat halaman web pertama kali dimuat (init page)
export function initQueueListeners() {
	const activeQueues = JSON.parse(localStorage.getItem('my_active_queues') || '[]');

	if (activeQueues) {
		console.log('Listener jalan')
	}

	activeQueues.forEach((item) => {
		listenToQueueDocument(item.path);
	});
}

// Global store untuk menyimpan unbind listener agar tidak double listen
const activeListeners = {};

export function listenToQueueDocument(path) {
	// Jika path sudah didengarkan, batalkan agar hemat memori
	if (activeListeners[path]) return;

	const docRef = doc(db, path);

	// onSnapshot hanya akan trigger jika DOKUMEN INI BERUBAH
	const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
		if (docSnapshot.exists()) {
			const data = docSnapshot.data();

			// Jika status berubah menjadi 'called'
			if (data.status === 'called') {
				triggerNativeNotification(data.boothName, data.name);
			}
		}
	});

	// Simpan fungsi unsubscribe
	activeListeners[path] = unsubscribe;
}

async function triggerNativeNotification(boothName, userName) {
	const title = `Giliran Anda Tiba! 🔔`;
	const options = {
		body: `Halo ${userName}, silakan menuju ke ${boothName} sekarang!`,
		icon: '/assets/img/icaneducation.png',
		vibrate: [500, 200, 500, 200, 800],
		requireInteraction: true
	}

	if ("serviceWorker" in navigator) {
		const reg = await navigator.serviceWorker.getRegistration()

		if (reg && reg.active) {
			reg.showNotification(title, options)
			return
		}
	}

	// Fallback native notification
	if ("Notification" in window && Notification.permission === 'granted') {
		new Notification(title, options)
	}
}
/** EoL Storage Function */

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