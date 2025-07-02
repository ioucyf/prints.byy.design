if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // navigator.serviceWorker.register('service-worker.js');
    navigator.serviceWorker.register('/service-worker.js');

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data === 'reload') {
        location.reload();
      } else if (event.data === 'no-update') {
        alert('You’re already up to date.');
      }
    });

    document.getElementById('update-button').addEventListener('click', () => {
      navigator.serviceWorker.controller?.postMessage('check-for-update');
    });

  });
}

export { };