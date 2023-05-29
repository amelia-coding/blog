---
group:
  title: 基础
order: 1
toc: content
---

# 网络基础

## HTTP 演进

HTTP1.0

- 无状态、无连接

HTTP1.1

- 持久连接
- 请求管道化：浏览器并未采用，而是通过同一个域名下开启 6（一般）个 TCP 实现并发
- 增加缓存处理（新的字段如 cache-control）
- 增加 Host 字段、支持断点传输等
- Transfer-Encoding: chunked

HTTP2

- 二进制分帧
- 多路复用（或连接共享），流的取消，优先级
- 头部压缩：gzip 和发送索引
- 服务器推送

HTTP3

- 基于 UDP 链接 QUIC
- 0RTT 的建立时间
- 加密认证的报头，所有报文头部都是经过认证的，报文 Body 都是经过加密的。
- 前向纠错：向前纠错牺牲了每个数据包可以发送数据的上限，但是减少了因为丢包导致的数据重传

## HTTPS

[HTTPS：让数据传输更安全](https://time.geekbang.org/column/article/156181)

缺点

- 页面加载耗时延长 50%左右
- HTTPS 涉及到的安全算法会消耗 CPU 资源，需要增加服务器资源
- ssl 证书并不是完全安全，根证书是可以被控制的

## TCP/UDP

传输层：提供端到端的通信

https://mp.weixin.qq.com/s/KxmSGxTAYe9eiEEVcLkJZg

TCP

- 面向连接、可靠的传输

UDP

- 无连接、不可靠的传输

RTT

请求响应的往返时间 round trip time

- 三次握手建立 TCP 连接。耗时一个 RTT。连接复用可以减少一个 RTT
- TLS 完全握手阶段一。耗时至少一个 RTT。这个阶段主要是完成加密套件的协商和证书的身份认证。
- 完全握手阶段二，耗时一个 RTT 及计算时间。
