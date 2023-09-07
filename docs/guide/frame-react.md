---
group:
  title: 框架
order: 1
---

# React 框架原理

### 前言

这篇文章循序渐进地介绍实现以下几个概念，遵循本篇文章基本就能搞懂为啥需要 fiber，为啥需要 commit 和 phases、reconciliation 阶段等原理。本篇文章又不完全和原文一致，这里会加入我自己的一些思考，比如经过`performUnitOfWork`处理后 fiber tree 和 element tree 的联系等。

- createElement 函数
- render 函数
- Concurrent Mode
- Fibers
- Render and Commit Phases
- Reconciliation
- Function Components
- Hooks

如果对 React 相关概念已经很熟悉了，可以跳到最后一章直接看源码

### [](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Flizuncong%2Fmini-react%2Fblob%2Fmaster%2Fdocs%2F%25E8%25AF%2591%25E6%2596%2587%2Fbuild_your_own_react.md%23%25E7%25AC%25AC%25E4%25B8%2580%25E7%25AB%25A0-%25E5%259F%25BA%25E6%259C%25AC%25E6%25A6%2582%25E5%25BF%25B5 'https://github.com/lizuncong/mini-react/blob/master/docs/%E8%AF%91%E6%96%87/build_your_own_react.md#%E7%AC%AC%E4%B8%80%E7%AB%A0-%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5')第一章 基本概念

以下面代码为例

```
arduino
复制代码
// 1.jsx语法不是合法的js语法
// const element = <h1 title="foo">Hello</h1>
// 2.经babel等编译工具将jsx转换成js，将jsx转换成createElement函数调用的方式
// const element = React.createElement(
//   "h1",
//   { title: "foo" },
//   "Hello"
// )
// 3.React.createElement返回的最终对象大致如下：
const element = {
  type: "h1",
  props: {
    title: "foo",
    children: "Hello",
  },
}
const container = document.getElementById("root")
// ReactDOM.render(element, container)
// 4.替换ReactDOM.render函数的逻辑，ReactDOM.render大致处理逻辑：
const node = document.createElement(element.type)
node['title'] = element.props.title
const text = document.createTextNode("")
text["nodeValue"] = element.props.children
node.appendChild(text)
container.appendChild(node)
```

为了避免歧义，这里使用 `element` 表示 `React elements`，`node` 表示真实的 DOM 元素节点。

至此，这段代码无需经过任何编译已经能够在浏览器上跑起来了，不信你可以复制到浏览器控制台试试

这里有几点需要注意：

- 先通过`node.appendChild(text)`将子元素添加到父元素，然后再通过`container.appendChild(node)`将父元素添加到容器`container`中触发浏览器渲染页面。这个顺序不能反过来，也就是说只有整个真实 dom 树构建完成才能添加到容器中。假设这个顺序反过来，比如先执行`container.appendChild(node)`，则触发浏览器回流。再执行`node.appendChild(text)`又触发浏览器回流。性能极差
- `React.createElement`返回的最终的对象就是`virtual dom`树，`ReactDOM.render`根据这个`virtual dom`创建真实的 dom 树

### [](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Flizuncong%2Fmini-react%2Fblob%2Fmaster%2Fdocs%2F%25E8%25AF%2591%25E6%2596%2587%2Fbuild_your_own_react.md%23%25E7%25AC%25AC%25E4%25BA%258C%25E7%25AB%25A0-createelement-%25E5%2587%25BD%25E6%2595%25B0 'https://github.com/lizuncong/mini-react/blob/master/docs/%E8%AF%91%E6%96%87/build_your_own_react.md#%E7%AC%AC%E4%BA%8C%E7%AB%A0-createelement-%E5%87%BD%E6%95%B0')第二章 createElement 函数

以下面的代码为例

`React.createElement`接收的 children 有可能是原子值，比如字符串或者数字等，`React.createElement('h1', {title: 'foo'}, 'Hello')`。为了简化我们的代码，创建一个特殊的`TEXT_ELEMENT` 类型将其转换成对象

