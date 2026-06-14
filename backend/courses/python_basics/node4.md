# Python 循环控制与迭代机制

迭代是程序批量处理数据的核心手段。Python 提供了 `while` 和 `for` 两种循环结构。

## 1. For 循环与可迭代对象
Python 的 `for` 循环本质上是一个迭代器驱动的遍历工具，可以遍历任何“可迭代对象”（Iterable），例如列表、元组、字符串和字典：
```python
for item in [1, 2, 3]:
    print(item)
```
搭配 `range(start, stop, step)` 可以生成数值序列。

## 2. While 条件循环
当循环次数不确定，但满足某个布尔条件时使用：
```python
count = 0
while count < 5:
    print(count)
    count += 1
```

## 3. 循环控制：break 与 continue
* **`break`**：立即终止并跳出当前循环体。
* **`continue`**：跳过当前轮次循环的剩余代码，直接进入下一轮条件判断或迭代。
* **`else` 子句**：Python 的循环体可以带一个 `else`，只有当循环**正常结束**（即没有被 `break` 中断）时，才会执行 `else` 块。
