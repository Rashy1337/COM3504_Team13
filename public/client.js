// client.js
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
            console.log('SW registered: ', registration.scope);
        }, (registrationError) => {
            console.log('SW registration failed: ', registrationError);
        });
}
