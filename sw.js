/* Aboseada PRO service worker: يفتح فورًا من الكاش ويتحدّث في الخلفية */
const V = 'abo-v105';
const LIBS = /^https:\/\/(www\.gstatic\.com\/firebasejs|cdnjs\.cloudflare\.com\/ajax\/libs|fonts\.(googleapis|gstatic)\.com)\//;
self.addEventListener('install', e=>{ self.skipWaiting(); });
self.addEventListener('activate', e=>{ e.waitUntil((async()=>{ for(const k of await caches.keys()) if(k!==V) await caches.delete(k); await self.clients.claim(); })()); });
self.addEventListener('fetch', e=>{
  const r = e.request; if(r.method!=='GET') return;
  const u = new URL(r.url);
  if(u.hostname.endsWith('firestore.googleapis.com') || u.hostname.endsWith('googleapis.com') && !LIBS.test(r.url) || u.hostname.endsWith('firebaseio.com')) return; /* بيانات حيّة: لا كاش */
  if(LIBS.test(r.url)){ /* مكتبات بنسخة ثابتة: كاش أولًا */
    e.respondWith(caches.open(V).then(async c=>{ const hit = await c.match(r); if(hit) return hit; const res = await fetch(r); if(res.ok) c.put(r, res.clone()); return res; }));
    return;
  }
  if(u.origin===location.origin){ /* صفحة البرنامج: من الكاش فورًا + تحديث بالخلفية */
    e.respondWith(caches.open(V).then(async c=>{
      const hit = await c.match(r, {ignoreSearch:true});
      const net = fetch(r).then(res=>{ if(res.ok) c.put(r, res.clone()); return res; }).catch(()=>hit);
      return hit || net;
    }));
  }
});
