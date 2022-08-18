import { addDoc, orderBy } from 'firebase/firestore';
import { collection, query, onSnapshot } from 'firebase/firestore';
import Swal from 'sweetalert2';

import db from './setup';
import { getUrlParameter, getUniversityDetails } from './functions';

var $ = require('jquery');

$(() => {
	let curID = getUrlParameter('uid');

	if (curID == '') {
		Swal.fire({
			title: 'Error!',
			text: 'URL tidak valid, silahkan coba lagi',
			icon: 'warning',
			showConfirmButton: false,
			showCancelButton: false,
			allowOutsideClick: false
		});

		return;
	}

	getUniversityDetails(curID).then((res) => {
		if (res.code == 200) {
			$('#uniName').text(res.body.name);
			$('#uniCountry').text(res.body.country);
		} else {
			Swal.fire({
				title: 'Error!',
				text: 'URL tidak valid, silahkan coba lagi',
				icon: 'warning',
				showConfirmButton: false,
				showCancelButton: false,
				allowOutsideClick: false
			});

			return;
		}
	});

	let curCounter = 0;

	onSnapshot(query(collection(db, curID), orderBy('timestamp', 'asc')), (querySnapshot) => {
		$('#formBody').empty();

		querySnapshot.forEach((doc) => {
			let curTemplate = `
            <tr>
                <th scope="row">${curCounter}</th>
                <td>${doc.data().name}</td>
                <td><span class="badge bg-secondary">${doc.data().isDone ? 'DONE' : 'WAITING'}</span></td> 
            </tr>`;

			$('#formBody').append(curTemplate).show('slide', { direction: 'left' }, 1000);

			curCounter++;
		});
	});

	$('#insBtn').on('click', function() {
		let curBtn = $(this);

		curBtn.attr('disabled', true);
		curBtn.text('Please Wait');

		addDoc(collection(db, curID), {
			name: $('#namebox').val(),
			isDone: false,
			timestamp: Date.now()
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
