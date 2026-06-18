# 函数与封装抽象

函数是组织良好、可重用、用于实现单一或相关联功能的代码段。通过将逻辑封装为函数，我们可以实现逻辑解耦、降低代码重复率，并提供更好的 API 抽象。

## 1. 函数声明与参数传递
在 Python 中，使用 `def` 关键字来声明一个函数。
* **基本语法**：
  ```python
  def greet(name):
      return f"Hello, {name}!"
  ```
* **形参和实参**：
  * **位置参数**：根据调用时的相对位置进行赋值。
  * **关键字参数**：根据参数名赋值，允许调整参数顺序。
  * **默认参数**：为参数赋予默认值，调用时如果不传该参数则采用默认值。
    * **避坑指南**：**千万不要使用可变对象（如列表、字典）作为默认参数**！默认参数在函数定义时完成求值，并在多次调用间共享，这会导致状态积累 Bug：
      ```python
      # 错误作法：
      def add_item(item, item_list=[]):
          item_list.append(item)
          return item_list

      # 正确作法：
      def add_item(item, item_list=None):
          if item_list is None:
              item_list = []
          item_list.append(item)
          return item_list
      ```

## 2. 可变长参数 (*args & **kwargs)
当你不确定调用者会传入多少个参数时，可变长参数就派上用场了。
* **`*args`**：收集所有多余的位置参数，并将它们打包成一个**元组（Tuple）**。
* **`**kwargs`**：收集所有多余的关键字参数，并将它们打包成一个**字典（Dict）**。
  ```python
  def display_info(*args, **kwargs):
      print(f"位置参数元组: {args}")
      print(f"关键字参数字典: {kwargs}")

  display_info("arg1", "arg2", key1="val1", key2="val2")
  ```

## 3. 作用域与标准库导入
作用域（Scope）决定了在程序的哪些区域能够访问特定的变量名。
* **LEGB 作用域解析规则**：
  Python 在查找变量名时，会按照以下顺序从内向外检索：
  1. **L (Local)**：函数内部定义的局部变量。
  2. **E (Enclosing)**：外部嵌套函数（闭包）环境中的变量。
  3. **G (Global)**：模块（当前文件）级别的全局变量。
  4. **B (Built-in)**：Python 内置关键字与函数（如 `len`, `str`）。
* **标准库与模块导入**：
  Python 拥有极其强大的标准库。使用 `import` 关键字导入模块以实现代码复用：
  ```python
  import math
  from datetime import datetime
  
  root = math.sqrt(16)  # 4.0
  now = datetime.now()
  ```
