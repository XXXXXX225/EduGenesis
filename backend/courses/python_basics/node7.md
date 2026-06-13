# Python 文件操作与健壮异常处理机制

健壮的异常处理与安全的文件读写是生产级软件的标志。

## 1. 异常处理结构 (Try-Except-Finally)
当代码运行出错时，Python 会抛出对应的 Exception。我们可以捕获并优雅处理它们：
```python
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"除零错误: {e}")
except Exception as e:
    print(f"未预料的错误: {e}")
else:
    print("一切正常")
finally:
    print("无论是否报错，都会执行")
```

## 2. 上下文管理器与文件读写 (With Statement)
传统的 `open()` 后需要手动 `close()`。如果在中途报错，文件流可能无法关闭，导致句柄泄露。
Python 推荐使用 `with` 上下文管理器，它实现了 `__enter__` 和 `__exit__` 协议，在退出块时**自动释放文件资源**：
```python
with open("test.txt", "r", encoding="utf-8") as f:
    content = f.read()
```

## 3. 防御性安全限制
在基于 Web 的代码沙盒中，为了防御文件泄露，应禁止用户运行带 `open()`, `read()`, `write()` 等直接操纵文件系统的代码。
