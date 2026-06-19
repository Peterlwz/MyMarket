# Nest Market / 卖东西应用

> React Native + Expo mobile app prototype for second-hand trading and rental sublease listings.  
> 一个面向二手商品交易和转租信息发布的移动端原型。

**Current stage:** Local MVP + Supabase Backend MVP Phase 1 / Expo mobile app prototype  
**Data mode:** 默认 `local`，可在 `src/config/appConfig.ts` 切换到 `remote`。

## Table of Contents

- [Project Overview / 项目简介](#project-overview--项目简介)
- [Core Features / 核心功能](#core-features--核心功能)
- [Tech Stack / 技术栈](#tech-stack--技术栈)
- [Supabase Backend MVP](#supabase-backend-mvp)
- [Project Structure / 项目目录结构](#project-structure--项目目录结构)
- [Quick Start / 快速开始](#quick-start--快速开始)
- [Common Commands / 常用命令](#common-commands--常用命令)
- [Development Status / 开发状态](#development-status--开发状态)
- [Data Flow / 数据说明](#data-flow--数据说明)
- [Main Data Models / 主要数据模型](#main-data-models--主要数据模型)
- [Design Principles / 设计原则](#design-principles--设计原则)
- [Limitations / 限制与注意事项](#limitations--限制与注意事项)
- [Roadmap / 后续路线图](#roadmap--后续路线图)
- [Verification / 验证记录](#verification--验证记录)
- [Contribution Notes / 贡献与开发说明](#contribution-notes--贡献与开发说明)

## Project Overview / 项目简介

Nest Market / 卖东西应用是一个二手商品 + 转租信息发布 App 原型。当前项目默认仍以本地 Local MVP 验证移动端核心交易流程；同时已加入 Supabase Backend MVP 第一阶段接入层，可切换到 remote 模式验证 Auth、listings、listing images 和 favorites。

当前仍不做真实支付、真实担保交易、内容审核系统、地图、推送通知、实时聊天和举报系统。

核心用户场景包括：

- 浏览二手商品
- 浏览转租信息
- 按分类筛选
- 搜索商品或房源
- 发布普通商品
- 发布转租信息
- 收藏内容
- 查看详情
- 本地模拟聊天
- 管理自己的发布

## Core Features / 核心功能

### 1. 首页 / Home

- 顶部欢迎语和搜索框
- 横向分类入口
- 两列信息流
- 普通商品卡片：突出价格
- 转租卡片：突出月租、区域、房型，并展示“转租”标签
- 收藏按钮
- 无搜索结果时显示空状态：“没有找到相关内容”

### 2. 分类页 / Categories

- 分类筛选
- 搜索 + 分类筛选同时生效
- 支持分类：全部、转租、数码、家具、家电、服饰、图书、生活用品、票券、其他
- 分类和搜索组合后无结果时显示空状态

### 3. 发布页 / Publish

- 支持普通商品发布
- 支持转租信息发布
- 类型切换后，表单字段会随类型变化
- 普通商品字段：标题、价格、分类、成色、位置、描述、图片
- 转租字段：标题、月租、区域、房型、可入住时间、租期、描述、图片
- 使用手机相册选择图片，最多 6 张
- 如果不选择图片，会使用默认占位图
- 已选图片支持横向预览和删除
- 提交前有发布预览
- 点击“确认发布”后才写入当前 dataMode 对应的数据源：local 模式写入本地状态和 AsyncStorage，remote 模式写入 Supabase
- 发布成功后跳转首页，并显示轻提示：“发布成功”

### 4. 详情页 / Listing Detail

- 普通商品详情：价格、成色、分类、位置、描述
- 转租详情：月租、区域、房型、可入住时间、租期、描述
- 图片展示
- 收藏 / 取消收藏
- 底部固定操作栏
- 普通商品联系按钮：“我想要”
- 转租联系按钮：“咨询转租”
- 状态标签：可咨询、已预留、已出、已下架
- 交易安全提醒：线下见面、不要提前转账、转租核实房东/合同/押金信息、平台当前不提供担保交易

### 5. 收藏 / Favorites

- 支持收藏 / 取消收藏
- 首页卡片和详情页都可切换收藏状态
- 我的页面展示“我的收藏”
- local 模式收藏 ID 持久化到 AsyncStorage
- remote 模式收藏同步到 Supabase `favorites`

### 6. 我的页面 / Profile

- 我的发布
- 我的收藏
- 发布管理入口
- 交易提醒卡片
- 已下架内容不会出现在首页和分类页，但仍可在我的发布中看到

### 7. 发布管理 / Listing Management

我的发布支持以下管理操作：

- 编辑
- 改价 / 改月租
- 标记为已预留
- 标记为已出
- 下架
- 删除

删除发布内容时，会从我的发布、首页、分类、收藏中同步消失；如果该发布使用了 App 管理的本地图片文件，也会清理对应图片文件。

### 8. 消息 / Local Messages

- 本地会话列表
- 本地聊天详情
- 详情页点击“我想要 / 咨询转租”后创建或打开本地会话
- 同一 listing 不重复创建会话
- 创建会话时自动发送一条“我的消息”
- 支持发送本地消息
- 支持模拟自动回复

Important: 当前消息功能是 local mock chat，不是真实 IM，不支持实时通信、推送、在线状态或跨设备同步。

### 9. 本地持久化 / Local Persistence

当前本地持久化内容：

| Data | Storage |
| --- | --- |
| listings | AsyncStorage key: `nest-market:local-listings:v1` |
| favorites | AsyncStorage key: `nest-market:favorite-listing-ids:v1` |
| conversations | AsyncStorage key: `nest-market:conversations:v1` |
| messages | AsyncStorage key: `nest-market:messages:v1` |
| images | Local file system: `FileSystem.documentDirectory/listing-images/` |

## Tech Stack / 技术栈

根据当前 `package.json`：

- Expo `~54.0.0`
- React Native `0.81.5`
- React `19.1.0`
- Expo Router `~6.0.24`
- TypeScript `^5.9.3`
- `@react-native-async-storage/async-storage`
- `@supabase/supabase-js`
- `expo-image-picker`
- `expo-file-system`
- `react-native-url-polyfill`
- `@expo/vector-icons`
- `@react-navigation/native`
- `react-native-gesture-handler`
- `react-native-reanimated`
- `react-native-safe-area-context`
- `react-native-screens`
- `expo-constants`
- `expo-font`
- `expo-linking`
- `expo-status-bar`
- `react-native-worklets`

## Supabase Backend MVP

为什么选择 Supabase：

- Auth、Postgres、Storage 和 RLS 在一个平台内，适合快速验证二手交易/转租 App 的后端 MVP。
- 前端可以先通过 service 层接入 Supabase，未来仍可替换成 Firebase 或 REST API。
- RLS 可以在 MVP 阶段先保证基础数据访问边界。

### 配置方式

1. 创建 Supabase project。
2. 在项目根目录创建 `.env`，参考 `.env.example`：

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

3. 不要提交真实 `.env`，不要把真实 Supabase key 写进 README。
4. 在 Supabase SQL editor 中运行：

```text
docs/supabase-schema.sql
```

5. 将 `src/config/appConfig.ts` 从：

```ts
export const appConfig = {
  dataMode: "local" as "local" | "remote"
} as const;
```

切换为：

```ts
export const appConfig = {
  dataMode: "remote" as "local" | "remote"
} as const;
```

### Remote 模式当前支持

- Supabase Auth 邮箱密码注册、登录、退出
- 公开 listings 读取
- 当前用户自己的 listings 读取，包括 `removed`
- 创建商品 / 转租 listing
- 编辑 listing
- 改价 / 改月租
- 状态更新：`active` / `reserved` / `sold` / `removed`
- 删除 listing
- Supabase Storage public bucket: `listing-images`
- `listing_images` 图片记录
- 收藏 / 取消收藏同步到 Supabase `favorites`

### Remote 模式当前未支持

- conversations / messages 仍然是本地模拟聊天，不是真实 IM
- 不支持实时聊天、在线状态、消息推送
- 不支持真实支付
- 不支持担保交易
- 不支持真实身份认证
- 不支持内容审核系统
- 不支持举报系统
- 不支持地图
- 不支持推送通知

### Supabase 文件位置

- Supabase client: `src/lib/supabase.ts`
- Supabase schema and RLS: `docs/supabase-schema.sql`
- Remote services: `src/services/remote/*`
- Local services: `src/services/local/*`
- Service switch: `src/services/index.ts`

## Project Structure / 项目目录结构

```text
.
├── app.json
├── babel.config.js
├── package.json
├── tsconfig.json
├── docs
│   └── supabase-schema.sql # Supabase tables, RLS policies, Storage bucket
└── src
    ├── app                 # Expo Router routes: tabs, detail, edit, chat
    ├── components          # Shared UI components and listing cards
    ├── config              # App config, including local data mode
    ├── data                # Initial mock data and categories
    ├── lib                 # Supabase client
    ├── services            # Backend-ready service layer over local storage
    ├── state               # React Context state providers
    ├── storage             # AsyncStorage and local file-system adapters
    ├── theme               # Colors, spacing, typography, shadows
    ├── types               # Listing, message, and API-facing types
    └── utils               # Listing filters, images, status, time helpers
```

主要目录说明：

- `src/app`: Expo Router 页面，包括首页、分类页、发布页、消息页、我的页面、详情页、编辑页、聊天页。
- `src/components`: 卡片、搜索框、空状态、状态标签、分区标题等通用组件。
- `src/state`: `ListingsContext` 和 `MessagesContext`，负责运行时状态。
- `src/services`: `listingService`、`favoriteService`、`messageService`、`imageService`，为未来接 Supabase / Firebase / REST API 做准备。
- `src/storage`: 当前 AsyncStorage 和本地图片文件读写实现。
- `src/types`: 业务类型和未来 API input 类型。
- `src/utils`: 搜索筛选、图片兜底、状态标签、时间展示等工具。
- `src/config`: 当前包含 `appConfig.dataMode = "local"`。
- `src/lib`: Supabase client 初始化。
- `src/data`: 初始 mock listings 和分类数据。
- `docs/supabase-schema.sql`: Supabase 表结构、RLS 策略和 Storage bucket SQL。
- `assets`: 当前项目未发现独立 `assets/` 目录。

## Quick Start / 快速开始

### 1. 安装依赖

```bash
npm install
```

当前项目未发现必须使用 `--legacy-peer-deps` 的配置。若本机环境出现 peer dependency 冲突，再尝试：

```bash
npm install --legacy-peer-deps
```

### 2. 启动 Expo

```bash
npx expo start -c
```

### 3. 运行方式

- Expo Go 扫码运行
- iOS Simulator
- Android Emulator
- Web preview: 可尝试 `npm run web`，但当前项目主要面向 iOS / Android 移动端体验

## Common Commands / 常用命令

当前 `package.json` 中可用脚本：

```bash
npm run typecheck
npm run dev
npm start
npm run ios
npm run android
npm run web
```

常用 Expo 命令：

```bash
npx expo start -c
npx expo install --check
```

当前 `package.json` 没有 `lint` 脚本。

## Development Status / 开发状态

| Status | Item | Notes |
| --- | --- | --- |
| Done | 本地发布闭环 | 发布后写入 Context 和 AsyncStorage |
| Done | 图片选择和本地保存 | 使用 `expo-image-picker` 和 `expo-file-system` |
| Done | 收藏闭环 | 收藏 ID 本地持久化 |
| Done | 搜索筛选 | 首页和分类页支持关键词搜索 |
| Done | 发布管理 | 编辑、改价/改月租、预留、已出、下架、删除 |
| Done | 本地聊天模拟 | 本地会话、本地消息、模拟自动回复 |
| Done | UI 打磨 | 卡片、状态、空状态、详情底部栏等 |
| Done | Supabase Phase 1 接入 | Auth、listings、listing_images、favorites |
| Done | local / remote service 切换 | 默认 local，`appConfig.dataMode` 可切 remote |
| Done | TypeScript 校验 | `npm run typecheck` 通过 |
| Not done | 完整线上后端 | Remote 目前只是 Supabase MVP 第一阶段 |
| Not done | 完整用户体系 | 只有 Supabase 邮箱密码 Auth，未做资料页和身份认证 |
| Not done | 真实支付 | 未接支付渠道 |
| Not done | 真实聊天 | 当前 conversations/messages 仍是本地模拟 |
| Not done | 内容审核 | 未做真实审核流程 |
| Not done | 举报系统 | 未实现 |
| Not done | 地图 | 未实现位置地图能力 |
| Not done | 推送通知 | 未实现 |
| Not done | App Store / Google Play 发布 | 未上架 |

## Data Flow / 数据说明

Local 模式数据流：

1. 初始 mock 数据来自 `src/data/mock.ts`。
2. 运行时 listings 和 favorites 由 `ListingsContext` 管理。
3. 运行时 conversations 和 messages 由 `MessagesContext` 管理。
4. Context 调用 `src/services/*`，UI 不直接读写 AsyncStorage。
5. Service 层当前仍然使用 `src/storage/*` 读写本地数据。
6. listings、favorites、conversations、messages 通过 AsyncStorage 持久化。
7. 用户选择的图片会复制到 App 本地文件目录 `listing-images/`，listing 中保存长期可读取的本地 URI。
8. 删除发布时，会清理 App 管理的本地图片文件。
9. Service 层已拆成 local / remote，便于继续替换或扩展后端。

Remote 模式数据流：

1. Auth session 由 Supabase Auth 管理，并通过 AsyncStorage 持久化。
2. 首页和分类页读取 Supabase `listings` + `listing_images`。
3. 我的发布读取当前登录用户自己的 Supabase listings。
4. 发布时先创建 `listings`，再上传图片到 Supabase Storage bucket `listing-images`，再写入 `listing_images`。
5. 收藏写入 Supabase `favorites`。
6. messages/conversations 暂时仍是本地 mock，不写 Supabase。

当前配置：

```ts
export const appConfig = {
  dataMode: "local" as "local" | "remote"
} as const;
```

## Main Data Models / 主要数据模型

以下模型以当前代码中的 `src/types` 为准。

### Listing

`Listing` 分为普通商品和转租信息：

- `ProductListing`
- `RentListing`

共同基础字段：

- `id`
- `type`: `"product"` 或 `"rent"`
- `title`
- `categoryId`
- `description`
- `image`
- `images?`
- `liked`
- `location`
- `postedAt`
- `seller`
- `status`

普通商品字段：

- `price`
- `originalPrice?`
- `condition`: `"几乎全新"` / `"轻微使用"` / `"正常使用"`
- `pickupMethod`: `"自提"` / `"可配送"`

转租字段：

- `monthlyRent`
- `district`
- `roomType`
- `availableFrom`
- `leaseTerm`

运行时使用的 `StoredListing` 额外包含：

- `createdAt`
- `updatedAt`
- `ownerId`: local 模式为 `"local-user"`，remote 模式为 Supabase user id

### ListingType

```ts
type ListingType = "product" | "rent";
```

### ListingStatus

```ts
type ListingStatus = "active" | "reserved" | "sold" | "removed";
```

状态含义：

- `active`: 在售 / 可咨询
- `reserved`: 已预留
- `sold`: 已出
- `removed`: 已下架

### Conversation

- `id`
- `listingId`
- `listingTitle`
- `listingImage`
- `listingType`
- `otherUserName`
- `lastMessage`
- `lastMessageAt`
- `unreadCount`

### Message

- `id`
- `conversationId`
- `senderType`: `"me"` 或 `"other"`
- `text`
- `createdAt`

### Favorite IDs

收藏以 listing id 数组保存：

```ts
type FavoriteIds = Array<string>;
```

## Design Principles / 设计原则

- Mobile-first，优先保证手机端使用体验。
- 卡片式信息流，方便快速浏览。
- 普通商品和转租信息视觉区分明确。
- 商品突出价格，转租突出月租、区域、房型和入住时间。
- 详情页提供交易安全提醒。
- 不复制闲鱼品牌元素、logo、文案或配色。
- 当前定位是可操作原型，不是完整生产系统。

## Limitations / 限制与注意事项

- 当前仍是 MVP / prototype，不是完整生产系统。
- local 模式下，不同设备之间数据不互通。
- local 模式下，卸载 App 或清除 App 数据可能会清除本地数据。
- remote 模式已接入 Supabase Phase 1，但还不是完整线上交易系统。
- 本地聊天不是实时通信，不是真实 IM。
- 当前只有 Supabase 邮箱密码登录注册，没有完整用户资料、真实身份认证或信用体系。
- 当前没有真实支付。
- 当前没有交易担保。
- 当前没有真实内容审核和风控。
- 当前不能用于真实交易生产环境。

## Roadmap / 后续路线图

- P7: services 层整理，为后端接入做准备。已完成。
- P8: 接 Supabase / Firebase / REST API。Supabase Phase 1 已完成，后续继续补完整线上能力。
- P9: 登录注册和真实用户体系。
- P10: 图片云存储。
- P11: 真实聊天或消息系统。
- P12: 举报、审核、安全合规。
- P13: EAS Build / TestFlight / Android 内测。
- P14: App Store / Google Play 上架准备。

## Verification / 验证记录

最近验证：

- `npm run typecheck`: 通过
- `package.json`: 没有 `lint` 脚本，所以未运行 lint

## Contribution Notes / 贡献与开发说明

- 遵循 TypeScript 类型，先更新类型再改业务逻辑。
- 修改 listing、conversation、message 等数据结构时，同步检查 `src/types`、`src/services`、`src/storage`、`src/state`。
- 新功能优先保持本地 mock / local MVP 可用，再考虑远端化。
- UI 层不要直接读写 AsyncStorage；通过 service 层调用。
- 图片相关逻辑优先放在 `imageService` 和 `storage/images.ts`。
- 不要在 README 或代码中写入真实密钥、token、账号密码等敏感信息。
