[toc]

# 数据结构类题目

##  LinkedList

- 003-从尾到头打印链表   -->栈，数组反转，递归
- 014-链表中倒数第 k 个结点  -->2 个指针，p1 走 k-1 步，p2 开始走
- 015-反转链表 --> pre,curent,next 的保存
- 016-合并两个或 k 个有序链表
- 025-复杂链表的复制
- 036-两个链表的第一个公共结点
- 055-链表中环的入口结点
- 056-删除链表中重复的结点

## Tree

- 004-重建二叉树
- 017-树的子结构
- 018-二叉树的镜像
- 022-从上往下打印二叉树
- 023-二叉搜索树的后序遍历序列
- 024-二叉树中和为某一值的路径
- 026-二叉搜索树与双向链表
- 038-二叉树的深度
- 039-平衡二叉树
- 057-二叉树的下一个结点
- 058-对称的二叉树
- 059-按之字形顺序打印二叉树
- 060-把二叉树打印成多行
- 061-序列化二叉树
- 062-二叉搜索树的第 k 个结点

## Stack & Queue

- 005-用两个栈实现队列
- 020-包含 min 函数的栈
- 021-栈的压入、弹出序列
- 044-翻转单词顺序列(栈)
- 064-滑动窗口的最大值(双端队列)

## Heap

- 029-最小的 K 个数

## Hash Table

- 034-第一个只出现一次的字符

## 图

- 065-矩阵中的路径(BFS)
- 066-机器人的运动范围(DFS)

# 具体算法类题目

## 斐波那契数列

- 007-斐波拉契数列
- 008-跳台阶
- 009-变态跳台阶
- 010-矩形覆盖

## 搜索算法

- 001-二维数组查找
- 006-旋转数组的最小数字（二分查找）
- 037-数字在排序数组中出现的次数（二分查找）

## 全排列

- 027-字符串的排列

## 动态规划

- 030-连续子数组的最大和
- 052-正则表达式匹配(我用的暴力)

## 回溯

- 065-矩阵中的路径(BFS)
- 066-机器人的运动范围(DFS)

## 排序

- 035-数组中的逆序对(归并排序)
- 029-最小的 K 个数(堆排序)
- 029-最小的 K 个数(快速排序)

## 位运算

- 011-二进制中 1 的个数
- 012-数值的整数次方
- 040-数组中只出现一次的数字

## 其他算法

- 002-替换空格
- 013-调整数组顺序使奇数位于偶数前面
- 028-数组中出现次数超过一半的数字
- 031-整数中 1 出现的次数（从 1 到 n 整数中 1 出现的次数）
- 032-把数组排成最小的数
- 033-丑数
- 041-和为 S 的连续正数序列(滑动窗口思想)
- 042-和为 S 的两个数字(双指针思想)
- 043-左旋转字符串(矩阵翻转)
- 046-孩子们的游戏-圆圈中最后剩下的数(约瑟夫环)
- 051-构建乘积数组

链接：https://www.jianshu.com/p/53f6bf6f8d50

[剑指 offer -- JavaScript 版](https://www.jianshu.com/p/d50b839f2d5b)

# 题解

## 027-字符串的排列

## 016-合并两个或 k 个有序链表

```js
/**
function ListNode(x){
    this.val = x;
    this.next = null;
}
**/

//代码1：循环
function merge(pHead1, pHead2) {
  if (!pHead1) {
    return pHead2 ? pHead2 : null
  } else if (!pHead2) {
    return pHead1;
  }
  var curr1 = pHead1;
  var curr2 = pHead2;
  var result = new ListNode(-1);
  var curr = result;
  while (curr1 && curr2) {
    if (curr1.val < curr2.val) {
      curr.next = curr1;
      curr1 = curr1.next;
    } else {
      curr.next = curr2;
      curr2 = curr2.next;
    }
    curr = curr.next;
  }
  if (curr1) {
    curr.next = curr1;
  }
  if (curr2) {
    curr.next = curr2;
  }

  //防止内存泄露
  curr = curr1 = curr2 = null;
  return result.next;
}

//代码2：递归
function merge(pHead1, pHead2) {
  let pMergeHead = null;
  if (pHead1 === null) return pHead2;
  if (pHead2 === null) return pHead1;
  if (pHead1.val < pHead2.val) {
    pMergeHead = pHead1;
    pMergeHead.next = merge(pHead1.next, pHead2);
  } else {
    pMergeHead = pHead2;
    pMergeHead.next = merge(pHead1, pHead2.next);
  }
  return pMergeHead;
}
```

## 020-包含 min 函数的栈

```js
var stack = [];
var minStack = [];
let tmp = null;

function push(node) {
  if (!tmp || node < tmp) tmp = node;
  minStack.push(tmp);
  stack.push(node);
}

function pop() {
  stack.pop();
  minStack.pop();
}

function top() {
  return stack[stack.length - 1]
}

function min() {
  return minStack[minStack.length - 1]
}
```
## 036-两个链表的第一个公共结点

https://blog.csdn.net/weixin_40853073/article/details/81706773

## 055-链表中环的入口结点

判断一个链表有环？环的长度？出入环节点？

提示：追赶问题，前进次数 * 速度差

## 026-二叉搜索树与双向链表

```js
/**
明确Convert函数的功能。
输入：输入一个二叉搜索树的根节点。
过程：将其转化为一个有序的双向链表。
输出：返回该链表的头节点。

明确成员变量pLast的功能。
pLast用于记录当前链表的末尾节点。

明确递归过程。
递归的过程就相当于按照中序遍历，将整个树分解成了无数的小树，然后将他们分别转化成了一小段一小段的双向链表。再利用pLast记录总的链表的末尾，然后将这些小段链表一个接一个地加到末尾。
**/
private TreeNode pLast = null;
public TreeNode Convert(TreeNode root) {
 if (root == null)
     return null;
 
 // 如果左子树为空，那么根节点root为双向链表的头节点
 TreeNode head = Convert(root.left);
 if (head == null)
     head = root;
 
 // 连接当前节点root和当前链表的尾节点pLast
 root.left = pLast;
 if (pLast != null)
     pLast.right = root;
 pLast = root;
 
 Convert(root.right);
 
 return head;
}
```