```
typescript
复制代码
React.createElement = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => {
        if(typeof child === 'object'){
          return child
        }
        return {
          type: 'TEXT_ELEMENT',
          props: {
            nodeValue: child,
            children: [],
          }
        }
      })
    }
  }
}
// const element = (
//   <div id="foo">
//     <a>bar</a>
//     <b />
//   </div>
// )
// 将jsx转换成js语法
const element = React.createElement(
  "div",
  { id: "foo" },
  React.createElement("a", null, "bar"),
  React.createElement("b")
)
const container = document.getElementById("root")
ReactDOM.render(element, container)
```

好了，现在我们已经实现了一个简单的`createElement`函数，我们可以通过一段**特殊的注释**来告诉 babel 在将 jsx 转换成 js 时使用我们自己的`createElement`函数：

```
typescript
复制代码
const MiniReact = {
  createElement:  (type, props, ...children) => {
    return {
      type,
      props: {
        ...props,
        children: children.map(child => {
          if(typeof child === 'object'){
            return child
          }
          return {
            type: 'TEXT_ELEMENT',
            props: {
              nodeValue: child,
              children: [],
            }
          }
        })
      }
    }
  }
}
/** @jsx MiniReact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)
console.log('element======', element)
const container = document.getElementById("root")
ReactDOM.render(element, container)
```

### [](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Flizuncong%2Fmini-react%2Fblob%2Fmaster%2Fdocs%2F%25E8%25AF%2591%25E6%2596%2587%2Fbuild_your_own_react.md%23%25E7%25AC%25AC%25E4%25B8%2589%25E7%25AB%25A0-render%25E5%2587%25BD%25E6%2595%25B0 'https://github.com/lizuncong/mini-react/blob/master/docs/%E8%AF%91%E6%96%87/build_your_own_react.md#%E7%AC%AC%E4%B8%89%E7%AB%A0-render%E5%87%BD%E6%95%B0')第三章 render 函数

```
typescript
复制代码
import React from 'react';

function render(element, container) {
  const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(element.type)

  const isProperty = key => key !== 'children'
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = element.props[name]
    })

  element.props.children.forEach(child => {
    render(child, dom)
  });

  container.appendChild(dom)
}
const MiniReact = {
  createElement:  (type, props, ...children) => {
    return {
      type,
      props: {
        ...props,
        children: children.map(child => {
          if(typeof child === 'object'){
            return child
          }
          return {
            type: 'TEXT_ELEMENT',
            props: {
              nodeValue: child,
              children: [],
            }
          }
        })
      }
    }
  },
  render
}
/** @jsx MiniReact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)
console.log('element======', element)
const container = document.getElementById("root")
MiniReact.render(element, container)
```

`render`函数递归创建真实的 dom 元素，然后将各个元素 append 到其父元素中，最后整个 dom 树 append 到 root container 中，渲染完成，这个过程一旦开始，中间是无法打断的，直到整个应用渲染完成。这也是`React16`版本以前的渲染过程

**注意，只有当整个 dom 树 append 到 root container 中时，页面才会显示**

### [](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Flizuncong%2Fmini-react%2Fblob%2Fmaster%2Fdocs%2F%25E8%25AF%2591%25E6%2596%2587%2Fbuild_your_own_react.md%23%25E7%25AC%25AC%25E5%259B%259B%25E7%25AB%25A0-concurrent-mode 'https://github.com/lizuncong/mini-react/blob/master/docs/%E8%AF%91%E6%96%87/build_your_own_react.md#%E7%AC%AC%E5%9B%9B%E7%AB%A0-concurrent-mode')第四章 Concurrent Mode

在第三章中可以看到，当前版本的`render`函数是递归构建 dom 树，最后才 append 到 root container，最终页面才渲染出来。这里有个问题，如果 dom 节点数量庞大，递归层级过深，这个过程其实是很耗时的，导致`render`函数长时间占用主线程，浏览器无法响应用户输入等事件，造成卡顿的现象。

因此我们需要将`render`过程拆分成小的任务单元，每执行完一个单元，都允许浏览器打断`render`过程并执行高优先级的任务，等浏览器得空再继续执行`render`过程

