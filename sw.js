// RAPID Stock · service worker: membuat aplikasi bisa dipasang di HP dan terbuka cepat.
// Data stok SELALU diambil langsung dari server Apps Script; yang disimpan di HP hanya tampilan aplikasi.
const VERSI = 'rapid-stock-v1.2-1';   // naikkan angka terakhir bila ingin semua HP langsung memakai tampilan terbaru
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon-32.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;            // server Apps Script, Google Fonts, pustaka QR & wajah: tidak disentuh
  if (r.mode === 'navigate') {                                                // halaman: selalu versi terbaru dari GitHub, cadangan bila sinyal putus
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(VERSI).then(x => x.put('./index.html', c)); return res; })
      .catch(() => caches.match('./index.html').then(x => x || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {      // ikon & manifest: dari HP dulu, lalu internet
    if (res.ok) { const c = res.clone(); caches.open(VERSI).then(x => x.put(r, c)); }
    return res;
  })));
});
