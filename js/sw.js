if ('serviceWorker' in navigator) {
  const updateButton = document.getElementById('update-button');
  window.addEventListener('load', () => {
    // navigator.serviceWorker.register('service-worker.js');
    navigator.serviceWorker.register('/service-worker.js');

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data === 'reload') {
        location.reload();
        // updateButton.classList.add('update');
      } else if (event.data === 'no-update') {
        alert('You’re already up to date.');
      }
    });

    updateButton.addEventListener('click', () => {
      navigator.serviceWorker.controller?.postMessage('check-for-update');
    });

  });
}

export default {};