如果对`requestIdleCallback`不熟悉的，可以自行了解一下。真实 React 代码中并没有使用这个 api，因为有兼容性问题。因此 React 使用`scheduler package`模拟这个调度过程

```
scss
复制代码
let nextUnitOfWork = null
function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(nextUnitOfWork) {
  // TODO
}
```

`performUnitOfWork`接收当前工作单元，并返回下一个工作单元。**工作单元可以理解为就是一个 fiber 对象节点**

`workLoop`循环里会循环调用`performUnitOfWork`，直到所有工作单元都已经处理完毕，或者当前帧浏览器已经没有空闲时间，则循环终止。等下次浏览器空闲时间再接着继续执行

**因此我们需要一种数据结构，能够支持任务打断并且可以接着继续执行，很显然，链表就非常适合**

### [](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Flizuncong%2Fmini-react%2Fblob%2Fmaster%2Fdocs%2F%25E8%25AF%2591%25E6%2596%2587%2Fbuild_your_own_react.md%23%25E7%25AC%25AC%25E4%25BA%2594%25E7%25AB%25A0-fibers 'https://github.com/lizuncong/mini-react/blob/master/docs/%E8%AF%91%E6%96%87/build_your_own_react.md#%E7%AC%AC%E4%BA%94%E7%AB%A0-fibers')第五章 Fibers

Fibers 就是一种数据结构，支持将渲染过程拆分成工作单元，本质上就是一个双向链表。这种数据结构的好处就是方便找到下一个工作单元

Fiber 包含三层含义：

- 作为架构来说，之前`React 15`的`Reconciler`采用递归的方式执行，数据保存在递归调用栈中，所以被称为`stack Reconciler`。`React 16`的`Reconciler`基于`Fiber节点`实现，被称为`Fiber Reconciler`
- 作为静态的数据结构来说，每个`Fiber节点`对应一个`React Element`，保存了该组件的类型(函数组件/类组件/html 标签)、对应的 DOM 节点信息等
- 作为动态的工作单元来说，每个`Fiber节点`保存了本次更新中该组件改变的状态、要执行的工作等

Fiber 的几点冷知识：

- 一个 Fiber 节点对应一个 React Element 节点，同时也是一个工作单元
- 每个 fiber 节点都有指向第一个子元素，下一个兄弟元素，父元素的指针\*\*

以下面代码为例：

```
css
复制代码
MiniReact.render(
  <div>
    <h1>
      <p />
      <a />
    </h1>
    <h2 />
  </div>,
  container
)
```

对应的 fiber tree 如下：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a1a425406ea9473ea53a043932946451~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=736&h=755&s=8934&e=webp&b=202226)

```
javascript
复制代码
import React from 'react';
// 根据fiber节点创建真实的dom节点
function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(fiber.type)

  const isProperty = key => key !== 'children'
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = fiber.props[name]
    })

  return dom
}

let nextUnitOfWork = null
// render函数主要逻辑：
//   根据root container容器创建root fiber
//   将nextUnitOfWork指针指向root fiber
//   element是react element tree
function render(element, container){
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element], // 此时的element还只是React.createElement函数创建的virtual dom树
    },
  }
}

function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

// performUnitOfWork函数主要逻辑：
//   将element元素添加到DOM
//   给element的子元素创建对应的fiber节点
//   返回下一个工作单元，即下一个fiber节点，查找过程：
//      1.如果有子元素，则返回子元素的fiber节点
//      2.如果没有子元素，则返回兄弟元素的fiber节点
//      3.如果既没有子元素又没有兄弟元素，则往上查找其父节点的兄弟元素的fiber节点
//      4.如果往上查找到root fiber节点，说明render过程已经结束
function performUnitOfWork(fiber) {
  // 第一步 根据fiber节点创建真实的dom节点，并保存在fiber.dom属性中
  if(!fiber.dom){
    fiber.dom = createDom(fiber)
  }

  // 第二步 将当前fiber节点的真实dom添加到父节点中，注意，这一步是会触发浏览器回流重绘的！！！
  if(fiber.parent){
    fiber.parent.dom.appendChild(fiber.dom)
  }
  // 第三步 给子元素创建对应的fiber节点
  const children = fiber.props.children
  let prevSibling
  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
      dom: null
    }
    if(index === 0){
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
  })

  // 第四步，查找下一个工作单元
  if(fiber.child){
    return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber){
    if(nextFiber.sibling){
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }

}
const MiniReact = {
  createElement:  (type, props, ...children) => {
    return {
      type,
      props: {
        ...props,
        children: children.map(child => {
          if(typeof child === 'object'){
            return child
          }
          return {
            type: 'TEXT_ELEMENT',
            props: {
              nodeValue: child,
              children: [],
            }
          }
        })
      }
    }
  },
  render
}
/** @jsx MiniReact.createElement */
const element = (
  <div>
    <h1>
      <p />
      <a />
    </h1>
    <h2 />
  </div>
)
// const element = (
//   <div id="foo">
//     <a>bar</a>
//     <b />
//   </div>
// )

console.log('element======', element)
const container = document.getElementById("root")
MiniReact.render(element, container)
```

