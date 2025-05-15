import { addDoc, orderBy } from 'firebase/firestore';
import { collection, query, onSnapshot } from 'firebase/firestore';
import Swal from 'sweetalert2';

import { db } from './setup';
import { getUrlParameter, getUniversityDetails, showLoader } from './functions';

var $ = require('jquery');

$(() => {
	showLoader(true);

	const curParams = {
		id: getUrlParameter('uid'),
		event: null
	};

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
		});
		return;
	}

	async function loadConfig() {
		try {

			const timestamp = new Date().getTime(); // Versi unik
			const response = await fetch('./config.json?version=' + timestamp);

			if (!response.ok) throw new Error('Failed to load config');

			const config = await response.json();
			curParams.event = config.EVENT_ID;

			console.log('Loaded Event ID:', curParams);
		} catch (error) {
			console.error('Error loading configuration:', error);
		}
	}

	// Memastikan loadConfig selesai sebelum lanjut
	(async () => {
		await loadConfig();

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
		})

		// Setelah event ID terisi, baru tentukan curPath
		const curPath = `Event/${curParams.event}/${curParams.id}`;

		// Melakukan sinkronisasi data antrian
		onSnapshot(query(collection(db, curPath), orderBy('timestamp', 'asc')), (querySnapshot) => {
			let curCounter = 0;
			$('#formBody').empty();

			querySnapshot.forEach((doc) => {
				curCounter++;
				let curTemplate = `
                    <tr>
                        <th scope="row">${curCounter}</th>
                        <td>${doc.data().name}</td>
                        <td><span class="badge ${doc.data().isDone ? 'bg-success' : 'bg-secondary'}">
                            ${doc.data().isDone ? 'FINISHED' : 'WAITING'}</span></td>
                    </tr>`;
				$('#formBody').append(curTemplate).show('slide', { direction: 'left' }, 1000);
			});
		});

		$('#insBtn').on('click', function () {
			let curBtn = $(this);

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
				});
				return;
			} else {
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
			}
		});
	})();
});

