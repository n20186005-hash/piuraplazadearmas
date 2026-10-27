const VERSION = 'plaza-piura-2026-10-26';
const SHELL = VERSION + '-shell';
const ASSETS = VERSION + '-assets';
const PRECACHE = ['/', '/site.webmanifest', '/icons/icon.svg', '/favicon.svg'];
self.addEventListener('install', event => event.waitUntil(caches.open(SHELL).then(cache=>cache.addAll(PRECACHE)).then(()=>self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('plaza-piura-')&&!key.startsWith(VERSION)).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin) return;
  if(request.mode==='navigate') {
    event.respondWith((async()=>{
      try {
        const response = await fetch(request);
        if(response.status===200 && response.headers.get('Content-Type')?.includes('text/html') && !response.headers.get('X-Robots-Tag')?.includes('noindex')) {
          const cache = await caches.open(SHELL);
          await cache.put(request,response.clone());
        }
        return response;
      } catch {
        const cached = await caches.match(request);
        return cached || new Response('Sin conexión: esta página no está guardada. Vuelve a intentarlo con internet.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
      }
    })());
    return;
  }
  if (!/\.(?:css|js|svg|png|jpg|jpeg|webmanifest|txt)$/.test(url.pathname)) return;
  event.respondWith((async()=>{
    try {
      // Network first avoids holding old settings scripts indefinitely.
      const response = await fetch(request);
      if(response.status===200) { const cache = await caches.open(ASSETS); await cache.put(request,response.clone()); }
      return response;
    } catch {
      return await caches.match(request) || new Response(null,{status:503,headers:{'Cache-Control':'no-store'}});
    }
  })());
});
