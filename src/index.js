import { addDoc, orderBy } from 'firebase/firestore';
import { collection, query, onSnapshot } from 'firebase/firestore';
import Swal from 'sweetalert2';

import { db } from './setup';
import { getUrlParameter, fetchUniversity, showLoader, renderTable } from './_function';
import { fetchConfig, startLoader } from './_init';

const curParams = {
	id: getUrlParameter('uid'),
	event: null
}


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

	// Setelah event ID terisi, baru tentukan curPath
	const curPath = `Event/${curParams.event}/${curParams.id}`

	try {
		const resp = await fetchUniversity(curParams)

		$('#uniName').text(resp.body.name)
		$('#uniCountry').text(resp.body.country)

		if (resp.body.image != null || resp.body.image != '') {
			$('#uniImage').attr('src', resp.body.image)
		}

		showLoader(false)

		// Melakukan sinkronisasi data antrian
		onSnapshot(query(collection(db, curPath), orderBy('timestamp', 'asc')), (querySnapshot) => {
			$('#formBody').empty()

			if (querySnapshot.docs.length == 0) {
				$('#formBody')
					.append(`<tr>
			        			<td colspan="4">
			            			<h5 class="text-center text-muted font-italic my-5">Data kosong</h5>
			            		</td>
			        		 </tr>`)

				return
			}

			let curCounter = 0

			querySnapshot.forEach((doc) => {
				curCounter++

				const curData = doc.data()
				const $curEl = renderTable({
					counter: curCounter,
					name: curData.name,
					time: curData.timestamp,
					status: curData.status
				})

				$('#formBody')
					.append($curEl)
					.show('slide', { direction: 'left' }, 1000)
			})
		})
	} catch (err) {
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

	$('#insBtn').on('click', function () {

		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission()
		}

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

		curBtn.attr('disabled', true)
		curBtn.text('Please Wait')

		const deviceId = crypto.randomUUID()

		addDoc(collection(db, curPath), {
			name: $('#namebox').val(),
			deviceId: deviceId,
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
		})
	})
})