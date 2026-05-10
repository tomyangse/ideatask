# Exobrain UI 修改需求说明：从“星球视觉”改为“语义化图标卡片系统”

## 一、修改目标

当前 Exobrain 的视觉方向偏“星球 / 宇宙感”。这个方向有一定记忆点，但在实际使用中可能会带来几个问题：

- 项目、想法、任务、问题之间的区别不够直观
- 用户第一眼不容易判断每个节点的类型
- 视觉装饰感较强，工具属性不够清晰
- 长期使用时，信息识别效率可能不够高
- 不同项目之间虽然颜色不同，但语义差异不明显

本次 UI 修改目标是：保留 Exobrain 的轻盈、智能、视觉化导图感觉，但将核心节点从“星球视觉”改为更清晰的“图标 + 卡片 + 状态”的语义化系统。

最终效果应该更像一个现代 SaaS 产品，而不是概念艺术界面。

## 二、整体设计方向

整体风格关键词：

Nordic minimal / 北欧极简  
Clean SaaS / 清爽工具感  
Visual workspace / 视觉化工作区  
Soft UI / 柔和卡片  
Semantic icons / 语义化图标  
Light background / 明亮背景  
Clear hierarchy / 信息层级清晰  
Calm productivity / 安静高效的生产力工具  

需要保留的部分：

- 视觉化导图形式
- 节点之间的连接线
- 中央画布式布局
- 快速记录想法入口
- 顶部品牌栏
- 分类筛选
- 底部快捷操作
- 小地图 / minimap
- Exobrain 的轻微科技感和智能感

需要移除或弱化的部分：

- 不再使用星球作为项目主视觉
- 不再依赖复杂发光球体区分项目
- 不要让所有节点看起来像装饰元素
- 减少过强的宇宙感背景
- 不要让视觉效果影响信息识别

新的视觉方向：

- 项目使用项目卡片
- 不同节点使用不同类型图标
- 用状态标签表达进展
- 用轻微光晕增强层次，但不要过度装饰
- 用清晰连接线表达关系
- 用语义化颜色区分节点类型
- 形成统一的节点类型系统

## 三、核心节点视觉系统

整个产品的节点应该按照“类型”来区分，而不是主要靠颜色或装饰图形来区分。

节点类型建议统一为：

项目 = Project card  
想法 = Idea node  
任务 = Task node  
问题 = Issue node  
备注 = Note node  
已完成 = Completed node  

## 四、Project / 项目节点

项目节点代表一个工作空间、主题或项目容器。它不是一个普通想法，而是一个可以包含多个想法、任务、问题和资料的容器。

项目不再使用星球，而改为大号圆角矩形卡片。

项目卡片应该包含：

- 左侧项目图标
- 右侧项目名称
- 项目数据，例如 ideas / tasks / status
- 轻微紫色、蓝色或绿色光晕
- 细边框
- 选中状态下更明显的紫色边框
- 周围可以连接 2–3 个子节点

推荐项目图标：

Folder / 文件夹  
Box / 容器  
Layers / 层级  
Grid / 模块  
Book / 文档型项目  
Store / 商业项目  
Brain / AI 项目  
Printer / 硬件或制造项目  

项目节点示例：

[Folder icon] myr2d2  
4 ideas · 2 tasks · active  

[Cube icon] Skokartongen  
6 ideas · 4 tasks · active  

[Layers icon] Nordloop Framework  
4 ideas · 3 tasks · active  

项目节点样式建议：

Shape: Rounded rectangle  
Radius: 18px - 24px  
Background: #FFFFFF  
Border: #E8E5F6  
Shadow: Soft shadow  
Selected border: #8B5CF6  
Icon color: Purple  
Metadata color: Gray  
Status dot: Green / Blue / Gray / Red  

## 五、Idea / 想法节点

Idea 节点表示尚未完全确认、正在思考中的灵感或想法。它不一定马上执行，更像一个原始想法、待整理灵感或脑暴内容。

图标使用：

Lightbulb / 灯泡

颜色使用：

Yellow / Amber

示例：

💡 增加记事TAB  
💡 新手引导优化  
💡 用户调研分析  
💡 色彩校准算法  
💡 模型效果提升  

