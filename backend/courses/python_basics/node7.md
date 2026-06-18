# 文件读写与异常处理

在真实世界的应用程序中，我们需要同文件系统等外部资源进行交互。同时，面对不可控的运行期错误（如网络中断、文件丢失），我们必须提供优雅的异常处理机制。

## 1. 文件读写机制与上下文管理器
处理外部文件时，标准流程是：打开文件 ──> 读写操作 ──> 关闭文件。
* **资源泄漏风险**：如果打开文件后，在读写过程中程序报错，或者漏写了 `close()`，将导致文件指针被系统长期占用，进而引发资源泄漏。
* **推荐作法：with 语句（上下文管理器）**：
  `with` 语句能在代码块执行完毕后，**无论是否发生异常，都自动且绝对安全地关闭文件**：
  ```python
  # 写入文件
  with open("log.txt", "w", encoding="utf-8") as f:
      f.write("系统初始化就绪。\n")
      
  # 读取文件
  with open("log.txt", "r", encoding="utf-8") as f:
      content = f.read()
  ```
* **常用打开模式**：
  * `"r"`：只读模式（默认）。若文件不存在抛出错误。
  * `"w"`：写入模式。若文件存在则直接覆写清空；不存在则创建。
  * `"a"`：追加模式。在文件末尾追加写入内容。
  * `"b"`：二进制模式（如 `"rb"`, `"wb"`），常用于处理图片、音频等非文本文件。

## 2. try-except-finally 异常捕获
异常处理使得程序在运行时报错时，不会直接崩溃中断，而是能捕获错误并执行降级逻辑。
* **基本语法**：
  ```python
  try:
      with open("non_existent_file.txt", "r") as f:
          data = f.read()
  except FileNotFoundError as e:
      print(f"安全警报：未找到所需文件。详细错误: {e}")
      data = "默认兜底数据"
  except Exception as e:
      print(f"捕获到未预料的系统错误: {e}")
  finally:
      print("无论成败，这里必定执行（通常用于清理临时资源）")
  ```
* **防错指南：避免使用裸的 `except:`**：
  裸的 `except:` 或捕获顶级基类 `BaseException` 会拦截包括 `KeyboardInterrupt`（用户强制中断终端 Ctrl+C）在内的所有系统中断信号，导致程序无法正常被用户终止。一般情况下，至少应当捕获 `Exception`。

## 3. 自定义与主动抛出异常
在编写业务逻辑时，如果遇到了不符合业务预期的边界条件，应当主动抛出异常（`raise`）：
```python
def check_deposit(amount):
    if amount <= 0:
        raise ValueError("充值金额必须大于0")
    print(f"充值成功：{amount}")
```
这样能让上层调用者立刻知晓逻辑不合理，并通过外层的 `try-except` 捕获该错误。
