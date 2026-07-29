import { addDoc, orderBy } from 'firebase/firestore'
import { collection, query, onSnapshot } from 'firebase/firestore'
import Swal from 'sweetalert2'

import { db } from './_setup'
import { getUrlParameter, fetchUniversity, showLoader, unlockAudioContext, saveQueueToStorage } from './_function'
import { fetchConfig, startLoader } from './_init'
import { boothListener, listenToSingleQueue } from './_listener'
import { getFCM, requestPermission } from './_notifications'

const curParams = {
	id: getUrlParameter('uid'),
	eventId: null,
	boothName: null
}

let queueAudio = null;

$(async function () {
	showLoader(true)
	startLoader(curParams.id)

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

	$('#insBtn').on('click', async function () {

		let curBtn = $(this)

		if ($('#namebox').val() === '' || $('#namebox').val().length < 2) {
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
		unlockAudioContext(queueAudio)

		try {
			const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js")

			curBtn.attr('disabled', true)
			curBtn.text('Please Wait')

			const deviceId = crypto.randomUUID()

			// Ambil fcm token
			const fcmToken = await getFCM(registration)
			const docRef = await addDoc(collection(db, curPath), {
				name: $('#namebox').val(),
				deviceId: deviceId,
				boothName: curParams.boothName,
				isDone: false,
				timestamp: Date.now(),
				fcmToken: null,
				status: 'waiting',
			})

			const newQueueID = docRef.id
			const singleQueuePath = `${curPath}/${newQueueID}`

			const queueItem = {
				queueId: newQueueID,
				path: singleQueuePath,
				univId: curParams.id,
				eventId: curParams.event
			}

			saveQueueToStorage(queueItem)
			listenToSingleQueue(singleQueuePath, newQueueID)

			Swal.fire({
				title: 'Success!',
				text: 'Silahkan tunggu nama Anda dipanggil oleh tim kami',
				icon: 'success',
				showConfirmButton: true,
				confirmButtonText: 'Tutup',
				showCancelButton: false
			})

			$('html, body').animate({
				scrollTop: $(document).height()
			}, 1000)

			$('#namebox').val(null)
		} catch (err) {
			console.log('Ada yang salah', err)

			Swal.fire({
				title: 'Error!',
				text: 'Ada kendala pada booth! Silahkan coba lagi',
				icon: 'error',
				showConfirmButton: true,
				confirmButtonText: 'Tutup',
				showCancelButton: false
			})

		} finally {
			curBtn.attr('disabled', false)
			curBtn.text('Daftar')
		}
	})
})