这里有一点值得细品，`React.createElement`返回的`element tree`和`performUnitOfWork`创建的`fiber tree`有什么联系。如下图所示：

- `React Element Tree`是由`React.createElement`方法创建的树形结构对象
- `Fiber Tree`是根据`React Element Tree`创建来的树。每个 Fiber 节点保存着真实的 DOM 节点，并且保存着对`React Element Tree`中对应的`Element`节点的应用。注意，`Element`节点并不会保存对`Fiber`节点的应用

### [](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Flizuncong%2Fmini-react%2Fblob%2Fmaster%2Fdocs%2F%25E8%25AF%2591%25E6%2596%2587%2Fbuild_your_own_react.md%23%25E7%25AC%25AC%25E5%2585%25AD%25E7%25AB%25A0-render-and-commit-phases 'https://github.com/lizuncong/mini-react/blob/master/docs/%E8%AF%91%E6%96%87/build_your_own_react.md#%E7%AC%AC%E5%85%AD%E7%AB%A0-render-and-commit-phases')第六章 Render and Commit Phases

第五章的`performUnitOfWork`有些问题，在第二步中我们直接将新创建的真实 dom 节点挂载到了容器上，这样会带来两个问题：

- 每次执行`performUnitOfWork`都会造成浏览器回流重绘，因为真实的 dom 已经被添加到浏览器上了，性能极差
- 浏览器是可以打断渲染过程的，因此可能会造成用户看到不完整的 UI 界面

我们需要改造一下我们的代码，在`performUnitOfWork`阶段不把真实的 dom 节点挂载到容器上。保存 fiber tree 根节点的引用。等到 fiber tree 构建完成，再一次性提交真实的 dom 节点并且添加到容器上。

```
javascript
复制代码
import React from 'react';
function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(fiber.type)

  const isProperty = key => key !== 'children'
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = fiber.props[name]
    })

  return dom
}

let nextUnitOfWork = null
let wipRoot = null
function render(element, container){
  wipRoot = {
    dom: container,
    props: {
      children: [element], // 此时的element还只是React.createElement函数创建的virtual dom树
    },
  }
  nextUnitOfWork = wipRoot
}
function commitRoot(){
  commitWork(wipRoot.child)
  wipRoot = null
}
function commitWork(fiber){
  if(!fiber){
    return
  }
  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }
  if(!nextUnitOfWork && wipRoot){
    commitRoot()
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
  // 第一步 根据fiber节点创建真实的dom节点，并保存在fiber.dom属性中
  if(!fiber.dom){
    fiber.dom = createDom(fiber)
  }

  // 第二步 将当前fiber节点的真实dom添加到父节点中，注意，这一步是会触发浏览器回流重绘的！！！
  // if(fiber.parent){
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }
  // 第三步 给子元素创建对应的fiber节点
  const children = fiber.props.children
  let prevSibling
  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
      dom: null
    }
    if(index === 0){
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
    prevSibling = newFiber
  })

  // 第四步，查找下一个工作单元
  if(fiber.child){
    return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber){
    if(nextFiber.sibling){
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }

}
const MiniReact = {
  createElement:  (type, props, ...children) => {
    return {
      type,
      props: {
        ...props,
        children: children.map(child => {
          if(typeof child === 'object'){
            return child
          }
          return {
            type: 'TEXT_ELEMENT',
            props: {
              nodeValue: child,
              children: [],
            }
          }
        })
      }
    }
  },
  render
}
/** @jsx MiniReact.createElement */
const element = (
  <div>
    <h1>
      <p />
      <a />
    </h1>
    <h2 />
  </div>
)
// const element = (
//   <div id="foo">
//     <a>bar</a>
//     <b />
//   </div>
// )

console.log('element======', element)
const container = document.getElementById("root")
MiniReact.render(element, container)
```