样式建议：

Shape: Small rounded pill / small rounded card  
Background: #FFFFFF  
Icon color: #F59E0B  
Border: #FDE68A or #E5E7EB  
Text color: #111827  

## 六、Task / 任务节点

Task 节点表示已经确认要执行的事项。Task 节点应该具有明确的执行属性，可以进入 Todo / Doing / Done 等状态。

图标使用：

Checkbox / Check square

颜色使用：

Blue

示例：

☑ 官网文案优化  
☑ 供应链对接  
☑ 数据集扩充  
☑ 视频教程制作  
☑ 架构重构计划  
☑ 材料兼容测试  

样式建议：

Shape: Small rounded card  
Background: #FFFFFF  
Icon color: #3B82F6  
Border: #DBEAFE or #E5E7EB  
Optional status pill: Todo / Doing / Done  

## 七、Issue / 问题节点

Issue 节点表示 bug、阻塞点、异常、风险或需要解决的问题。Issue 节点必须比普通节点更明显，让用户第一眼知道它需要关注。

图标使用：

Warning triangle / Alert triangle

颜色使用：

Red

示例：

⚠ 语音识别问题  
⚠ 支付流程问题  
⚠ 硬件故障告警  
⚠ 推送延迟问题  
⚠ 性能不稳定  

样式建议：

Shape: Small rounded card  
Background: #FFFFFF  
Icon color: #EF4444  
Border: #FECACA or #E5E7EB  
Optional light red tinted background: #FEF2F2  

## 八、Note / 备注节点

Note 节点表示资料、说明、文档、会议记录、FAQ、技术方案或补充信息。Note 节点不应该和任务混淆，它只是信息资料。

图标使用：

Document / Note / File text

颜色使用：

Gray

示例：

📄 会议记录模板  
📄 FAQ整理  
📄 技术方案文档  
📄 实验数据记录  
📄 文档站点搭建  

样式建议：

Shape: Small rounded card  
Background: #FFFFFF  
Icon color: #6B7280  
Border: #E5E7EB  
Text color: #374151  

## 九、Completed / 已完成节点

Completed 节点表示已经完成的任务或已经归档的想法。

图标使用：

Check circle / Check

颜色使用：

Green

样式建议：

Icon color: #22C55E  
Text color: #9CA3AF  
Opacity: 60% - 75%  
Optional status pill: Done  

## 十、状态系统

节点状态不要只靠图标表达，而要增加统一状态标识。

推荐状态：

Active = 进行中 / 活跃  
Planning = 计划中  
Paused = 暂停  
Blocked = 阻塞  
Done = 已完成  
Open = 未解决问题  
Todo = 待执行  
Doing = 执行中  

状态颜色：

Active = Green dot  
Planning = Blue dot  
Paused = Gray dot  
Blocked = Red dot  
Done = Green check  
Open = Red pill  
Todo = Blue-light pill  
Doing = Purple / Blue pill  

项目状态显示方式：

项目节点底部显示：

4 ideas · 2 tasks · active

其中 active 前面加绿色小圆点。

示例：

myr2d2  
4 ideas · 2 tasks · ● active  

## 十一、Cosmos / Overview 页面修改

Cosmos 页面是总览页，用于查看所有项目、想法、任务和问题的视觉化分布。

新的页面不再强调“宇宙星球”，而是强调：一个可视化的项目地图。

用户进入这个页面后，应该能快速看到：

- 有哪些项目
- 每个项目当前有多少想法和任务
- 哪些项目活跃
- 哪些项目有问题
- 每个项目最近有哪些关键节点

页面结构建议如下：

顶部导航栏  
↓  
分类筛选栏  
↓  
主画布 / 可视化项目地图  
↓  
底部快捷操作  
↓  
minimap  

## 十二、顶部导航栏

顶部导航栏保留当前结构，但视觉更轻、更清晰。

左侧：

Exobrain logo  
ALPHA badge  

中间：

快速输入 / 搜索框  
Placeholder: Capture a thought...  
Shortcut: ⌘K  

右侧：

用户头像  
用户邮箱  
Sign out  

## 十三、分类筛选栏

顶部下方增加或保留筛选 chips。

筛选项：

