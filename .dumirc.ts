import { defineConfig } from 'dumi';
const { GenerateSW, InjectManifest } = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const cacheId = 'amelia:static'
const env = process.env.NODE_ENV
const isDev = env === 'development'

console.log("isDev", isDev)

export default defineConfig({
  themeConfig: {
    name: 'Amelia',
    logo: 'https://p6.hellobixin.com/bx-user/f7e094f01c2b489c9fac2e11c4ae6492.jpeg',
    footer: `Open-source MIT Licensed | Copyright © 2023-present
    <br />
    Powered by Amelia`,
  },
  styles: [`.markdown blockquote { color:  #a0a1a7; }`],
  headScripts: isDev ? [] : ['/register.js'],
  manifest: {
    fileName: 'asset-manifest.json',
  },
  chainWebpack: (config: any) => {
    /**
     * 在这个示例中，我们同时添加了InjectManifest和GenerateSW插件。GenerateSW插件用于自动生成Service Worker文件，并配置了缓存策略；InjectManifest插件则将手写的Service Worker文件注入到应用程序中，从而使Webpack打包的清单能够被正确地注入到Service Worker文件中。
     * 另外需要注意的是，在同时使用GenerateSW和InjectManifest插件时，你需要将自己编写的Service Worker文件命名为sw.js，并将GenerateSW插件生成的Service Worker文件命名为service-worker.js。这样可以避免两个插件生成的文件发生冲突。
     */
    config.plugin('InjectManifest').use(InjectManifest, [
      {
        swSrc: './scripts/sw.js',
        swDest: 'sw.js'
      },
    ]);

    config.plugin('GenerateSW').use(GenerateSW, [{
      cacheId,
      importScripts: ['https://g.yppstatic.com/workbox/4.3.1/workbox-sw.js'],
      skipWaiting: true, //跳过waiting状态
      clientsClaim: true, //通知让新的sw立即在页面上取得控制权
      cleanupOutdatedCaches: true, //删除过时、老版本的缓存
      //最终生成的service worker地址，这个地址和webpack的output地址有关
      swDest: './service-worker.js',
      //缓存规则，可用正则匹配请求，进行缓存
      //这里将js、css、还有图片资源分开缓存，可以区分缓存时间(虽然这里没做区分。。)
      //由于种子农场此站点较长时间不更新，所以缓存时间可以稍微长一些
      runtimeCaching: [
        {
          urlPattern: /\.js$/,
          handler: 'CacheFirst',
          options: {
            cacheName: `${cacheId}:js`,
            expiration: {
              maxEntries: 20, //最多缓存20个，超过的按照LRU原则删除
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            },
          },
        },
        {
          urlPattern: /\.css$/,
          handler: 'CacheFirst',
          options: {
            cacheName: `${cacheId}:css`,
            expiration: {
              maxEntries: 30, //最多缓存30个，超过的按照LRU原则删除
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            },
          },
        },
        {
          urlPattern: /.*(png|svga).*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'seed-image',
            expiration: {
              maxEntries: 30, //最多缓存30个，超过的按照LRU原则删除
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            },
          },
        },
      ],
    }])

    config.plugin('copy-webpack-plugin').use(CopyWebpackPlugin, [
      {
        patterns: [
          { from: 'scripts/register.js', to: './' },
        ],
      }
    ]);
  },
});
