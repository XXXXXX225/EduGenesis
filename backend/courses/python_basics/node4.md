# 循环控制结构

循环结构用于让程序在满足特定条件时，重复执行某段代码，是批量处理数据和实现持续服务的核心工具。

## 1. while 循环与死循环规避
`while` 循环在给定条件为真时持续循环。
* **基本语法**：
  ```python
  count = 0
  while count < 5:
      print(count)
      count += 1
  ```
* **防范死循环（Infinite Loop）**：
  若循环条件永远成立，程序会无限循环，占满 CPU 资源导致系统卡死。
  * **防范原则**：确保循环体内部存在能使循环条件趋近于假的代码（如计数器增加，或状态变更）。
  * **超时中断护栏**：对于存在不确定外部环境的条件循环，应该设定最大的循环尝试次数（Max Tries）以跳出循环：
    ```python
    attempts = 0
    max_attempts = 1000
    while not connection.is_ready():
        attempts += 1
        if attempts > max_attempts:
            raise TimeoutError("连接超时，无法建立连接")
        time.sleep(0.1)
    ```

## 2. for 循环与 range 迭代
`for` 循环是基于迭代器（Iterator）的循环，常用于遍历序列（列表、字符串、元组）或生成器。
* **基本语法**：
  ```python
  for item in [1, 2, 3]:
      print(item)
  ```
* **`range()` 函数**：
  用于生成一个不可变的等差数列。常用形式有：
  * `range(stop)`：生成从 0 到 stop-1 的整数。
  * `range(start, stop)`：生成从 start 到 stop-1 的整数。
  * `range(start, stop, step)`：带步长的数列，如 `range(1, 10, 2)` 生成 `[1, 3, 5, 7, 9]`。
  ```python
  for i in range(5):
      print(f"当前迭代步数: {i}")
  ```

## 3. break, continue 与 else 语句
Python 提供了高级关键字来精准控制循环的跳出与中断逻辑。
* **`break`**：强行跳出并终止当前整个循环体。
* **`continue`**：跳过当前本次迭代，直接进入下一次循环条件的判定。
* **循环的 `else` 语句**：
  这是一个 Python 独有的语法。当循环**正常结束（即没有被 `break` 中断）**时，会执行 `else` 块中的内容。
  * **应用场景**：常用于在列表中搜索某个特定元素，若遍历完所有元素仍未找到，则执行兜底逻辑：
    ```python
    for num in [1, 3, 5, 7]:
        if num % 2 == 0:
            print("找到了偶数")
            break
    else:
        print("遍历结束，未找到任何偶数")
    ```
