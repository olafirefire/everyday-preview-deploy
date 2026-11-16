const CACHE='everyday-prototype-v1-6';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith(fetch(e.request).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return res}).catch(()=>caches.match(e.request).then(m=>m||caches.match('./index.html'))))});
self.addEventListener('notificationclick',event=>{
 event.notification.close();const id=event.notification.data?.id||'';
 const url=new URL('./',self.registration.scope);
 if(id)url.searchParams.set(event.action==='snooze'?'snooze':event.action==='done'?'done':'reminder',id);
 event.waitUntil((async()=>{const cs=await clients.matchAll({type:'window',includeUncontrolled:true});const visible=cs.find(c=>c.url.startsWith(self.registration.scope));if(visible&&visible.navigate){await visible.navigate(url.href);return visible.focus()}return clients.openWindow(url.href)})());
});
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{}}catch{}
 const id=typeof data.id==='string'&&/^[a-f0-9-]{36}$/i.test(data.id)?data.id:'';
 event.waitUntil(self.registration.showNotification('Everyday reminder',{
  body:'Something you saved needs your attention.',icon:'./icon.svg',badge:'./icon.svg',tag:'everyday-push-'+id,
  data:{id},actions:[{action:'open',title:'Open'},{action:'snooze',title:'10-min snooze'},{action:'done',title:'Done'}]
 }));
});
