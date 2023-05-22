import { defineConfig } from 'dumi';
import path from 'path'

export default defineConfig({
  chainWebpack: (config: any) => {
    config.optimization.splitChunks({
      chunks: "all",//initial同步，async异步，all同步或者异步
      automaticNameDelimiter: "-",//打包文件名默认连接符号
      cacheGroups: {
        nodesInitial: {
          name: "chunk-nodesInitial",
          test: /[\/]node_modules[\/]/,
          priority: 10,
          minChunks: 1,
          chunks: "initial",//仅打包同步引用的依赖
          reuseExistingChunk: true
        },
        nodesAsync: {
          name: "chunk-nodesAsync",
          test: /[\/]node_modules[\/]/,
          priority: 9,
          minChunks: 1,
          chunks: "async",//仅打包异步引用的依赖
          reuseExistingChunk: true
        }
      }
    })
  },
  themeConfig: {
    name: 'Amelia',
    logo: 'https://p6.hellobixin.com/bx-user/f7e094f01c2b489c9fac2e11c4ae6492.jpeg',
    footer: `Open-source MIT Licensed | Copyright © 2023-present
    <br />
    Powered by Amelia`,
  },
  styles: [`.markdown blockquote { color:  #a0a1a7; }`],
});


