# 商务英语知识图谱 | Business English Knowledge Base

一个基于知识图谱架构的商务英语学习网站，包含40个主题课程，涵盖会议、邮件、演讲、谈判等8大类别。

## 📚 项目特点

- **三层知识架构**：40个主题课程 → 8大业务场景 → 交叉链接网络
- **双语内容**：英文术语 + 中文释义 + 双语例句
- **知识图谱导航**：每个课题都有相关课题推荐，形成知识网络
- **全文搜索**：支持搜索英文、中文、标签、例句
- **分类浏览**：按类别（会议/邮件/演讲等）或标签筛选
- **响应式设计**：支持桌面和移动设备

## 📂 项目结构

```
site/
├── index.html              # 主页面
├── assets/
│   ├── style.css          # 样式文件
│   └── app.js             # 应用逻辑
└── data/
    ├── data.js            # 数据合并与索引
    ├── lessons_01_08.js   # 课题 1-8
    ├── lessons_09_16.js   # 课题 9-16
    ├── lessons_17_24.js   # 课题 17-24
    ├── lessons_25_32.js   # 课题 25-32
    └── lessons_33_40.js   # 课题 33-40
```

## 🎯 40个课题列表

### 会议 (Meetings)
1. More Essential Verbs For Meetings
4. Eight Phrasal Verbs for Meetings
19. Talking About Meetings and Scheduling
24. Phrases for Leading a Business Meeting
26. How to Interrupt & Handle Interruptions
30. Advanced Phrases for Meetings

### 邮件 (Emails)
3. Six Common Email Errors
7. Professional Email Introduction Templates
22. More Phrases for Formal Emails
23. Phrases for Making Complaints
32. Write Emails – Formal, Semi-formal, Informal
35. New Year Email Starters
38. Email Grammar

### 演讲 (Presentations)
20. Useful Phrases for Business Presentations
28. Forty Phrases for Presenting in English
29. Five Ways to Finish a Presentation

### 词汇 (Vocabulary)
2. Eight Useful Phrasal Verbs for Work
8. Vocabulary Collocations
10. Ways to Say "Very Important" in English
25. Useful Expressions with "Give"
33. Eight Advanced Phrasal Verbs
34. Nineteen Ways to Say Thank You

### 语法 (Grammar)
6. Talking About Hope and Wishes
21. How to Talk About Project Progress (Present Perfect)

### 职场 (Workplace)
5. Small Talk – The Art of Professional Conversation
9. How to Deal With Impolite People at Work
11. Talking About Time in Business
12. Talking About Working From Home
13. How to Say "Yes" and "No" Professionally
15. Talking About Company Culture
16. How to Talk About Stress at Work
17. Talking About Feedback at Work
18. Talking About Problems and Solutions
27. Talking About Problems

### 职业发展 (Career)
14. Talking About Career Goals and Ambitions
31. Job Interview Skills – Vocabulary
37. Job Interview Skills – Advanced
39. Salary and Pay

### 谈判 (Negotiation)
36. Sixty-Two Negotiation Phrases
40. How to End a Conversation

## 🚀 本地运行

### 方法1：使用Python内置服务器

```bash
cd site
python -m http.server 8000
```

然后访问 http://localhost:8000

### 方法2：使用Node.js http-server

```bash
npm install -g http-server
cd site
http-server -p 8000
```

### 方法3：直接打开

在现代浏览器中直接打开 `index.html` 文件即可（推荐使用本地服务器以避免CORS问题）。

## 🌐 部署到Cloudflare Pages

1. 将 `site` 目录推送到GitHub仓库

2. 登录 [Cloudflare Pages](https://pages.cloudflare.com/)

3. 点击 "Create a project" → "Connect to Git"

4. 选择你的仓库

5. 配置构建设置：
   - **Build command**: 留空（静态站点无需构建）
   - **Build output directory**: `/site` 或 `/`（取决于仓库结构）
   - **Root directory**: `site`（如果site是子目录）

6. 点击 "Save and Deploy"

7. 几分钟后，你的网站将部署到 `https://your-project.pages.dev`

## 📖 使用方法

### 浏览课题
- 点击左侧边栏的类别（会议、邮件、演讲等）
- 点击标签云中的标签
- 点击课题卡片查看详情

### 搜索
- 在顶部搜索框输入关键词
- 支持搜索英文术语、中文释义、例句
- 搜索结果会高亮显示匹配内容

### 知识图谱导航
- 在课题详情页底部查看"相关课题"
- 点击相关课题卡片跳转
- 使用"上一课"/"下一课"按钮顺序学习

### 移动端
- 点击左下角菜单按钮打开侧边栏
- 支持触摸滑动和手势操作

## 🎨 技术栈

- **纯静态网站**：HTML + CSS + JavaScript
- **无框架依赖**：原生JS实现所有功能
- **响应式设计**：CSS Grid + Flexbox
- **知识图谱**：基于关联数组的交叉链接系统

## 📊 数据结构

每个课题包含：
- `id`: 唯一标识符
- `number`: 课题编号 (1-40)
- `title`: 英文标题
- `chinese_title`: 中文标题
- `category`: 类别（meetings/emails/presentations等）
- `tags`: 标签数组
- `related`: 相关课题ID数组（知识图谱链接）
- `summary`: 一句话摘要
- `sections`: 内容章节数组
  - `heading`: 章节标题
  - `items`: 词汇/短语条目
    - `term`: 术语
    - `chinese`: 中文释义
    - `definition`: 英文定义
    - `note`: 用法说明
    - `examples`: 例句数组（英文+中文）

## 🔗 知识图谱统计

- **总课题数**: 40
- **类别数**: 8
- **交叉链接**: 每个课题平均关联3-5个相关课题
- **总词汇/短语**: 约300+
- **例句数**: 约600+

## 📝 内容来源

本项目内容来自Derek Callan的商务英语课程笔记，经过结构化整理和知识图谱化处理。

## 🛠️ 维护与扩展

### 添加新课题

1. 在 `data/` 目录创建新的批次文件（如 `lessons_41_48.js`）
2. 按照现有数据结构添加课题
3. 在 `index.html` 中添加新的 `<script>` 标签引用
4. 在 `data.js` 中的 `ALL_LESSONS` 数组添加新批次

### 修改样式

编辑 `assets/style.css`，所有颜色和尺寸变量定义在 `:root` 中。

### 扩展功能

编辑 `assets/app.js`，主要功能模块：
- `renderLessonGrid()`: 课题列表渲染
- `renderLessonDetail()`: 课题详情渲染
- `searchLessons()`: 搜索功能
- `filterByCategory()`: 分类筛选
- `getRelatedLessons()`: 关联课题查询

## 📄 许可

本项目仅供学习交流使用。

## 🙏 致谢

- 内容来源：Derek Callan商务英语课程
- 方法论参考：巴菲特股东信知识图谱项目
- 设计灵感：Obsidian知识管理系统

---

**开始学习**: 打开 `index.html` 或访问部署后的网站 🚀
