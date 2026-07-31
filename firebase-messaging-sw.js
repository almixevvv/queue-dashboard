importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyBDZfdt9SmJ083cFo6pMkzknAuaosU1I9E",
    authDomain: "ticket-expo.firebaseapp.com",
    databaseURL: "https://ticket-expo-default-rtdb.firebaseio.com",
    projectId: "ticket-expo",
    storageBucket: "ticket-expo.firebasestorage.app",
    messagingSenderId: "649813844821",
    appId: "1:649813844821:web:c86b43f9204ce98d6a45dc"
});

const messaging = firebase.messaging();

// Ini yang jalan kalau tab tertutup/background
messaging.onBackgroundMessage((payload) => {
    const { title, body } = payload.notification || {}
    self.registration.showNotification(title || "Giliran Anda", {
        body: body || "Silakan menuju booth sekarang",
        icon: "assets/img/icaneducation.png" // opsional, siapkan icon kecil
    })
})

// Local notification
self.addEventListener('push', (event) => {
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { body: event.data.text() };
        }
    }

    const title = data.title || "Tes Notifikasi Native";

    const options = {
        body: data.body || "Berhasil memicu event push!",
        icon: "assets/img/icaneducation.png"
    }

    event.waitUntil(
        self.registration.showNotification(title, options)
    )
})