# EduGenesis 测试说明书 (Testing & Security Verification Manual)

本测试说明书详细阐述了 **EduGenesis** 个性化自适应学习系统的测试策略、自动化测试套件的使用说明，以及针对“中国软件杯”竞赛所要求的安全校验和环境部署说明。

---

## 🔍 1. 测试策略与架构 (Test Architecture)

为了保证参赛系统的高可用性与安全性，EduGenesis 采用了**三层测试防御体系**：

```
┌─────────────────────────────────────────────────────────────────┐
│                    EduGenesis 自动化测试防护层                   │
└────────────────────────────────┬────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  AST 静态沙盒安全 │   │   数据库持久化   │   │  FastAPI 接口流  │
│  (test_security) │   │     (test_db)    │   │    (test_auth)   │
└──────────────────┘   └──────────────────┘   └──────────────────┘
```

1. **AST 静态安全检测层 (`tests/test_security.py`)**：拦截通过 `__import__`、`eval`、`getattr` 或双下划线拼接进行沙盒逃逸的危险代码流。
2. **数据持久化校验层 (`tests/test_db.py`)**：确保自适应学生画像、定制学习路径、关卡状态和系统智能体日志在 SQLite 数据库中的读写一致性。
3. **接口业务流校验层 (`tests/test_auth.py`)**：通过 FastAPI TestClient 校验注册、高强度 PBKDF2 密码哈希迁移、重复验证拦截以及鉴权登录逻辑。

---

## 🛠️ 2. 环境部署与依赖安装 (Test Environment)

执行测试需要 Python 3.10+ 环境。在 `backend/` 目录下安装所需的测试依赖项：

```bash
cd backend
pip install -r requirements.txt
```

*(主要包含：`fastapi`, `pytest`, `httpx`, `websocket-client` 等)*

---

## 🚀 3. 执行测试套件 (Running the Test Suite)

在 `backend/` 目录下，使用 Python 模块模式启动 `pytest`，这会自动将当前路径加入搜索空间中：

```bash
python -m pytest -v tests/
```

### 🎯 预期执行输出 (Expected Output)

```text
============================= test session starts =============================
platform win32 -- Python 3.12.7, pytest-7.4.4, pluggy-1.0.0
cachedir: .pytest_cache
rootdir: E:\AIproject\EduGenesis\backend
collected 9 items

tests/test_auth.py::test_register_and_login_flow PASSED                  [ 11%]
tests/test_db.py::test_db_profile_crud PASSED                            [ 22%]
tests/test_db.py::test_db_path_nodes PASSED                              [ 33%]
tests/test_db.py::test_db_logging_and_seeding PASSED                     [ 44%]
tests/test_security.py::test_safe_code PASSED                            [ 55%]
tests/test_security.py::test_forbidden_imports PASSED                    [ 66%]
tests/test_security.py::test_forbidden_identifiers_and_dunders PASSED    [ 77%]
tests/test_security.py::test_string_dunder_escapes PASSED                [ 88%]
tests/test_security.py::test_fstring_dunder_escapes PASSED               [100%]

======================= 9 passed, 57 warnings in 1.13s ========================
```

---

## 🛡️ 4. 核心测试模块详解 (Test Specifications)

### 4.1. 沙盒逃逸防御测试 (`tests/test_security.py`)
- **安全代码测试 (`test_safe_code`)**：允许标准的循环、函数、条件分支以及 `math` 模块导入。
- **危险模块拦截 (`test_forbidden_imports`)**：禁止导入 `os`、`sys`、`shutil` 等破坏系统环境的敏感模块。
- **敏感标识符拦截 (`test_forbidden_identifiers_and_dunders`)**：禁止直接使用 `eval`、`exec`、`__class__`、`__subclasses__`。
- **混淆字串拦截 (`test_string_dunder_escapes`)**：有效拦截形如 `'__cl' + 'ass__'` 拼装的动态反射逃逸攻击。

### 4.2. 数据库特征测试 (`tests/test_db.py`)
- **独立测试数据库 (`conftest.py`)**：系统通过 `tests/conftest.py` 全局钩子，在运行测试时自动将所有读写重定向到 `users_test.db`，测试完成后安全销毁，不污染开发/生产数据库 `users.db`。
- **画像状态维护 (`test_db_profile_crud`)**：验证自适应画像（6维认知模型、风格学习、目标跟踪）的存储与更新。
- **路径重构同步 (`test_db_path_nodes`)**：验证学习关卡从 `locked` 到 `active` 以及 `completed` 的转换流程。

### 4.3. 鉴权与哈希防线 (`tests/test_auth.py`)
- **PBKDF2 安全校验**：校验新用户注册密码哈希是否自动以 `pbkdf2_sha256$100000$...` 高强度格式落库。
- **旧哈希无缝迁移**：测试兼容旧版本的 SHA-256 注册数据，当其首次登录时，系统会自动重构并“自愈”升级至 PBKDF2 安全级别。

---

## 📈 5. 竞赛附加分：安全与健壮性凭证
- **数据隔离**：完全移除了旧版的不安全全局变量 `logged_in_username`，各 API 完全由基于 JWT token 的 `get_current_username` 守护，支持多用户并发并发隔离。
- **测试覆盖**：所有涉及后端逻辑的敏感模块和 API 均有自动化覆盖凭证，保证软件杯交付成果符合工程化软件的严苛规范。
