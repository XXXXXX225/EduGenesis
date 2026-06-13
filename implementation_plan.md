# Bilibili 视频推荐智能体集成问题修复实现计划 (Bilibili Video Recommendation Agent Path Regeneration Fixes Plan)

针对用户反馈的两个核心问题（1. 重新规划路线后只有前几个节点有视频推荐，后面没有；2. 视频内容为提前本地爬取而非 AI 实时抓取，导致路线重构后视频内容与节点标题不匹配），本计划提出完整的修复方案。

## User Review Required

> [!IMPORTANT]
> 1. **路线重构清除资源缓存**：重新规划学习路线时，由于生成的新关卡（`node1` 至 `node8`）的内容与之前完全不同，必须彻底清除之前该用户在 `user_resources` 缓存的所有静态/动态资源，避免旧 of 视频/文档内容残留。
> 2. **实时爬取策略**：为了保证首页秒开体验，我们在 `/path/regenerate` 路由中预生成 `node1` 和 `node2` 时，直接触发 Bilibili 检索智能体获取实时视频并存库，不再使用数据库中的静态 fallback。而 `node3` 至 `node8` 则是在用户点击它们触发 `/resources` 时动态按需爬取。
> 3. **自适应时长过滤**：为了确保过滤推荐真正的“干货”视频，不再推荐几个小时的庞大完整课程或少于 5 分钟的短宣传片，我们在视频代理中解析 `duration` 时长。过滤标准：优先匹配 `5 到 20 分钟` 视频；若该区间数量少于 2 个，则阶梯式放宽至 3-30 分钟、2-45 分钟，直至无时长限制作为最后兜底。

---

## Proposed Changes

## 后端服务 (Backend Component)

#### [MODIFY] [llm_client.py](file:///e:/AIproject/EduGenesis/backend/app/llm_client.py)
* 在 `call_llm_path_planner` 函数的 System Prompt 中：
  * 将 `"video"` 加入可选资源列表描述：`"pdf", "slide", "quiz", "code", "mindmap", "video"`。
  * 更新示例 JSON 格式，在资源列表中体现 `"video"`（例如 `["slide", "quiz", "video"]`），指导大模型在生成节点时主动包含视频推荐。

#### [MODIFY] [video_agent.py](file:///e:/AIproject/EduGenesis/backend/app/video_agent.py)
* 在 `search_bilibili_videos` 中，请求发送后显式设定 `response.encoding = 'utf-8'`。
  * **原因**：Bilibili 搜索接口返回 `Content-Type: text/html` 且没有 charset 声明，导致 `requests` 库默认采用 `ISO-8859-1` 进行解码，这可能在某些环境导致返回结果汉字出现乱码或解析异常。强制设定为 `utf-8` 能够保证在所有机器环境下的中文一致性。
* **添加时长解析与过滤**：
  * 引入 `parse_duration_to_seconds(duration_str: str) -> int` 辅助函数。
  * 修改 `search_bilibili_videos` 处理逻辑：在获取到 B站全部视频后，根据视频时长过滤，优先提取时长在 `5 - 20` 分钟之间的“讲干货”视频，再阶梯式放宽，保障视频列表的高匹配度和可用性。

#### [MODIFY] [path.py](file:///e:/AIproject/EduGenesis/backend/app/routes/path.py)
* **确保资源列表包含视频**：
  * 在大模型生成路径后，以及在 Fallback 使用预设列表后，遍历所有节点，使用安全防护逻辑：若 `resources` 列表里不含 `"video"`，则自动将其追加，从而保证无论是 AI 生成还是降级，所有 8 个节点始终具备视频功能。
* **清理历史缓存**：
  * 在保存新节点前，执行 `DELETE FROM user_resources WHERE username = ?`，清空该用户的历史资源缓存。
* **预生成实时抓取视频**：
  * 修改 `node1` 与 `node2` 的预生成逻辑。不仅获取静态 fallback，若资源列表包含 `"video"`，直接调用 `search_bilibili_videos` 和 `generate_video_recommendations` 获取该节点最新标题对应的实时 B站视频并存库。
  * 对 `complete_node` 解锁下一个节点时的预生成逻辑做相同修改，以保证解锁的新关卡也使用最新实时搜索结果。
  * 所有网络抓取操作均在 SQLite 事务之外完成，以规避数据库锁等待。

---

## Verification Plan

### Automated Tests
* 运行后端测试套件：
  `$env:PYTHONPATH="."; pytest`

### Manual Verification
1. 启动后端及前端开发服务器。
2. 登录 EduGenesis 仪表盘，点击 **“定制路径规划”**。
3. 点击 **“重新规划路线”** 发起自适应重构。
4. 在“智能体控制台”或终端日志中，验证：
   * `user_resources` 缓存已被正确清除。
   * 新生成的节点均有 `"video"` 资源标识。
   * 视频推荐智能体成功针对新节点标题（如“If-Else条件分支”或“梯度下降”）发起 Bilbili 实时检索并调用 LLM 生成定制推荐词。
5. 切换到 **“生成资源库”**，开启 **“精品学习视频”**，检查视频标题及播放器中的内容是否与当前新节点的标题完美吻合。
