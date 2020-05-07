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



### 堆排序

[夜尽天明-十大经典排序算法](https://biaochenxuying.github.io/blog/views/algorithms/10algo.html#_3-%E5%8D%81%E5%A4%A7%E7%BB%8F%E5%85%B8%E6%8E%92%E5%BA%8F%E7%AE%97%E6%B3%95)