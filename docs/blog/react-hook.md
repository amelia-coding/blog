# React Hook

## useMemo、useCallback、memo

- useCallback 和 memo 配合使用，
- useCallback 缓存一个函数，
- memo 相当于 shouldCompoentUpdate，会对新旧 prop 进行一次浅比较

## redux 的結合

1、redux-react-hook

2、react-redux 7.1 的 hooks 版

3、context + useContext + useReducer
  
代码实现 : https://codesandbox.io/s/usereducerusecontext-n1ov8

## 简易版 Hook 实现

```js
import React from "react";
import ReactDOM from "react-dom";
import { Button } from "antd";
import "./styles.css";

let memoizedState = []; // hooks 存放在这个数组
let cursor = 0; // 当前 memoizedState 下标

function useState(initialValue) {
  memoizedState[cursor] = memoizedState[cursor] || initialValue;
  const currentCursor = cursor;
  function setState(newState) {
    memoizedState[currentCursor] = newState;
    render();
  }
  return [memoizedState[cursor++], setState]; // 返回当前 state，并把 cursor 加 1
}

function useEffect(callback, depArray) {
  const hasNoDeps = !depArray;
  const deps = memoizedState[cursor];
  const hasChangedDeps = deps
    ? !depArray.every((el, i) => el === deps[i])
    : true;
  if (hasNoDeps || hasChangedDeps) {
    callback();
    memoizedState[cursor] = depArray;
  }
  cursor++;
}

function App() {
  const [count, setCount] = useState(0);
  const [username, setUsername] = useState("fan");
  useEffect(() => {
    console.log(count);
  }, [count]);
  useEffect(() => {
    console.log(username);
  }, [username]);
  return (
    <div>
      <div>{count}</div>
      <Button
        onClick={() => {
          setCount(count + 1);
        }}
      >
        点击
      </Button>
      <div>{username}</div>
      <Button
        onClick={() => {
          setUsername(username + " hello");
        }}
      >
        点击
      </Button>
    </div>
  );
}

const rootElement = document.getElementById("root");

function render() {
  cursor = 0;
  ReactDOM.render(<App />, rootElement);
}
render();

```