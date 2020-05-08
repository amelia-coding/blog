# 排序算法

基础交换

```JS
/**
交换元素
借助中间变量
**/
function swap(array, index1, index2) {
  var temp = array[index1];
  array[index1] = array[index2];
  array[index2] = temp;
}
/**
交换元素
加减法
**/
function swap(a,b) {
  a = a + b
  b = a - b
  a = a - b
  retrun [a,b]
}
```

## 基础排序

- 冒泡 
- 选择
- 插入

```js
// 冒泡排序
function bubbleSort(array) {
  for (let outer = 0; outer < array.length; outer++) {
    for (let inner = 0; inner < array.length - outer; inner++) {
      if (array[inner] > array[inner + 1]) {
        swap(array, inner, inner + 1);
      }
    }
  }
  return array;
}

// 冒泡排序（优化）
function bubbleSort2(arr) {
  const length = arr.length;
  if (length <= 1) return;
  for (let i = 0; i < length - 1; i++) {
    let hasChange = false;
    for (let j = 0; j < length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        swap(arr, j, j + 1);
        hasChange = true;
      }
    }
    if (!hasChange) break; // 如果 false
  }
};

// 选择排序
function selectSort(array) {
  for (let outer = 0; outer < array.length - 1; outer++) {
    let min = array[outer];
    for (let inner = outer + 1; inner < array.length; inner++) {
      if (array[inner] < min) {
        min = array[inner];
        swap(array, inner, outer);
      }
    }
  }
  return array;
}

// 插入排序
function insertSort(array) {
  for (let outer = 1; outer < array.length; outer++) {
    for (
      let inner = outer;
      inner > 0 && array[inner] < array[inner - 1];
      inner--
    ) {
      swap(array, inner, inner - 1);
    }
  }
  return array;
}

```


## 高级排序

- 快排
- 希尔
- 归并
- 堆排序

### 快排

```js
// 快排 O(nlogn)
function quickSort(arr) {
  if (arr.length === 0) {
    return [];
  }
  var pivot = arr[0];
  var lesser = [];
  var greater = [];
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] < pivot) {
      lesser.push(arr[i]);
    } else {
      greater.push(arr[i]);
    }
  }
  return quickSort(lesser).concat(pivot, quickSort(greater));
}

```

### 希尔

```js
// 希尔排序
function shellSort(array) {
  let len = array.length,
    gaps = [],
    gap = 0;
  while (gap < len / 3) {
    //动态定义间隔序列
    gaps.push(gap++ * 3 - 1);
  }
  console.log(gaps);
  for (let index = 0; index < gaps.length; index++) {
    const gap = gaps[index];

    for (let outer = gap; outer < array.length; outer++) {
      // 检查的数字
      const temp = array[outer];
      for (
        let inner = outer - gap;
        // 如果比之前的 gap 小，就交换一下，直到交换到第一个 gap 处
        inner >= 0 && array[inner] > temp;
        inner -= gap
      ) {
        swap(array, inner, inner + gap);
      }
    }
  }
  return array;
}
```


### 归并

```js
function mergeSort(arr) {
  //采用自上而下的递归方法
  const len = arr.length;
  if (len < 2) {
    return arr;
  }
  // length >> 1 和 Math.floor(len / 2) 等价
  let middle = Math.floor(len / 2),
    left = arr.slice(0, middle),
    right = arr.slice(middle); // 拆分为两个子数组
  return merge(mergeSort(left), mergeSort(right));
}

const merge = (left, right) => {
  const result = [];
  while (left.length && right.length) {
    // 注意: 判断的条件是小于或等于，如果只是小于，那么排序将不稳定.
    if (left[0] <= right[0]) {
      result.push(left.shift());
    } else {
      result.push(right.shift());
    }
  }
  while (left.length) result.push(left.shift());
  while (right.length) result.push(right.shift());
  return result;
};

mergeSort([2, 5, 3, 2, 4]);
```

### 堆排序

利用堆这种数据结构进行排序。

堆的定义：

- 每个结点的值都大于或等于其左右孩子结点的值，称为大顶堆
- 每个结点的值都小于或等于其左右孩子结点的值，称为小顶堆。

过程：

1、构建大顶堆。

2、取出大顶堆顶端的值，为最大的值。

3、重新构建大顶堆，继续走第二步，直到堆中的数据为空。

参考：https://segmentfault.com/a/1190000015487916?utm_source=tag-newest