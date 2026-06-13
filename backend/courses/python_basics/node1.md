# Python 环境部署与集成开发环境配置

在现代软件工程实践中，构建一个稳定、隔离且可复现的 Python 运行环境是所有开发工作的基石。

## 1. 解释器安装与环境变量
* **解释器下载**：推荐使用 Python 官方稳定分支（如 Python 3.10 或 3.11），从 `python.org` 下载对应系统的安装包。
* **PATH 环境变量**：在 Windows 系统中安装时，必须勾选 **"Add python.exe to PATH"**。这一步会将 Python 解释器的 bin 目录和 Scripts 脚本目录注册进系统的全局检索路径中。如果未配置，在命令行下运行 `python` 或 `pip` 将会抛出 `CommandNotFound` 错误。

## 2. 虚拟环境（Virtual Environments）
为避免不同项目之间的第三方依赖版本冲突，强烈建议使用 `venv` 创建项目级隔离环境：
```bash
# 创建虚拟环境
python -m venv .venv

# 激活虚拟环境 (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# 激活虚拟环境 (Linux/macOS)
source .venv/bin/activate
```

## 3. IDE 工具集成：VS Code
1. 下载并安装 **Visual Studio Code**。
2. 安装 Microsoft 官方出品的 **"Python" 扩展**。
3. 通过快捷键 `Ctrl+Shift+P` 调出命令面板，选择 `Python: Select Interpreter`，并指向刚刚创建的虚拟环境中的解释器路径。
4. 集成 Pytest 进行自动化测试，并在编辑器的 "Testing" 面板中可视化执行断言校验。
