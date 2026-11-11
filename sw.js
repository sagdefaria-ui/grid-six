// Grid Six — service worker: cache do app (abre com sinal ruim) + notificações push
var CACHE = 'gridsix-v2';
var SHELL = ['./', './index.html'];
var LIB_HOSTS = ['cdnjs.cloudflare.com', 'unpkg.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(SHELL); }).catch(function() {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

function cacheable(res) { return res && (res.ok || res.type === 'opaque'); }
function store(req, res) {
  if (cacheable(res)) {
    var copy = res.clone();
    caches.open(CACHE).then(function(c) { c.put(req, copy); }).catch(function() {});
  }
  return res;
}

// App (index.html): sempre tenta a rede primeiro pra pegar a versão nova; se a rede
// falhar ou demorar mais de 4 s, abre a última versão guardada.
function networkFirst(req) {
  return new Promise(function(resolve, reject) {
    var settled = false;
    var timer = setTimeout(function() {
      caches.match(req).then(function(hit) { if (hit && !settled) { settled = true; resolve(hit); } });
    }, 4000);
    fetch(req).then(function(res) {
      clearTimeout(timer);
      store(req, res);
      if (!settled) { settled = true; resolve(res); }
    }).catch(function(err) {
      clearTimeout(timer);
      if (settled) return;
      caches.match(req).then(function(hit) {
        settled = true;
        if (hit) resolve(hit); else reject(err);
      });
    });
  });
}

// Bibliotecas e fontes: responde do cache na hora e atualiza em segundo plano.
function staleWhileRevalidate(req) {
  return caches.match(req).then(function(hit) {
    var fresh = fetch(req).then(function(res) { return store(req, res); });
    if (hit) { fresh.catch(function() {}); return hit; }
    return fresh;
  });
}

self.addEventListener('fetch', function(event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate' || /\/(index\.html)?$/.test(url.pathname)) event.respondWith(networkFirst(req));
    return;
  }
  if (LIB_HOSTS.indexOf(url.hostname) > -1) event.respondWith(staleWhileRevalidate(req));
  // Supabase, mapas e todo o resto seguem direto pela rede, sem cache.
});

self.addEventListener('push', function(event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}
  var title = data.title || 'Grid Six';
  var options = {
    body: data.body || 'Você tem uma novidade na party.',
    icon: undefined,
    badge: undefined,
    data: { url: data.url || './' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if ('focus' in list[i]) return list[i].focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
