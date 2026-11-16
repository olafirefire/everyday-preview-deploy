(()=>{'use strict';
const API='https://everyday-notifications-pilot.onrender.com';
const KEY='everyday-push-device-v1';
let connected=false,syncing=false;
function msg(s){window.dispatchEvent(new CustomEvent('everyday:push-status',{detail:{message:s,connected}}))}
function decode(s){const raw=atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4));return Uint8Array.from(raw,c=>c.charCodeAt(0))}
function credentials(){let v;try{v=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}if(v?.id&&v?.token)return v;const secret=crypto.getRandomValues(new Uint8Array(32));v={id:crypto.randomUUID(),token:btoa(String.fromCharCode(...secret)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'')};localStorage.setItem(KEY,JSON.stringify(v));return v}
async function call(route,data=null,needsAuth=false){const headers={'content-type':'application/json'};if(needsAuth){const c=credentials();headers['x-device-id']=c.id;headers['x-device-token']=c.token}
 const r=await fetch(API+route,{method:data===null?'GET':'POST',headers,body:data===null?undefined:JSON.stringify(data),signal:AbortSignal.timeout(40000),cache:'no-store'});
 const b=await r.json().catch(()=>({}));if(!r.ok)throw Error(b.error||'Notification service unavailable');return b}
async function syncAll(){if(!connected||syncing||!navigator.onLine)return false;syncing=true;try{
 const get=window.everydayPushRecords;if(typeof get!=='function')return false;
 for(const x of get()){const future=(x.alerts||[]).filter(t=>Date.parse(t)>Date.now()+30000).slice(0,6);await call('/api/jobs',{itemId:x.id,alerts:x.status==='active'?future:[]},true)}
 localStorage.removeItem('everyday-push-pending');msg('Reminders synchronized');return true;
 }catch(e){localStorage.setItem('everyday-push-pending','1');msg('Saved locally; reminders will sync when online');console.warn('Push sync pending',e.message);return false}finally{syncing=false}}
async function enable(){if(!('PushManager' in window)||!('serviceWorker' in navigator)||!('Notification' in window)){msg('This browser does not support background push.');return false}
 try{
 const perm=Notification.permission==='default'?await Notification.requestPermission():Notification.permission;
 if(perm!=='granted'){msg('Phone notifications were not allowed.');return false}
 const reg=await navigator.serviceWorker.ready;
 const key=await call('/api/key');if(!key.publicKey)throw Error('Push service is not yet configured');
 let sub=await reg.pushManager.getSubscription();
 if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:decode(key.publicKey)});
 const c=credentials();await call('/api/device',{id:c.id,token:c.token,subscription:sub.toJSON()});
 connected=true;await syncAll();
 try{await call('/api/test',{},true);msg('Test push requested. Check your phone notifications.')}catch{msg('Connected, but a test notification could not be sent.')}
 return true;
 }catch(e){connected=false;msg('Background push is not available yet. You can still save reminders locally.');console.warn('Everyday background push:',e.message);return false}}
async function restore(){try{
 if(!localStorage.getItem(KEY)||Notification.permission!=='granted'||!('PushManager' in window))return;
 const reg=await navigator.serviceWorker.ready;const sub=await reg.pushManager.getSubscription();if(!sub)return;
 const c=credentials();await call('/api/device',{id:c.id,token:c.token,subscription:sub.toJSON()});connected=true;msg('Background alerts connected');await syncAll()
 }catch(e){connected=false;msg('Background push connection unavailable')}}
window.EverydayPush={enable,syncAll,test:()=>call('/api/test',{},true),get connected(){return connected}};
window.addEventListener('everyday:records-changed',()=>{localStorage.setItem('everyday-push-pending','1');syncAll()});
window.addEventListener('online',()=>{restore().then(syncAll)});
document.addEventListener('DOMContentLoaded',()=>{restore()});
})();