All  
Projects 8  
Ideas 27  
Tasks 18  
Issues 3  

对应图标：

All = Grid / All icon  
Projects = Folder icon  
Ideas = Lightbulb icon  
Tasks = Checkbox icon  
Issues = Warning icon  

样式：

Selected chip: Purple background, white text, soft shadow  
Normal chip: White background, light border, dark text  

## 十四、右上角视图控制

保留或新增：

Sort by  
Map view  
Grid view  
List view  

默认选中：

Map view

## 十五、主画布设计

主画布是核心区域，用来展示多个项目及其关联节点。

它应该像一个“项目地图”，而不是“星球宇宙”。

主画布视觉要求：

Background: very light gray / white  
Canvas feeling: clean and spacious  
Nodes: floating card style  
Connections: thin curved lines  
Glow: very subtle  
Animation: optional, not too much  

主画布中显示多个项目卡片，每个项目卡片周围连接 2–3 个子节点。

项目应分布在画布不同区域，避免集中在一起。

## 十六、Overview 页面项目示例

### 1. myr2d2

项目卡片：

[Folder icon] myr2d2  
4 ideas · 2 tasks · ● active  

连接子节点：

💡 增加记事TAB  
☑ 语音识别问题  
📄 会议记录模板  

### 2. Howtouse

项目卡片：

[Book icon] Howtouse  
5 ideas · 3 tasks · ● active  

连接子节点：

💡 新手引导优化  
☑ 视频教程制作  
📄 FAQ整理  

### 3. Skokartongen

项目卡片：

[Cube icon] Skokartongen  
6 ideas · 4 tasks · ● active  

连接子节点：

☑ 官网文案优化  
⚠ 支付流程问题  
💡 用户调研分析  

### 4. Glantan AI

项目卡片：

[Brain / Head icon] Glantan AI  
4 ideas · 2 tasks · ● active  

连接子节点：

💡 模型效果提升  
☑ 数据集扩充  
📄 技术方案文档  

### 5. Large-Scale Multi-Color 3D Printer

项目卡片：

[Printer icon] Large-Scale Multi-Color 3D Printer  
5 ideas · 3 tasks · ● active  

连接子节点：

💡 色彩校准算法  
☑ 材料兼容测试  
📄 实验数据记录  

### 6. 寿司自动售卖亭

项目卡片：

[Store icon] 寿司自动售卖亭  
3 ideas · 2 tasks · ● active  

连接子节点：

☑ 供应链对接  
💡 菜单界面设计  
⚠ 硬件故障告警  

### 7. Nordloop Framework

项目卡片：

[Layers icon] Nordloop Framework  
4 ideas · 3 tasks · ● active  

连接子节点：

☑ 架构重构计划  
📄 文档站点搭建  
💡 性能优化方案  

## 十七、连接线设计

节点之间的连接线要轻、清晰、不过度抢眼。

建议样式：

Line color: #D8D4E8  
Line width: 1px  
Line style: Curved line  
Arrow: Optional, very subtle  
Hover: Line becomes purple  
Selected: Line becomes stronger purple  

连接线原则：

- 项目卡片连接到子节点
- 不同项目之间默认不连接
- 子节点和项目之间的关系要清楚
- 不要出现太多交叉线
- 保持空间感和可读性

## 十八、底部操作区

底部中心按钮保留主要 CTA：

Capture a thought

样式：

Purple gradient  
Rounded pill  
Icon: Sparkle / Plus  
Shortcut: ⌘K  

点击后应支持快速输入：

输入想法  
选择所属项目  
选择节点类型：Idea / Task / Issue / Note  

底部左侧操作提示保留但做得更轻：

Click - Select project  
Scroll - Zoom  
Drag - Pan  

样式：

Small white panel  
Rounded corners  
Soft border  
Light gray text  

底部右侧保留 minimap。

功能：

显示当前画布位置  
显示节点分布  
支持缩放  
支持拖动视口  

按钮：

+  
-  
Fit / Center  

## 十九、项目详情 / Mindmap 页面修改

项目详情页是用户真正整理想法、拆解任务和推进项目的地方。

Overview 页面负责总览，项目详情页负责执行。

项目详情页结构：

