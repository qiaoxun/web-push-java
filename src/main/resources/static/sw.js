/**
 * service worker 安装激活
 */

let dataCacheName = 'new-data-v1'
let cacheName = 'first-pwa-app-1'
let filesToCache = [
  '/',
  '/index.html',
  '/style/index.css',
  '/style/fonts/iconfont.css',
  '/style/fonts/iconfont.eot',
  '/style/fonts/iconfont.js',
  '/style/fonts/iconfont.svg',
  '/style/fonts/iconfont.ttf',
  '/style/fonts/iconfont.woff',
  '/assets/images/icons/icon_144x144.png',
  '/assets/images/icons/icon_152x152.png',
  '/assets/images/icons/icon_192x192.png',
  '/assets/images/icons/icon_512x512.png'
]

self.addEventListener('install', function (e) {
  console.log('SW Install')
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      console.log('SW precaching')
      return cache.addAll(filesToCache)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', function (e) {
  console.log('SW Activate')
  e.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('SW Removing old cache', key)
          return caches.delete(key)
        }
      }))
    })
  )
  return self.clients.claim()
})

// 监听 push 事件
self.addEventListener('push', function (e) {
  console.log('push event', e)
  if (!e.data) {
    return
  }
  // 解析获取推送消息
  let payload = e.data.json()

  // const { image, tag, url, title, text } = event.data.json();

  // const options = {
  //   data: url,
  //   body: text,
  //   icon: image,
  //   vibrate: [200, 100, 200],
  //   tag: tag,
  //   image: image,
  //   badge: "https://spyna.it/icons/favicon.ico",
  //   actions: [{ action: "Detail", title: "View", icon: "https://via.placeholder.com/128/ff0000" }]
  // };
  // event.waitUntil(self.registration.showNotification(title, options));

  // 根据推送消息生成桌面通知并展现出来
  let promise = self.registration.showNotification(payload.title, {
    body: payload.text,
    // icon: image,
    vibrate: [200, 100, 200],
    // tag: tag,
    badge: "https://spyna.it/icons/favicon.ico",
    data: payload.url,
    actions: [{ action: "Detail", title: "View", icon: "https://via.placeholder.com/128/ff0000" }]
  })
  e.waitUntil(promise)
})

// 监听通知点击事件
self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click Received.', event)
  // 关闭窗口
  event.notification.close()
  // 打开网页
  event.waitUntil(self.clients.openWindow(event.notification.data))
})
