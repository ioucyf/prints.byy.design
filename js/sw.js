if ('serviceWorker' in navigator) {
  const updateButton = document.getElementById('update-button');
  window.addEventListener('load', () => {
    // navigator.serviceWorker.register('service-worker.js');
    navigator.serviceWorker.register('/service-worker.js');

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data === 'reload') {
        updateButton.classList.add('update');
        // alert('You’re already up to date.');
      } else if (event.data === 'no-update') {
        // location.reload();
      }
    });

    updateButton.addEventListener('click', () => {
      navigator.serviceWorker.controller?.postMessage('check-for-update');
    });

  });
}

export { };