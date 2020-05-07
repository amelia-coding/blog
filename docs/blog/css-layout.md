# 布局方式

- float
- [position](https://www.cnblogs.com/guolao/p/9048308.html)
- [flex](hhttps://www.cnblogs.com/qcloud1001/p/9848619.html)
- table
- [grid](http://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html)

## float 属性

## positon 属性

## flex 布局属性

flex-basis

```plain
flex-basis: <length> | auto; /* default auto */
定义了在分配多余空间之前，项目占据的主轴空间（main size）,初始的大小
(limted by max|min-width)
```

flex: flex-grow | flex-shink | flex-basis

```plain
.item {flex: 1;}
.item {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0%;
}
当 flex 取值为 none，则计算值为 0 0 auto，如下是等同的：
当 flex 取值为 auto，则计算值为 1 1 auto，如下是等同的：

```

## 三栏布局

圣杯、双飞翼

1. 方案的优缺点
2. 高度已知／未知
3. 兼容性

浮动方案 float

```plain
<div class="content">
  <div class="left"></div>
  <div class="right"></div>
  <div class="center"></div>
</div>
<style>
  html * {
    margin: 0;
    padding: 0;
  }
  .content div {
    height: 300px;
  }
  .center {
    background-color: blue;
  }
  .left {
    float: left;
    width: 100px;
    background-color: red;
  }
  .right {
    float: right;
    width: 100px;
    background-color: green;
  }
</style>
```

absolute

flex 方案

table 方案

gird 方案

## 水平和垂直

https://blog.csdn.net/weixin_37580235/article/details/82317240

## 两栏布局

## 等高布局

```plain
//html
<div class='box'>
    <div class='left'>
        <div class='bor'></div>
        dasdsgerfadcdasdsfdsfdsfdsfdsfdfsdf
    </div>
    <div class='right'>dsfdsfdsfdfsdf</div>
</div>
```

flex

```plain
.box{ display: flex; }
.left,.right{ flex: 1; }
//这种方式简洁明了，不考虑IE兼容性的话是最优的选择
```

margin/padding 互相抵消

```plain
.box{
    overflow: hidden;
    height: 200px;
}
.left,.right{
    float: left;
    width: 100px;
    margin-bottom: -999em;
    padding-bottom: 999em;
}
//这种方法有两个缺点是
1.无法添加下边框。可以用div模拟边框来实现。需要给每列中加个空的div来模拟。如此例
.box{
    position: relative;  //需要给容器元素添加相对定位
}
.bor{
    width: 100px;  //和列宽相同
    border-top: 1px solid red;
    position: absolute;
    bottom: 0;
}
2.有时候我们并不想让多出的部分隐藏。
```

table 布局

```plain
<table>
  <tr>
      <td class="left"><p>1111111111111</p></td>
      <td class="right">222222222</td>
  </tr>
</table>
```

absolute 绝对定位

```plain
.box {
    overflow: hidden;
    position: relative;
    height: 200px;
    }
.left,
.right{
    position: absolute;
    width: 200px;
    top: 0;
    bottom: 0;
    border: 1px solid #000;
}
.right {
    left: 200px;
}
```
