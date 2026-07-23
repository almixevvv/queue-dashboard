export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('/firebase-messaging-sw.js')
            .then(() => console.log('SW registered'))
            .catch(err => console.error('SW failed', err));
    }
}