### [](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Flizuncong%2Fmini-react%2Fblob%2Fmaster%2Fdocs%2F%25E8%25AF%2591%25E6%2596%2587%2Fbuild_your_own_react.md%23%25E7%25AC%25AC%25E4%25B8%2583%25E7%25AB%25A0-reconciliation 'https://github.com/lizuncong/mini-react/blob/master/docs/%E8%AF%91%E6%96%87/build_your_own_react.md#%E7%AC%AC%E4%B8%83%E7%AB%A0-reconciliation')第七章 Reconciliation

目前为止，我们只考虑添加 dom 节点到容器上这一单一场景，更新删除还没实现。

我们需要对比最新的`React Element Tree`和最近一次的`Fiber Tree`的差异

我们需要给每个 fiber 节点添加一个 alternate 属性来保存旧的 fiber 节点

alternate 保存的旧的 fiber 节点主要有以下几个用途:

- 复用旧 fiber 节点上的真实 dom 节点
- 旧 fiber 节点上的 props 和新的 element 节点的 props 对比
- 旧 fiber 节点上保存有更新的队列，在创建新的 fiber 节点时执行这些队列以获取最新的页面

```
ini
复制代码
  const children = fiber.props.children
  reconcileChildren(fiber, children)
  function reconcileChildren(wipFiber, elements) {
    let index = 0
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child
    let prevSibling = null

    while (index < elements.length || oldFiber != null) {
      const element = elements[index]
      let newFiber = null

      const sameType = oldFiber && element && element.type == oldFiber.type

      if (sameType) {
        newFiber = {
          type: oldFiber.type,
          props: element.props,
          dom: oldFiber.dom,
          parent: wipFiber,
          alternate: oldFiber,
          effectTag: "UPDATE",
        }
      }
      if (element && !sameType) {
        newFiber = {
          type: element.type,
          props: element.props,
          dom: null,
          parent: wipFiber,
          alternate: null,
          effectTag: "PLACEMENT",
        }
      }
      if (oldFiber && !sameType) {
        oldFiber.effectTag = "DELETION"
        deletions.push(oldFiber)
      }

      if (oldFiber) {
        oldFiber = oldFiber.sibling
      }

      if (index === 0) {
        wipFiber.child = newFiber
      } else if (element) {
        prevSibling.sibling = newFiber
      }

      prevSibling = newFiber
      index++
    }
}
```

如上代码所示：

协调过程：

- 本质上依然是根据`新的React Element Tree`创建新的`Fiber Tree`，不过为了节省内存开销，协调过程会判断新的 fiber 节点能否复用旧的 fiber 节点上的真实 dom 元素，如果能复用，就不需要再从头到尾全部重新创建一遍真实的 dom 元素。同时每个新 fiber 节点上还会保存着对旧 fiber 节点的引用，方便在 commit 阶段做新旧属性 props 的对比。
- 如果`old fiber.type` 和 `new element.type`相同，则保留旧的 dom 节点，只更新 props 属性
- 如果`type`不相同并且有`new element`，则创建一个新的真实 dom 节点
- 如果`type`不同并且有`old fiber`节点，则删除该节点对应的真实 dom 节点
- 删除节点需要有个专门的数组收集需要删除的旧的 fiber 节点。由于新的 element tree 创建出来的新的 fiber tree 不存在对应的 dom，因此需要收集旧的 fiber 节点，并在 commit 阶段删除

