importScripts('https://g.yppstatic.com/workbox/4.3.1/workbox-sw.js');

// 定义需要预加载的资源
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

// 异常处理
self.onerror = function () {
  caches.delete('blog:html');
  caches.delete('blog:static');
};

workbox.setConfig({ debug: false });
workbox.core.skipWaiting();
workbox.core.clientsClaim();
