// Register the service worker without showing any analytics or cookie popup.
(() => {
  if ('serviceWorker' in navigator && location.protocol === 'https:' && location.hostname === 'piuraplazadearmas.com') {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
})();
