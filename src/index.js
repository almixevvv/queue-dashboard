import { addDoc, orderBy } from 'firebase/firestore'
import { collection, query, onSnapshot } from 'firebase/firestore'
import Swal from 'sweetalert2'

import { db } from './_setup'
import { getUrlParameter, fetchUniversity, showLoader, unlockAudioContext, saveQueueToStorage, getDeviceId, saveQueueToLocaleStorage, listenToQueueDocument, getFcmToken } from './_function'
import { fetchConfig, startLoader } from './_init'
import { boothListener } from './_listener'
import { getFCM, requestPermission } from './_notifications'

let queueAudio = null;

$(async function () {

	const curParams = {
		id: getUrlParameter('uid'),
		eventId: null,
		boothName: null
	}


	showLoader(true)

	const curConfig = await fetchConfig()

	if (curConfig.statusCode !== 200) {
		Swal.fire({
			title: 'Invalid Configuration',
			text: 'File tidak valid. Silahkan coba lagi',
			icon: 'warning',
			showConfirmButton: false,
			showCancelButton: false,
			allowOutsideClick: false,
			didOpen: () => {
				Swal.hideLoading()
			}
		})

		return
	}

	curParams.event = curConfig.data

	if (getUrlParameter('event') !== false) {
		curParams.event = getUrlParameter('event')
		curParams.id = curParams.id
	}

	const curPath = `Event/${curParams.event}/${curParams.id}`

	try {
		const resp = await fetchUniversity(curParams)

		$('#uniName').text(resp.body.name)
		$('#uniCountry').text(resp.body.country)

		curParams.boothName = resp.body.name

		if (resp.body.image != null || resp.body.image != '') {
			$('#uniImage').attr('src', resp.body.image)
		}

		showLoader(false)

		// Booth change listener
		boothListener(curPath)
	} catch (err) {
		console.log(err)

		Swal.fire({
			title: 'Invalid Configuration',
			text: 'Link tidak valid. Silahkan coba lagi',
			icon: 'warning',
			showConfirmButton: false,
			showCancelButton: false,
			allowOutsideClick: false,
			didOpen: () => {
				Swal.hideLoading()
			}
		})

		return
	}

	const registration = await navigator.serviceWorker.register("firebase-messaging-sw.js")
	const curStat = await Notification.requestPermission()

	if (curStat === 'denied') {
		Swal.fire({
			title: 'Ijinkan Notifikasi',
			text: 'Silahkan nyalakan notifikasi untuk mengetahui giliran Anda',
			icon: 'warning',
			showConfirmButton: true,
			confirmButtonText: 'Nyalakan',
			showCancelButton: false
		}).then((res) => {
			Notification.requestPermission()
		})
	}

	/**  */

	$('#insBtn').on('click', async function () {
		let curBtn = $(this)
		const $elName = $('#namebox')

		if ($elName.val() === '' || $elName.val().length < 2) {
			Swal.fire({
				title: 'Nama Kosong',
				text: 'Silahkan mengisi nama Anda untuk mulai mengantri',
				icon: 'warning',
				showCancelButton: true,
				showConfirmButton: false,
				cancelButtonText: 'Tutup',
				didOpen: () => {
					Swal.hideLoading()
				}
			})

			return
		}

		requestPermission()

		try {

			const permStat = await Notification.requestPermission()
			let fcmToken = null

			if (permStat == 'granted') {
				fcmToken = await getFcmToken()
			}

			const deviceId = getDeviceId()
			const docRef = await addDoc(collection(db, curPath), {
				name: $elName.val(),
				deviceId: deviceId,
				boothName: curParams.boothName,
				isDone: false,
				timestamp: Date.now(),
				fcmToken: fcmToken,
				status: 'waiting',
			})

			const newQueueId = docRef.id
			const singleQueuePath = `${curPath}/${newQueueId}`

			const newQueueItem = {
				queueId: newQueueId,
				path: singleQueuePath,
				univId: curParams.id,
				eventId: curParams.event,
				boothName: curParams.boothName,
				status: 'waiting',
				registeredAt: Date.now()
			}

			saveQueueToLocaleStorage(newQueueItem)
			listenToQueueDocument(singleQueuePath)

			Swal.fire({
				title: 'Success!',
				text: 'Silahkan tunggu nama Anda dipanggil oleh tim kami',
				icon: 'success',
				showConfirmButton: true,
				confirmButtonText: 'Tutup',
				showCancelButton: false
			})
		} catch (err) {
			console.log('Ada masalah', err)

			Swal.fire({
				title: 'Invalid Configuration',
				text: 'Ada kendala jaringan. Silahkan coba lagi',
				icon: 'warning',
				showConfirmButton: false,
				showCancelButton: false,
				allowOutsideClick: false,
				didOpen: () => {
					Swal.hideLoading()
				}
			})
		}
	})
})