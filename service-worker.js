const CACHE_NAME = 'monstiez-universe-shell-v4';
const FILES = ['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./assets/myangni.svg','./assets/myangni-happy.svg','./assets/myangni-sleepy.svg','./assets/myangni-excited.svg','./assets/myangni-love.svg','./assets/myangni-peek.svg','./assets/app-icon.svg','./js/util.js','./js/data/store.js','./js/ui/charts.js','./js/ui/tracker.js','./js/ui/detail.js','./js/ui/views.js','./data/catalog.json','./data/series/youtube.json','./data/series/spotify.json','./data/feed-status.json'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>
    // cache:'reload' — never let the HTTP cache poison the precache with a stale CDN copy.
    Promise.all(FILES.map(f=>cache.add(new Request(f,{cache:'reload'}))))
  ).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{ if(e.data==='skip-waiting') self.skipWaiting(); });

self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  const isData=url.pathname.includes('/data/');
  if(isData){
    // Network-first: fresh snapshots when online; last cached copy offline.
    event.respondWith(fetch(event.request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}
      return response;
    }).catch(()=>caches.match(event.request)));
    return;
  }
  // Stale-while-revalidate for the app shell: instant from cache, silently self-heals
  // in the background so a stale shell can never survive longer than one visit.
  event.respondWith(caches.open(CACHE_NAME).then(async cache=>{
    const cached = await cache.match(event.request);
    const refresh = fetch(event.request).then(response=>{
      if(response.ok) cache.put(event.request, response.clone());
      return response;
    }).catch(()=>null);
    return cached || refresh.then(r=>r || caches.match('./index.html'));
  }));
});