顶部导航栏  
↓  
Breadcrumb: Back / Projects / myr2d2  
↓  
项目状态卡片  
↓  
视图切换：Mindmap / Board / Timeline  
↓  
主导图区域  
↓  
右侧节点详情面板  
↓  
底部 Add node 工具栏  

进入项目后，不再使用星球中心节点。

中心节点改为：

[Folder icon] myr2d2  
Project  

样式：

Large rounded card  
Purple border when selected  
Project badge  

项目详情页从中心项目节点向右分支：

Ideas  
Tasks  
Issues  
Completed  
Notes  

示例结构：

myr2d2  
├── Ideas  
│   ├── 增加记事TAB  
│   ├── 如何实现能够主动发消息提醒日程  
│   ├── 预约增加地点，包括地图直接导航链接  
│   └── 语音识别功能有问题  
│  
├── Tasks  
│   ├── 提醒策略定义       Todo  
│   └── 添加导航按钮       Doing  
│  
├── Issues  
│   └── 语音输入排查       Open  
│  
├── Completed  
│   └── 增加记事TAB（草案） Done  
│  
└── Notes  
    └── 用户希望更快收到提醒  

## 二十、项目状态卡片

项目详情页左上可以有一个项目状态卡片。

示例：

myr2d2  
Last updated · 4 mins ago · tomyangse  

4 ideas  
2 tasks  
1 issue  
Active  

样式：

White card  
Rounded corners  
Project icon on left  
Project title  
Metadata  
Status chips  

## 二十一、视图切换

项目详情页顶部中间建议增加视图切换：

Mindmap  
Board  
Timeline  

默认选中：

Mindmap

Mindmap 用于整理想法结构。  
Board 用于任务执行管理。  
Timeline 用于查看时间安排和计划。  

Board 建议列：

Inbox  
Todo  
Doing  
Done  

## 二十二、右侧详情面板

当用户点击某个节点时，右侧显示详情。

示例：点击“增加记事TAB”

Title: 增加记事TAB  
Type: Idea  

Description:  
在应用中增加独立的记事TAB，支持快速记录想法与待办事项。  

Status: Active  
Priority: Medium  
Due date: 2026-04-29  
Tags: + Add tag  

Action buttons:

Convert to task  
AI breakdown  
Add reminder  
Move to project  

右侧面板设计：

Width: 320px - 380px  
Background: #FFFFFF  
Border: #E5E7EB  
Radius: 20px  
Shadow: Soft shadow  

## 二十三、底部 Add node 工具栏

项目详情页底部中间建议使用浮动工具栏。

内容：

+ Add node  
Idea  
Task  
Issue  
Note  
AI  

样式：

Dark floating bar or white floating bar  
Rounded pill  
Soft shadow  
Primary Add node button in purple  

## 二十四、图标规范

建议统一使用线性图标库，例如：

Lucide Icons  
Heroicons  
Phosphor Icons  

推荐图标映射：

Project = Folder / Box / Layers  
Idea = Lightbulb  
Task = CheckSquare  
Issue = AlertTriangle  
Note = FileText  
Decision = GitBranch / Diamond  
Milestone = Flag  
AI action = Sparkles  
Search = Search  
Capture = Plus / Sparkles  
User = Circle avatar  
Board = Columns  
Timeline = Calendar / Timeline  
Map view = Network  
Grid view = LayoutGrid  
List view = List  

## 二十五、颜色规范建议

主色：

Primary Purple: #7C3AED  
Primary Light: #EDE9FE  
Primary Border: #C4B5FD  
Primary Hover: #6D28D9  

节点类型颜色：

Project: Purple  
Idea: Amber / Yellow  
Task: Blue  
Issue: Red  
Note: Gray  
Done: Green  

具体颜色：

Idea icon: #F59E0B  
Task icon: #3B82F6  
Issue icon: #EF4444  
Note icon: #6B7280  
Done icon: #22C55E  
Active dot: #10B981  

背景颜色：

Page background: #F8FAFC  
Canvas background: #FAFBFF  
Card background: #FFFFFF  
Border: #E5E7EB  
Text primary: #111827  
Text secondary: #6B7280  
Text muted: #9CA3AF  

## 二十六、卡片尺寸建议

