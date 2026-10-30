const CACHE_NAME = 'monstiez-universe-shell-v3';
const FILES = ['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./assets/myangni.svg','./assets/myangni-happy.svg','./assets/myangni-sleepy.svg','./assets/myangni-excited.svg','./assets/myangni-love.svg','./assets/myangni-peek.svg','./assets/app-icon.svg','./js/util.js','./js/data/store.js','./js/ui/charts.js','./js/ui/tracker.js','./js/ui/detail.js','./js/ui/views.js','./data/catalog.json','./data/series/youtube.json','./data/series/spotify.json','./data/feed-status.json'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  const isData=url.pathname.includes('/data/');
  if(isData){
    // Network-first so fresh snapshots arrive when online; fall back to the last cached copy offline.
    event.respondWith(fetch(event.request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}
      return response;
    }).catch(()=>caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}
    return response;
  }).catch(()=>caches.match('./index.html'))));
});
