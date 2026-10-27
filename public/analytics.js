// Existing analytics/essential choice, with effective runtime refusal before persistence.
(() => {
  const key = 'plaza-piura-cookie-consent';
  const vetoKey = key + '-session-denied';
  const id = 'G-HXM22WWPKP';
  const panel = document.getElementById('cookie-banner');
  const status = document.getElementById('consent-status');
  let loaded = false;
  let deniedHere = false;
  const read = (storageName, name) => { try { return window[storageName].getItem(name); } catch { return undefined; } };
  const say = (message) => { if (status) status.textContent = message; };
  const stop = () => {
    window['ga-disable-' + id] = true;
    if (loaded && window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied' });
  };
  const start = () => {
    window['ga-disable-' + id] = false;
    if (loaded) {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
      return;
    }
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(script);
  };
  const sharedWrite = (value) => {
    try { window.localStorage.setItem(key, value); return window.localStorage.getItem(key) === value; }
    catch { return false; }
  };
  const revokeShared = () => {
    if (sharedWrite('essential')) return 'denied';
    try {
      window.localStorage.removeItem(key);
      return window.localStorage.getItem(key) === null ? 'removed' : false;
    } catch { return false; }
  };
  const veto = () => {
    try { window.sessionStorage.setItem(vetoKey, 'yes'); return window.sessionStorage.getItem(vetoKey) === 'yes'; }
    catch { return false; }
  };
  const clearVeto = () => {
    try { window.sessionStorage.removeItem(vetoKey); return window.sessionStorage.getItem(vetoKey) === null; }
    catch { return false; }
  };
  const refuse = () => {
    deniedHere = true;
    stop();
    const sessionOff = veto();
    const saved = revokeShared();
    say(saved === 'denied' ? 'Rechazo guardado. La medición adicional de esta página está desactivada; no se recupera información ya enviada.'
      : saved === 'removed' ? 'Se confirmó la retirada del permiso compartido. La medición adicional de esta página está desactivada; al volver puede pedirse la elección. No se recupera lo ya enviado.'
      : sessionOff ? 'No se pudo guardar el rechazo. Analytics está desactivado en esta página y en la sesión de esta pestaña; un permiso anterior puede seguir activo en otras pestañas o sesiones.'
      : 'No se pudo guardar el rechazo. Analytics está desactivado en esta página; al volver o en otra pestaña un permiso anterior puede seguir activo.');
    return saved;
  };
  const allow = () => {
    stop();
    // Verify the session veto is cleared before publishing a shared grant.
    if (!clearVeto() || !sharedWrite('analytics')) {
      deniedHere = true;
      const sessionOff = veto();
      const sharedOff = revokeShared();
      say(sharedOff ? 'No se guardó el permiso. Analytics está desactivado en esta página y se confirmó que no queda un permiso compartido. Al volver puede pedirse la elección.'
        : sessionOff ? 'No se confirmó el permiso. Analytics está desactivado en esta página y pestaña; un permiso de este intento o anterior puede seguir activo en otras pestañas o sesiones.'
        : 'No se confirmó el permiso. Analytics está desactivado en esta página; un permiso de este intento o anterior puede seguir activo al volver o en otra pestaña.');
      return false;
    }
    deniedHere = false;
    start();
    say('Permiso guardado. Google Analytics puede cargarse ahora. Puedes retirarlo desde estos mismos ajustes.');
    return true;
  };
  stop();
  const stored = read('localStorage', key);
  const blocked = read('sessionStorage', vetoKey);
  if (stored === 'analytics' && blocked === null) start();
  else if (stored !== 'essential' && panel) panel.classList.remove('hidden');
  const open = () => { if (panel) panel.classList.remove('hidden'); };
  document.getElementById('open-cookie-settings')?.addEventListener('click', open);
  document.getElementById('accept-cookies')?.addEventListener('click', allow);
  document.getElementById('reject-cookies')?.addEventListener('click', refuse);
  document.getElementById('close-cookie-settings')?.addEventListener('click', () => panel?.classList.add('hidden'));
  window.addEventListener('storage', (event) => {
    if (event.key !== key && event.key !== null) return;
    // A remote denial is latched here; remote grants never restart measurement.
    if (read('localStorage', key) !== 'analytics') {
      deniedHere = true;
      stop();
      veto();
      say('Analytics está desactivado en esta página tras una elección de otra pestaña.');
    } else if (deniedHere) stop();
  });
  if ('serviceWorker' in navigator && location.protocol === 'https:' && location.hostname === 'piuraplazadearmas.com') {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
})();
