import { collection, doc, onSnapshot, orderBy, query } from "firebase/firestore"
import { db } from "./_setup"
import { pushNativeNotification } from "./_notifications"
import { removeQueueFromStorage } from "./_function"


function escapeHtml(str) {
    const div = document.createElement('div')
    div.textContent = str

    return div.innerHTML
}

function timeAgo(ts) {
    const diffSec = Math.floor((Date.now() - ts) / 1000);
    if (diffSec < 60) return `${diffSec} detik lalu`

    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin} menit lalu`

    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour} jam lalu`

    const diffDay = Math.floor(diffHour / 24)
    return `${diffDay} hari lalu`;
}

/** Render Table UI */
function renderTable(data) {
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

        case 'called':
            statObj.class = 'badge bg-warning'
            statObj.text = 'Go to Booth'
            break

        case 'consulting':
            statObj.class = 'badge bg-info'
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

/** Listener Booth kalau ada yang ngantri lagi */
export function boothListener(curPath) {
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
}

const activeListener = {}

export function listenToSingleQueue(queuePath, queueId) {
    // Hapus kalau ada listener yang udah jalan
    if (activeListener[queueId]) return

    const queueRef = doc(db, queuePath)

    const unsubscribe = onSnapshot(queueRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data()

            if (data.status === 'called') {
                pushNativeNotification(data.name, data.boothName || "Booth")
                // cleanQueue(queueId)
            }
        }
    })

    activeListener[queueId] = unsubscribe
}

export function cleanQueue(queueId) {
    if (activeListener[queueId]) {
        activeListener[queueId]() // Unsubscribe Firebase
        delete activeListener[queueId] // Hapus dari memory
        removeQueueFromStorage(queueId)

        console.log('[CLEAN UP] Listener untuk Queue ID mati', queueId)
    }
}