**注意，协调过程，还是以最新的 React Element Tree 为主去创建一个新的 fiber tree，只不过是新的 fiber 节点复用旧的 fiber 节点的真实 dom 元素，毕竟频繁创建真实 dom 是很消耗内存的。新的 fiber 节点还是会保存着对旧的 fiber 节点的引用，方便在 commit 阶段进行新属性和旧属性的比较。这里会有个问题，如果新 fiber 节点保留旧 fiber 节点的引用，那么随着更新次数越来越多，旧的 fiber tree 是不是也会越来越多，如何销毁？**

```
scss
复制代码
import React from 'react';
function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(fiber.type)

  updateDom(dom, {}, fiber.props)


  return dom
}

let nextUnitOfWork = null
let wipRoot = null // 保存着对root fiber的引用
let currentRoot = null // 保存着当前页面对应的fiber tree
let deletions = null
function render(element, container){
  wipRoot = {
    dom: container,
    props: {
      children: [element], // 此时的element还只是React.createElement函数创建的virtual dom树
    },
    alternate: currentRoot,
  }
  deletions = []
  nextUnitOfWork = wipRoot
}
function commitRoot(){
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

const isEvent = key => key.startsWith("on")
const isProperty = key => key !== "children" && !isEvent(key)
const isNew = (prev, next) => key => prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)
function updateDom(dom, prevProps, nextProps) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = ""
    })

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name]
    })

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })
}
function commitWork(fiber){
  if(!fiber){
    return
  }
  const domParent = fiber.parent.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    )
  } else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom)
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }
  if(!nextUnitOfWork && wipRoot){
    commitRoot()
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)
function reconcileChildren(wipFiber, elements) {
  let index = 0
  let oldFiber =
      wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null

  while (index < elements.length || oldFiber != null) {
    const element = elements[index]
    let newFiber = null

    const sameType = oldFiber && element && element.type == oldFiber.type

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      }
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      }
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      wipFiber.child = newFiber
    } else if (element) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}
function performUnitOfWork(fiber) {
  // 第一步 根据fiber节点创建真实的dom节点，并保存在fiber.dom属性中
  if(!fiber.dom){
    fiber.dom = createDom(fiber)
  }

  // 第二步 将当前fiber节点的真实dom添加到父节点中，注意，这一步是会触发浏览器回流重绘的！！！
  // if(fiber.parent){
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }
  // 第三步 给子元素创建对应的fiber节点
  const children = fiber.props.children
  // let prevSibling
  // children.forEach((child, index) => {
  //   const newFiber = {
  //     type: child.type,
  //     props: child.props,
  //     parent: fiber,
  //     dom: null
  //   }
  //   if(index === 0){
  //     fiber.child = newFiber
  //   } else {
  //     prevSibling.sibling = newFiber
  //   }
  //   prevSibling = newFiber
  // })
  reconcileChildren(fiber, children)

  // 第四步，查找下一个工作单元
  if(fiber.child){
    return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber){
    if(nextFiber.sibling){
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }

}
const MiniReact = {
  createElement:  (type, props, ...children) => {
    return {
      type,
      props: {
        ...props,
        children: children.map(child => {
          if(typeof child === 'object'){
            return child
          }
          return {
            type: 'TEXT_ELEMENT',
            props: {
              nodeValue: child,
              children: [],
            }
          }
        })
      }
    }
  },
  render
}
/** @jsx MiniReact.createElement */
const container = document.getElementById("root")

const updateValue = e => {
  rerender(e.target.value)
}

const rerender = value => {
  const element = (
    <div>
      <input onInput={updateValue} value={value} />
      <h2>Hello {value}</h2>
    </div>
  )
  MiniReact.render(element, container)
}

rerender("World")
```

