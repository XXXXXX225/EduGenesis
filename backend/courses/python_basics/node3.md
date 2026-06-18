# 控制流条件判断

程序不仅有线性执行，还需要根据不同的现实状态和业务逻辑执行不同的路径。控制流条件结构使程序具备了选择与判定能力。

## 1. if-elif-else 结构
Python 使用 `if`, `elif`（else if 的缩写）和 `else` 关键字来构建多分支判断逻辑。
* **基本语法**：
  ```python
  score = 85
  if score >= 90:
      grade = "A"
  elif score >= 80:
      grade = "B"
  else:
      grade = "C"
  ```
  Python 中不使用大括号 `{}`，而是强制要求通过**四个空格的缩进**来确定代码块的层级范围。

## 2. 逻辑运算符与短路求值
为了进行复杂判定，通常使用逻辑运算符连接多个布尔表达式：
* **运算符**：
  * `and`：逻辑与。两边皆为真，结果才为真。
  * `or`：逻辑或。只要有一边为真，结果即为真。
  * `not`：逻辑非。取反。
* **短路求值（Short-circuit Evaluation）**：
  * 在 `A and B` 中，如果 `A` 为假，Python 会立刻返回假，不再执行/计算 `B` 的值。
  * 在 `A or B` 中，如果 `A` 为真，Python 会立刻返回真，同样不再计算 `B`。
  * **设计技巧**：利用短路求值，可以将高开销或容易出错的判断写在后面，作为安全屏障：
    ```python
    # 如果 obj 为 None，不会调用 obj.is_active，避免 AttributeError
    if obj is not None and obj.is_active:
        pass
    ```

## 3. 三元表达式与嵌套优化
条件嵌套能够解决多维度的分支，但过度嵌套（超过 3 层）会导致代码极难阅读和维护（俗称“面条代码”）。
* **三元表达式**：对于简单的条件赋值，可缩写为一行：
  ```python
  status = "Approved" if score >= 60 else "Rejected"
  ```
* **优化嵌套——卫语句（Guard Clauses）**：
  尽量在函数开始时，把不符合条件的特殊情况提前拦截并退出，从而让主逻辑保持在无嵌套的扁平层级：
  ```python
  # 优化前：
  def process(user):
      if user is not None:
          if user.is_active:
              # 主业务逻辑...
              pass

  # 优化后（卫语句）：
  def process(user):
      if user is None or not user.is_active:
          return  # 提前拦截并退出
      # 主业务逻辑...
  ```
