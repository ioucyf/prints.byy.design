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

const version = document.getElementById('version');
const url = "https://api.github.com/repos/ioucyf/prints.byy.design/commits/main";

fetch(url)
  .then(response => response.json())
  .then(data => {
    // console.log("Latest commit SHA:", data.sha);
    version.textContent = data.sha;
  })
  .catch(error => console.error("Error fetching commit:", error));

const loadImage = (inputId, imgId) => {
  const input = document.getElementById(inputId);
  const img = document.getElementById(imgId);
  const placeholder = img.previousElementSibling;
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      img.src = url;
      img.style.display = 'block';
      if (placeholder) placeholder.remove();
    }
  });
};

function resetImages() {
  ['frontCard', 'backCard'].forEach(id => {
    const img = document.getElementById(id);
    img.src = '';
    img.style.display = 'none';
    if (!img.previousElementSibling) {
      const p = document.createElement('p');
      p.className = 'placeholder';
      p.textContent = id.includes('front') ? 'Tap to upload front' : 'Tap to upload back';
      img.parentNode.insertBefore(p, img);
    }
  });
}

loadImage('frontInput', 'frontCard');
loadImage('backInput', 'backCard');