### [](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Flizuncong%2Fmini-react%2Fblob%2Fmaster%2Fdocs%2F%25E8%25AF%2591%25E6%2596%2587%2Fbuild_your_own_react.md%23%25E7%25AC%25AC%25E5%2585%25AB%25E7%25AB%25A0-function-components 'https://github.com/lizuncong/mini-react/blob/master/docs/%E8%AF%91%E6%96%87/build_your_own_react.md#%E7%AC%AC%E5%85%AB%E7%AB%A0-function-components')第八章 Function Components

本章以下面的代码为例：

```
javascript
复制代码
/** @jsx MiniReact.createElement */
const container = document.getElementById("root")
function App(props){
  return <h1>Hi { props.name }</h1>
}
const element = <App name="foo" />
MiniReact.render(element, container)
```

jsx 经过 babel 编译后：

```
php
复制代码
function App(props) {
  return MiniReact.createElement("h1", null, "Hi ", props.name);
}
const element = MiniReact.createElement(App, {
  name: "foo"
});
```

函数组件有两点不同的地方：

- 函数组件对应的 fiber 节点没有对应的真实 dom 元素
- 需要执行函数才能获取对应的 children 节点，而不是直接从`props.children`获取

由于函数组件没有对应的 fiber 节点，因此在 commit 阶段在找父 fiber 节点对应的 dom 时，需要判断是否存在该 dom 元素

本章完整代码：

```
ini
复制代码
import React from 'react';
function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(fiber.type)

  updateDom(dom, {}, fiber.props)


  return dom
}

let nextUnitOfWork = null
let wipRoot = null // 保存着对root fiber的引用
let currentRoot = null // 保存着当前页面对应的fiber tree
let deletions = null
function render(element, container){
  wipRoot = {
    dom: container,
    props: {
      children: [element], // 此时的element还只是React.createElement函数创建的virtual dom树
    },
    alternate: currentRoot,
  }
  deletions = []
  nextUnitOfWork = wipRoot
}
function commitRoot(){
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

const isEvent = key => key.startsWith("on")
const isProperty = key => key !== "children" && !isEvent(key)
const isNew = (prev, next) => key => prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)
function updateDom(dom, prevProps, nextProps) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = ""
    })

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name]
    })

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })
}
function commitWork(fiber){
  if(!fiber){
    return
  }
  let domParentFiber = fiber.parent
  while(!domParentFiber.dom){
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)
  } else if (fiber.effectTag === "DELETION") {
    // domParent.removeChild(fiber.dom)
    commitDeletion(fiber, domParent)
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitDeletion(fiber, domParent){
  if(fiber.dom){
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, domParent)
  }
}
function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }
  if(!nextUnitOfWork && wipRoot){
    commitRoot()
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)
function reconcileChildren(wipFiber, elements) {
  let index = 0
  let oldFiber =
      wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null

  while (index < elements.length || oldFiber != null) {
    const element = elements[index]
    let newFiber = null

    const sameType = oldFiber && element && element.type == oldFiber.type

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      }
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      }
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      wipFiber.child = newFiber
    } else if (element) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}

function performUnitOfWork(fiber) {
  // 1.函数组件对应的fiber节点没有真实dom元素
  // 2.函数组件需要运行函数获取children
  const isFunctionComponent = fiber.type instanceof Function
  if(!isFunctionComponent && !fiber.dom){
    fiber.dom = createDom(fiber)
  }
  const children = isFunctionComponent ? [fiber.type(fiber.props)] : fiber.props.children

  // 第二步 为每一个新的react element节点创建对应的fiber节点，并判断旧的fiber节点上的真实dom元素是否可以复用。
  // 节省创建真实dom元素的开销
  reconcileChildren(fiber, children)

  // 第三步，查找下一个工作单元
  if(fiber.child){
    return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber){
    if(nextFiber.sibling){
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }

}

const MiniReact = {
  createElement:  (type, props, ...children) => {
    return {
      type,
      props: {
        ...props,
        children: children.map(child => {
          if(typeof child === 'object'){
            return child
          }
          return {
            type: 'TEXT_ELEMENT',
            props: {
              nodeValue: child,
              children: [],
            }
          }
        })
      }
    }
  },
  render
}
/** @jsx MiniReact.createElement */
const container = document.getElementById("root")

function App(props){
  return <h1>Hi { props.name }</h1>
}

const element = <App name="foo" />
MiniReact.render(element, container)
```

