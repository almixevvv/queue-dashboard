import { addDoc, orderBy } from 'firebase/firestore';
import { collection, query, onSnapshot } from 'firebase/firestore';
import Swal from 'sweetalert2';

import { db } from './setup';
import { getUrlParameter, getUniversityDetails, showLoader, escapeHtml, timeAgo } from './functions';
import { Redis } from '@upstash/redis';

var $ = require('jquery')

const curParams = {
	id: getUrlParameter('uid'),
	event: null
};

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL,
	token: process.env.UPSTASH_REDIS_REST_TOKEN
})

let pollTimer = null;
const POLL_INTERVAL_MS = 2000;

function refreshTimes() {
	document.getElementById('formBody').querySelectorAll('.student-row').forEach(el => {
		const createdAt = Number(el.dataset.created)
		const timeEl = el.querySelector('.row-time')

		if (timeEl && createdAt) timeEl.textContent = timeAgo(createdAt)
	})
}

function renderTable(data) {
	let curTemplate = ``

	const existingSet = new Set([...document.getElementById('formBody').querySelectorAll('.student-row')].map(el => el.id));
	const incomingSet = new Set(data.map(i => i.id))
	const sameSet = existingSet.size === incomingSet.size && [...existingSet].every(id => incomingSet.has(id))

	if (sameSet) return; // tidak ada perubahan struktural, jangan re-render (biar animasi tidak putus)

	$('#formBody')
		.empty()

	if (data.length == 0) {
		$('#formBody')
			.append(`<tr>
            			<td colspan="4">
                			<h5 class="text-center text-muted font-italic my-5">Data kosong</h5>
                		</td>
            		 </tr>`)

		return
	}

	data.sort((a, b) => a.number - b.number).forEach(item => {
		let curStatus = ''

		switch (item.status) {
			case 'pending':
				curStatus = 'Waiting'
				break

			case 'finished':
				curStatus = 'Finished'
				break

			case 'active':
				curStatus = 'Consulting'
				break
		}

		$('#formBody')
			.append(`<tr class="student-row" id="${item.id}" data-created="${item.createdAt}">
							<th>${item.number}</th>
							<td>${escapeHtml(item.name || 'Tanpa Nama')}</td>
							<td class="row-time">${timeAgo(item.createdAt)}</td>
							<td>
								<span class="badge ${item.status == 'pending' ? 'bg-secondary' : 'bg-success'}">${curStatus}</span>
							</td>
						 </tr>`)
			.show('fast', {
				direction: 'left'
			}, 900)
	})
}

async function startPolling() {
	try {
		const activeId = await redis.smembers(`queue:${curParams.event}:${curParams.id}:active`)

		if (!activeId || activeId.length == 0) {
			console.log('ini kosong')
			return
		}

		const getPipe = redis.pipeline()

		activeId.forEach(id => getPipe.get(`queue:${curParams.event}:${curParams.id}:item:${id}`))
		const rawItems = await getPipe.exec()

		const items = rawItems
			.filter(Boolean)
			.map(raw => (typeof raw === 'string' ? JSON.parse(raw) : raw))

		renderTable(items)
		refreshTimes()
	} catch (err) {
		console.error('Polling gagal:', err);
	}
}

async function submitQueue(eventId, booth, name) {
	const base = `queue:${eventId}:${booth}`
	const number = await redis.incr(`${base}:counter`)

	const id = crypto.randomUUID()
	const item = {
		id,
		eventId,
		booth,
		number,
		name,
		status: 'pending',
		createdAt: Date.now()
	}

	await redis.pipeline()
		.set(`${base}:item:${id}`, JSON.stringify(item))
		.sadd(`${base}:active`, id)
		.exec()

	return item
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

$(() => {
	showLoader(true);


	if (curParams.id == '') {
		Swal.fire({
			title: 'Invalid Url',
			text: 'URL tidak valid, silahkan coba lagi',
			icon: 'warning',
			showConfirmButton: false,
			showCancelButton: false,
			allowOutsideClick: false,
		})

		return
	}

	// Memastikan loadConfig selesai sebelum lanjut
	(async () => {
		await loadConfig()

		if (getUrlParameter('event') !== false) {
			curParams.event = getUrlParameter('event')
			curParams.id = curParams.id
		}

		getUniversityDetails(curParams).then((res) => {
			if (res.code !== 200) {
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

			$('#uniName').text(res.body.name)
			$('#uniCountry').text(res.body.country)

			if (res.body.image != null || res.body.image != '') {
				$('#uniImage').attr('src', res.body.image)
			}

			showLoader(false)
		})

		$('#insBtn').on('click', async function () {
			const $curBtn = $(this)
			const studentName = $('#namebox').val()

			$curBtn
				.attr('disabled', true)
				.text('Please Wait')

			if (studentName == '' || studentName.length < 2) {
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

				$curBtn
					.attr('disabled', false)
					.text('Daftar')

				return
			}

			try {
				const response = await submitQueue(curParams.event, curParams.id, studentName)

				Swal.fire({
					title: 'Success!',
					text: 'Silahkan tunggu nama Anda dipanggil oleh tim kami',
					icon: 'success',
					showConfirmButton: true,
					confirmButtonText: 'Tutup',
					showCancelButton: false
				})

				console.log(response)

				$('#namebox').val(null)

				$curBtn
					.attr('disabled', false)
					.text('Daftar')

			} catch (err) {
				console.log(err)
			}

		})

		startPolling()
		clearInterval(pollTimer)
		pollTimer = setInterval(startPolling, POLL_INTERVAL_MS)
	})();
});

