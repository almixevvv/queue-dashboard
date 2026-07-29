import { getMessaging, getToken, onMessage } from "firebase/messaging"
import Swal from "sweetalert2"
import { playSound } from "./_function"
import { app } from "./_setup"

/** Firebase Token */
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

/** Request permission by browser */
export async function requestPermission() {
    let permission = Notification.permission

    if ('Notification' in window && permission !== 'granted') {
        await Notification.requestPermission()
    }

    if (permission !== 'granted') {
        Swal.fire({
            title: 'Ijinkan Notifikasi',
            text: 'Silahkan nyalakan notifikasi untuk mengetahui giliran Anda',
            icon: 'warning',
            showConfirmButton: true,
            confirmButtonText: 'Nyalakan',
            showCancelButton: false
        }).then((res) => {
            if (res.isConfirmed) {
                Notification.requestPermission()
            }
        })
    }
}

/** Send Notification ke user */
export async function pushNativeNotification(userName, boothName) {
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
            playSound()

            return
        }
    }

    // Fallback native notification
    if ("Notification" in window && Notification.permission === 'granted') {
        new Notification(title, options)
        playSound()
    }
}