### 第九章 Hooks

本章完整代码

```
ini
复制代码
import React from 'react';
function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(fiber.type)
  updateDom(dom, {}, fiber.props)
  return dom
}

let nextUnitOfWork = null
let wipRoot = null // 保存着对root fiber的引用
let currentRoot = null // 保存着当前页面对应的fiber tree
let deletions = null
function render(element, container){
  wipRoot = {
    dom: container,
    props: {
      children: [element], // 此时的element还只是React.createElement函数创建的virtual dom树
    },
    alternate: currentRoot,
  }
  deletions = []
  nextUnitOfWork = wipRoot
}
function commitRoot(){
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

const isEvent = key => key.startsWith("on")
const isProperty = key => key !== "children" && !isEvent(key)
const isNew = (prev, next) => key => prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)
function updateDom(dom, prevProps, nextProps) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = ""
    })

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name]
    })

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })
}
function commitWork(fiber){
  if(!fiber){
    return
  }
  let domParentFiber = fiber.parent
  while(!domParentFiber.dom){
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)
  } else if (fiber.effectTag === "DELETION") {
    // domParent.removeChild(fiber.dom)
    commitDeletion(fiber, domParent)
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitDeletion(fiber, domParent){
  if(fiber.dom){
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, domParent)
  }
}
function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }
  if(!nextUnitOfWork && wipRoot){
    commitRoot()
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)
function reconcileChildren(wipFiber, elements) {
  let index = 0
  let oldFiber =
      wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null

  while (index < elements.length || oldFiber != null) {
    const element = elements[index]
    let newFiber = null

    const sameType = oldFiber && element && element.type == oldFiber.type

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      }
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      }
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      wipFiber.child = newFiber
    } else if (element) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}

function performUnitOfWork(fiber) {
  // 1.函数组件对应的fiber节点没有真实dom元素
  // 2.函数组件需要运行函数获取children
  const isFunctionComponent = fiber.type instanceof Function
  if(!isFunctionComponent && !fiber.dom){
    fiber.dom = createDom(fiber)
  }
  const children = isFunctionComponent ? updateFunctionComponent(fiber) : fiber.props.children

  // 第二步 为每一个新的react element节点创建对应的fiber节点，并判断旧的fiber节点上的真实dom元素是否可以复用。
  // 节省创建真实dom元素的开销
  reconcileChildren(fiber, children)

  // 第三步，查找下一个工作单元
  if(fiber.child){
    return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber){
    if(nextFiber.sibling){
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }

}
let wipFiber = null
let hookIndex = null
function updateFunctionComponent(fiber){
  wipFiber = fiber
  hookIndex = 0
  wipFiber.hooks = []
  return [fiber.type(fiber.props)]
}
function useState(initial){
  const oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex]
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }
  const actions = oldHook ? oldHook.queue : []
  actions.forEach(action => {
    hook.state = action(hook.state)
  })
  const setState = action => {
    hook.queue.push(action)
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    }
    nextUnitOfWork = wipRoot
    deletions = []
  }
  wipFiber.hooks.push(hook)
  hookIndex++
  return [hook.state, setState]
}
const MiniReact = {
  createElement:  (type, props, ...children) => {
    return {
      type,
      props: {
        ...props,
        children: children.map(child => {
          if(typeof child === 'object'){
            return child
          }
          return {
            type: 'TEXT_ELEMENT',
            props: {
              nodeValue: child,
              children: [],
            }
          }
        })
      }
    }
  },
  render,
  useState,
}
/** @jsx MiniReact.createElement */
const container = document.getElementById("root")

function Counter(){
  const [state, setState] = MiniReact.useState(1)
  return (
    <h1 onClick={() => setState(c => c + 1)}>
      Count: { state }
    </h1>
  )
}

const element = <Counter />
MiniReact.render(element, container)
```
