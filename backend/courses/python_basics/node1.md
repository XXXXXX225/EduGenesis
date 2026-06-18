# Python 环境部署与测试验证

搭建一个稳定、隔离且可复写的运行期环境，是进行 Python 软件开发的第一步。本章将详细讲解解释器安装、系统环境变量配置、虚拟环境管理以及 IDE 开发工具的集成。

## 1. 解释器下载与安装
在进行开发前，我们需要在系统中部署官方的 Python 运行期环境。
* **版本选择**：推荐使用官方稳定的 `Python 3.10` 或 `Python 3.11` 版本。避免直接在生产环境使用最新发布的 Alpha/Beta 版本，以防第三方依赖库不兼容。
* **跨平台安装**：
  * **Windows**：在运行安装包时，**务必勾选 "Add python.exe to PATH"**。这一步会将 Python 解释器及其包管理器 pip 注册进系统检索路径中。
  * **macOS**：推荐使用 `Homebrew` 执行安装：`brew install python@3.10`。
  * **Linux (Ubuntu/Debian)**：使用系统包管理器：`sudo apt update && sudo apt install python3.10 python3.10-venv`。

## 2. 环境变量 PATH 配置
环境变量 `PATH` 是操作系统用于定位可执行程序的路径列表。
* **重要作用**：若未将 Python 路径添加至 `PATH`，在终端输入 `python` 或 `pip` 时，系统会抛出 `CommandNotFound` 错误。
* **手动配置**：如果安装时漏选，需要在系统“环境变量”设置中，将 Python 的安装根目录（如 `C:\Python310`）和脚本目录（如 `C:\Python310\Scripts`）手动追加至 `Path` 变量中。

## 3. 虚拟环境 venv 管理
在实际项目开发中，不同项目可能依赖同一第三方库的不同版本。为了避免全局依赖冲突，必须使用虚拟环境（Virtual Environment）进行物理隔离。
* **创建虚拟环境**：
  ```bash
  python -m venv .venv
  ```
  该命令会在当前目录下创建一个名为 `.venv` 的隔离文件夹，其中包含一份独立的 Python 解释器副本和 `site-packages` 目录。
* **激活虚拟环境**：
  * **Windows (PowerShell)**：
    ```powershell
    .\.venv\Scripts\Activate.ps1
    ```
  * **macOS / Linux**：
    ```bash
    source .venv/bin/activate
    ```
* **退出虚拟环境**：
  ```bash
  deactivate
  ```

## 4. IDE 插件集成与 Pytest 验证
良好的开发工具集成能极大提高编码和调试效率。
* **VS Code 配置**：
  1. 下载并安装 **VS Code**。
  2. 在扩展市场搜索并安装官方的 **Python** 插件。
  3. 使用快捷键 `Ctrl+Shift+P` 唤起命令面板，搜索 `Python: Select Interpreter`，并选择当前项目 `.venv` 目录下的解析器。
* **测试验证 (Pytest)**：
  为了验证环境已成功就绪，我们可以使用 `Pytest` 运行单元测试。在虚拟环境下执行：
  ```bash
  pip install pytest
  pytest --version
  ```
  安装完成后，通过 VS Code 侧边栏的“测试”面板可以直观地运行并调试所有测试用例。
