if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('service-worker.js') // ✅ make sure this matches the GitHub-generated path
      .then(registration => {
        // console.log('Service worker registered:', registration);

        // 🔁 Force update check on load (optional)
        registration.update();

        // 🔄 Listen for messages from the service worker
        // navigator.serviceWorker.addEventListener('message', event => {
        //   if (event.data === 'reload') {
        //     window.location.reload();
        //   } else if (event.data === 'no-update') {
        //     alert('You’re already up to date.');
        //   }
        // });

        // ☑️ If user clicks "Update" button, check for new version
        // const updateButton = document.getElementById('update-button');
        // if (updateButton) {
        //   updateButton.addEventListener('click', () => {
        //     if (navigator.serviceWorker.controller) {
        //       navigator.serviceWorker.controller.postMessage('check-for-update');
        //     }
        //   });
        // }

        // 💡 Optional: reload the page when new SW takes over
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      })
      .catch(error => {
        console.error('Service worker registration failed:', error);
      });
  });
}
