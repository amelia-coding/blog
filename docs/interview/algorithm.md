---
nav:
  title: 面试
  order: 1
group:
  title: 算法总结
toc: content
---

# JS 手写题

以下罗列了一些常见的手写题，务必要必知必会。

更多题目请前往 [Github](https://github.com/amelia-coding/coding)

## 实现一个 instanceof

```js
function new_instance_of(leftValue, rightValue) {
  let rightProto = rightValue.prototype;
  leftValue = leftValue.__proto__;
  while (true) {
    if (leftValue == null) {
      return false;
    }
    if (leftValue === rightProto) {
      return true;
    }
    leftValue = leftValue.__proto__;
  }
}

console.log(new_instance_of({}, Array));
```

## 实现一个 reduce

```
reduce(function(total, currentValue, currentIndex, arr), initialValue)
total:必需。初始值, 或者计算结束后的返回值。
```

```js
Array.prototype.myReduce = function (cb, initialValue) {
  let acc = initialValue || this[0];
  const startIndex = initialValue ? 0 : 1;
  for (let i = startIndex, len = this.length; i < len; i++) {
    acc = cb(acc, this[i], i, this);
  }
  return acc;
};
```

## 实现一个 new 操作符

https://www.cnblogs.com/shapeY/p/10365983.html

```js
function _new() {
  //创建一个空对象
  let obj = new Object();
  //获取构造函数
  let Constructor = [].shift.call(arguments);
  //链接到原型
  obj.__proto__ = Constructor.prototype;
  //绑定this值
  let result = Constructor.apply(obj, arguments); //使用apply，将构造函数中的this指向新对象，这样新对象就可以访问构造函数中的属性和方法
  //返回新对象
  return typeof result === 'object' ? result : obj; //如果返回值是一个对象就返回该对象，否则返回构造函数的一个实例对象
}
```

## 实现一个继承

```js
Son.prototype = Object.create(Father.prototype,{
    constructor:{
        value:Son
    }
})

function F｛｝
F.prototype = Father.prototype
return new F

//相当于延长了子类的原型链，将子类的原型对象的__proto属性指向了Father.prototype
```

## 手写一个 new

- 创建一个空的简单 JavaScript 对象（即{}）；
- 链接该对象（即设置该对象的构造函数）到另一个对象 ；
- 将步骤 1 新创建的对象作为 this 的上下文 ；
- 如果该函数没有返回对象，则返回 this。

```js
function create() {
  let obj = new Object();
  let Con = [].shift.call(arguments);
  obj.__proto__ = Con.prototype;
  let ret = Con.apply(obj, arguments);
  return ret instanceof Object ? ret : obj;
}
```

## 手写一个 Object.create

```
Object.create()方法创建一个新对象，使用现有的对象来提供新创建的对象的**proto**
Object.create(proto[, propertiesObject])
```

```js
/* 
Pollyfill这个 polyfill 涵盖了主要的应用场景，
它创建一个已经选择了原型的新对象，
但没有把第二个参数考虑在内。
*/
if (typeof Object.create !== 'function') {
  Object.create = function (proto, propertiesObject) {
    if (typeof proto !== 'object' && typeof proto !== 'function') {
      throw new TypeError('Object prototype may only be an Object: ' + proto);
    } else if (proto === null) {
      throw new Error(
        "This browser's implementation of Object.create is a shim and doesn't support 'null' as the first argument.",
      );
    }
    if (typeof propertiesObject != 'undefined')
      throw new Error(
        "This browser's implementation of Object.create is a shim and doesn't support a second argument.",
      );

    function F() {}
    F.prototype = proto;
    return new F();
  };
}
```

## 手写一个 call

```
  function.call(thisArg, arg1, arg2, ...)
  没有指定 this，this 指向 window（严格模式下是 undefined）
  第一个参数为 undefined 或 null 的时候，那么会转变为 window
  改变了 this 执行，让新的对象可以执行该函数。

```

```js
Function.prototype.myCall = function (context) {
  // 如果没有传或传的值为空对象 context指向window
  context = context || window;
  //let fn = mySymbol(context)
  let fn = Symbol(context);
  context.fn = this; //给context添加一个方法 指向this
  // 处理参数 去除第一个参数this 其它传入fn函数
  let arg = [...arguments].slice(1); //[...xxx]把类数组变成数组，arguments为啥不是数组自行搜索 slice返回一个新数组
  context.fn(...arg); //执行fn
  delete context.fn; //删除方法
};

function mySymbol(obj) {
  // 不要问我为什么这么写，我也不知道就感觉这样nb
  let unique = (Math.random() + new Date().getTime()).toString(32).slice(0, 8);
  // 牛逼也要严谨
  if (obj.hasOwnProperty(unique)) {
    return mySymbol(obj); //递归调用
  } else {
    return unique;
  }
}

var array = ['a', 'b'];
var elements = [0, 1, 2];
array.push.myCall(array, ...elements);
console.log(array);
```

## 手写一个 apply

```
func.apply(thisArg, [argsArray])
```

```js
实现;

1; // 用 apply 将数组添加到另一个数组
var array = ['a', 'b'];
var elements = [0, 1, 2];
array.push.apply(array, elements);
2; // 基本等同于 Math.max(numbers[0], ...) 或 Math.max(5, 6, ..)
var max = Math.max.apply(null, numbers);
var min = Math.min.apply(null, numbers);
```

```
实现
Function.prototype.myApply = function(context) {
  // 如果没有传或传的值为空对象 context指向window
  context = context || window;
  // let fn = mySymbol(context);
  let fn = Symbol(context);
  context.fn = this; //给context添加一个方法 指向this
  if (arguments[1]) {
    context.fn(...arguments[1]);
  } else {
    context.fn();
  }
  delete context.fn; //删除方法
};
```

## 手写一个 bind

```
fun.bind(thisArg[, arg1[, arg2[, ...]]])
```

特点

- bind 方法返回的是一个绑定 this 后的函数，并且该函数并没有执行，需要手动去调用。(从这一点看 bind 函数就是一个高阶函数，而且和 call，apply 方法有区别)。
- 这个新函数的 this 被 bind 的第一个参数指定，其余的参数将作为新函数的参数供调用时使用
- 如果 bind 函数的参数列表为空，执行作用域的 this 将被视为新函数的 thisArg。
- 如果 bind 绑定后的函数被当做构造函数执行 new 操作，那么此时 this 指向就发生改变。此时的 this 就是当前函数的实例。
- 作为构造函数上的属性和方法，每个实例上都有。

应用

偏函数：bind()的另一个最简单的用法是使一个函数拥有预设的初始参数。只要将这些参数（如果有的话）作为 bind()的参数写在 this 后面。当绑定函数被调用时，这些参数会被插入到目标函数的参数列表的开始位置，传递给绑定函数的参数会跟在它们后面。

```js
实现;
Function.prototype.myBind = function (thisArg) {
  if (typeof this !== 'function') {
    return;
  }
  var _self = this;
  var args = Array.prototype.slice.call(arguments, 1);
  var fnBound = function () {
    // 检测 New,如果当前函数的this指向的是构造函数中的this 则判定为new 操作
    var _this = this instanceof _self ? this : thisArg;
    return _self.apply(
      _this,
      args.concat(Array.prototype.slice.call(arguments)),
    );
  };
  // 为了完成 new 操作
  // 还需要做一件事情 执行原型 链接 （思考题，为什么？
  //fnBound.prototype = this.prototype; 不推荐，会更改原来的原型,推荐原型式继承
  var fNOP = function () {};
  if (this.prototype) {
    // 当执行Function.prototype.bind()时, this为Function.prototype
    // this.prototype(即Function.prototype.prototype)为undefined
    fNOP.prototype = this.prototype;
  }
  // 下行的代码使fBound.prototype是fNOP的实例,因此
  // 返回的fBound若作为new的构造函数,new生成的新对象作为this传入fBound,
  // 新对象的__proto__就是fNOP的实例
  fnBound.prototype = new fNOP();
  return fnBound;
};
```

## 实现防抖和节流

https://juejin.im/post/5c2eb031f265da61343889bb#heading-6

### 防抖

```
在事件被触发 n 秒后再执行回调，如果在这 n 秒内又被触发，则重新计时。
简单的说，当一个动作连续触发，则只执行最后一次

- 搜索框搜索输入。只需用户最后一次输入完，再发送请求
- 手机号、邮箱验证输入检测、用户停止时做验证
- 窗口大小 resize。只需窗口调整完成后，计算窗口大小。防止重复渲染。
```

```js
// 立即执行
function debounce(fn, delay, immediate) {
  let timer, result;
  // 这里不能使用箭头函数，不然 this 依然会指向 Windows对象
  // 使用rest参数，获取函数的多余参数
  const debounced = function (...args) {
    if (timer) clearTimeout(timer);
    if (immediate) {
      const callNow = !timer;
      timer = setTimeout(() ={
        timer = null;
      }, delay);
      if (callNow) result = fn.apply(this, args);
    } else {
      timer = setTimeout(() ={
        fn.apply(this, args);
      }, delay);
    }
    return result;
  };

  debounced.cancel = () ={
    clearTimeout(timer);
    timer = null;
  };

  return debounced;
}
```

### 节流

限制一个函数在一定时间内只能执行一次。

- 滚动时判断是否到底页面底部
- 搜索联想（keyup）
- 高频点击提交，表单重复提交
- DOM 元素的拖拽功能实现（mousemove）
- 计算鼠标移动的距离（mousemove）
- 射击游戏的 mousedown/keydown 事件（单位时间只能发射一颗子弹）

监听滚动事件判断是否到页面底部自动加载更多在节流和防抖中的区别：给 scroll 加了 debounce 后，只有用户停止滚动后，才会判断是否到了页面底部；如果是 throttle 的话，只要页面滚动就会间隔一段时间判断一次

```js
// 1. 时间戳版
const throttle = function (func, delay) {
  let last = 0;
  return function (...args) {
    const current = +new Date();
    if (current - last delay) {
      func.apply(this, ...args);
      last = current;
    }
  };
}; //触发监听事件，回调函数会立刻执行


// 2.定时器版
const throttle = function (func, delay) {
  let timer;
  return function (...args) {
    if (!timer) {
      timer = setTimeout(() ={
        timer = null; // 执行后释放定时器变量
        fn.apply(this, args);
      }, delay);
    }
  };
};
```

```js
// 3. 时间和定时器版
function throttle(fn, wait) {
  var timer;
  var previous = 0;
  return function (...args) {
    var now = +new Date();
    var remaining = wait - (now - previous);
    if (remaining <= 0) {
      previous = now;
      fn.apply(this, args);
      // 如果存在延时执行定时器,将其取消掉,用于设置下一个定时器
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    } else if (!timer) {
      // 设置延时执行
      timer = setTimeout(() ={
        previous = +new Date();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}
```

## 柯里化和反柯里化

### 科里化

柯里化（Currying）是把接受多个参数的函数变换成接受一个单一参数的函数，并且返回接受余下的参数且返回结果的新函数

柯里化的特点

- 参数复用（固定易变因素）
- 延迟执行
- 提前返回

缺点

- 大量嵌套的作用域和闭包会带来开销，影响内存占用和作用域链查找速度

柯里化的应用

- 利用柯里化制定约束条件，管控触发机制
- 处理浏览器兼容（参数复用实现一次性判断）
- 函数节流防抖（延迟执行）
- ES5 前 bind 方法的实现

```js
function currying(func, args = []) {
  let arity = func.length;
  return function (..._args) {
    _args.unshift(...args);

    if (_args.length < arity) {
      return currying(func, _args);
    }

    return func(..._args);
  };
}

function add(x, y, z) {
  return x + y + z;
}
var test = currying(add, [1]);
console.log(test(1, 2));
```

### 反科里化

http://www.imooc.com/article/46624
https://segmentfault.com/a/1190000012912503

```js
Function.prototype.unCurrying = function() {
  const self = this
  return function(...rest) {

    return self.apply(, rest)
  }
}

Function.prototype.unCurrying = function() {
  return this.call.bind(this)
}
```

## 实现 map

map() 方法创建一个新数组，其结果是该数组中的每个元素是调用一次提供的函数后的返回值。

```
var new_array = arr.map(function callback(currentValue[, index[, array]]) {
 // Return element for new_array
}[, thisArg])

callback
生成新数组元素的函数，使用三个参数：
currentValue
callback 数组中正在处理的当前元素。
index可选
callback 数组中正在处理的当前元素的索引。
array可选
map 方法调用的数组。
thisArg可选
执行 callback 函数时值被用作this。
```

---

```js
Array.prototype.myMap = function (fn, thisArg) {
  let arr = this;
  let res = [];
  for (let i in arr) {
    if (arr.hasOwnProperty(i)) {
      res.push(fn.call(thisArg, arr[i], i, this));
    }
  }
  return res;
};

console.log([1, 2, 3].myMap((a = a * a)));
```

```js
// reduce版
Array.prototype.myMap = function (fn, thisArg) {
  if (typeof fn !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }
  let res = [];
  this.reduce((before, current, index, arr) ={
    res.push(fn.call(thisArg, current, index, arr));
  }, null);
  return res; //返回新数组
};
```

## promise 串联（reduce 实现 ）

```js
function runPromiseByQueue(myPromises) {
  myPromises.reduce(
    (previousPromise, nextPromise) =previousPromise.then(() =nextPromise()),
    Promise.resolve(),
  );
}
```