Project card:

Width: 220px - 280px  
Height: 72px - 96px  
Border radius: 20px  
Padding: 16px - 20px  
Icon size: 32px - 40px  

Child node:

Width: auto  
Min height: 40px  
Padding: 10px 14px  
Border radius: 12px  
Icon size: 16px - 18px  

Filter chip:

Height: 40px - 44px  
Border radius: 12px  
Padding: 0 14px  

Right inspector panel:

Width: 320px - 380px  
Border radius: 20px  
Padding: 20px - 24px  

## 二十七、交互建议

Hover 状态：

项目卡片 hover 时：

Border becomes purple  
Shadow slightly stronger  
Cursor pointer  

子节点 hover 时：

Background slightly tinted  
Show small quick action icon  

Click 状态：

点击项目卡片：进入项目详情页  
点击子节点：打开右侧详情面板  

Double click：

双击画布空白处：快速添加节点  

Drag：

支持拖动项目卡片和子节点。

拖动时：

显示轻微阴影  
连接线实时更新  

Keyboard shortcut：

⌘K / Ctrl K = 快速输入  
N = 新建节点  
Esc = 关闭面板 / 返回  
Delete = 删除选中节点  

## 二十八、AI 功能入口

AI 不应该只是聊天入口，而应该直接服务于“想法转行动”。

建议在节点详情中提供：

AI breakdown  
AI summarize  
AI prioritize  
AI next step  

AI breakdown 用于把一个想法拆成多个任务。

示例：

想法：预约增加地点，包括地图直接导航链接

AI 拆解：

1. 数据库增加 location 字段
2. 前端预约表单增加地点输入
3. 支持 Google Maps 链接
4. 详情页显示导航按钮
5. 移动端测试

AI prioritize 用于根据价值和难度给优先级建议。  
AI next step 用于告诉用户当前项目下一步最应该做什么。  

## 二十九、本次最重要的改动总结

原来：

项目 = 星球  
想法 / 任务 / 问题区分不够明显  
整体更偏视觉概念  

修改后：

项目 = 语义化项目卡片  
想法 = 灯泡节点  
任务 = checkbox 节点  
问题 = warning 节点  
备注 = document 节点  
整体更偏清晰工具型 SaaS  

## 三十、最终目标

本次 UI 修改后的 Exobrain 应该表达：

这是一个把想法变成行动的视觉化工作台。

用户看到界面后，应该能快速理解：

哪些是项目  
哪些是想法  
哪些已经变成任务  
哪些是问题  
哪些是备注资料  
每个项目当前处于什么状态  
下一步可以做什么  

## 三十一、一句话设计原则

星球可以作为品牌语言，但核心节点必须使用清晰的语义化图标和卡片系统。

## 三十二、给前端的最终执行重点

必须修改：

1. Overview 页面项目节点从星球改为圆角项目卡片
2. 所有节点增加类型图标
3. 项目节点显示 metadata：ideas / tasks / status
4. 子节点使用不同图标和颜色区分 Idea / Task / Issue / Note
5. 保留连接线，但降低视觉干扰
6. 保留顶部搜索、分类筛选、底部 capture 按钮和 minimap
7. 项目详情页使用相同的节点系统

可以暂缓：

1. 复杂动画
2. 复杂背景粒子
3. 过度拟物化视觉
4. 过多节点类型
5. 复杂团队协作功能

## 三十三、参考页面结构总结

Overview 页面结构：

Header  
Filter chips  
Visual project map  
Floating project cards  
Connected child nodes  
Bottom capture CTA  
Canvas control hints  
Minimap  

Project detail 页面结构：

Header  
Breadcrumb  
Project status card  
Mindmap / Board / Timeline tabs  
Structured mindmap  
Right inspector panel  
Bottom Add node toolbar  
Minimap / zoom controls  

## 三十四、产品表达方向

Exobrain 不应该只是一个漂亮的导图工具，而应该是：

Idea-to-Action Visual Workspace

中文理解：

从想法到行动的视觉化工作台

产品核心体验应该是：

快速记录想法  
↓  
自动归类  
↓  
转化为任务  
↓  
AI 拆解  
↓  
进入执行状态  
↓  
持续推进项目
