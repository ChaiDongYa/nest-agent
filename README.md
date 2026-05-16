<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">用于构建高效、可扩展服务端应用的渐进式 <a href="http://nodejs.org" target="_blank">Node.js</a> 框架。</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## 项目简介

基于 [NestJS](https://nestjs.com) + [Prisma 7](https://www.prisma.io) + PostgreSQL 的 TypeScript 后端项目，提供用户与文章的 REST API。

技术栈：NestJS 11、Prisma 7、PostgreSQL、`@prisma/adapter-pg`。

## 环境要求

- Node.js 18+
- pnpm
- PostgreSQL（本地或远程）

## 项目安装

```bash
pnpm install
```

安装时会自动执行 `prisma generate` 生成数据库客户端。

复制并配置环境变量（参考 `.env`）：

```env
DATABASE_URL="postgresql://用户名@localhost:5432/nestAgent?schema=public"
PORT=8051
```

## Prisma 建表指南

本项目使用 **Prisma 7** + **PostgreSQL**。Prisma 不会手写 SQL 建表，而是：**在 `schema.prisma` 里定义模型 → 生成迁移 SQL → 在数据库里执行迁移**。

### 配置在哪里

| 文件 | 作用 |
|------|------|
| `.env` | 数据库连接串，`DATABASE_URL` 中的库名即 PostgreSQL 数据库名（当前为 `nestAgent`） |
| `prisma.config.ts` | Prisma 7 配置，读取 `DATABASE_URL`，指定迁移目录 |
| `prisma/schema.prisma` | 表结构定义（`model`），如 `User` → `users` 表、`Post` → `posts` 表 |
| `prisma/migrations/` | 每次迁移生成的 SQL 文件，由 Prisma 自动维护 |

连接串示例：

```env
DATABASE_URL="postgresql://用户名@localhost:5432/nestAgent?schema=public"
```

### 概念说明

- **数据库**（如 `nestAgent`）：PostgreSQL 里的一个库，在 `.env` 的 URL 里配置。
- **表**（如 `users`、`posts`）：由 `schema.prisma` 里的 `model` 定义，通过迁移创建。
- `@@map("users")` 表示模型 `User` 映射到表名 `users`。

### 第一次使用（新环境 / 新库）

**1. 创建 PostgreSQL 数据库**（只需做一次）

```bash
# macOS Homebrew 安装的 PostgreSQL
createdb -U 你的用户名 nestAgent

# 或用 psql（库名含大写时需加引号）
psql -U 你的用户名 -d postgres -c 'CREATE DATABASE "nestAgent";'
```

**2. 安装依赖并生成 Prisma Client**

```bash
pnpm install          # 会自动执行 postinstall → prisma generate
# 或手动：
npx prisma generate
```

**3. 执行迁移，在库里建表**

```bash
npx prisma migrate deploy
```

成功后 `nestAgent` 库中会有：

- `users` — 用户表
- `posts` — 文章表
- `_prisma_migrations` — Prisma 迁移记录（勿手动删）

**4. 验证表是否创建**

```bash
psql -U 你的用户名 -d nestAgent -c "\dt"
```

### 修改模型后如何建新表 / 新字段

**1. 编辑** `prisma/schema.prisma`，例如新增字段：

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  // phone String?  ← 新增字段示例
  ...
}
```

**2. 生成并应用迁移（开发环境）**

```bash
npx prisma migrate dev --name add_user_phone
```

该命令会：

1. 根据 schema 变更生成 `prisma/migrations/xxxx_xxx/migration.sql`
2. 在数据库执行 SQL（`ALTER TABLE` / `CREATE TABLE` 等）
3. 重新生成 Client 到 `src/generated/prisma`

**3. 生产或已有库只应用迁移**

```bash
npx prisma migrate deploy
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `npx prisma generate` | 根据 schema 生成 TypeScript Client（改 schema 后需执行） |
| `npx prisma migrate dev --name 描述` | 开发：生成迁移 + 执行 + 生成 Client |
| `npx prisma migrate deploy` | 仅执行已有迁移（部署、换库后） |
| `npx prisma migrate status` | 查看迁移是否已应用 |
| `npx prisma studio` | 可视化查看/编辑数据 |
| `npx prisma db pull` | 从已有数据库反向生成 schema（慎用，会覆盖 schema） |

### 换数据库名

1. 修改 `.env` 中 `DATABASE_URL` 的库名，例如 `/nestAgent` → `/my_db`
2. 在 PostgreSQL 中创建新库：`createdb my_db`
3. 执行：`npx prisma migrate deploy`

### 与 NestJS 的关系

- 运行时通过 `PrismaService` 访问数据库，连接串来自 `process.env.DATABASE_URL`（`main.ts` 已加载 `dotenv`）。
- Client 生成路径：`src/generated/prisma`（见 `schema.prisma` 中 `output`），**不要手动改生成代码**。
- 改表结构后务必：`migrate dev` 或 `migrate deploy` + `prisma generate`（`migrate dev` 会自动 generate）。

### 当前表结构（init 迁移）

详见 `prisma/migrations/20260516042336_init/migration.sql`：

- **users**：`id`, `email`(唯一), `name`, `password`, `role`, `createdAt`, `updatedAt`
- **posts**：`id`, `title`, `content`, `published`, `authorId`, `createdAt`, `updatedAt`（外键关联 `users.id`）

## NestJS 使用指南

### 目录结构

```
src/
├── main.ts              # 入口，加载 .env，启动 HTTP 服务（默认 8051）
├── app.module.ts        # 根模块，注册各功能模块
├── prisma/              # Prisma 连接封装（PrismaModule / PrismaService）
├── user/                # 用户模块（Controller + Service + DTO）
├── post/                # 文章模块
├── deme/                # 示例 Demo 模块
└── generated/prisma/    # Prisma 自动生成的 Client（勿手改）
```

### 核心概念

| 概念 | 说明 |
|------|------|
| **Module** | 组织代码的单元，在 `app.module.ts` 的 `imports` 中引入 |
| **Controller** | 处理 HTTP 路由，如 `@Controller('user')` |
| **Service** | 业务逻辑，通过构造函数注入到 Controller |
| **Provider** | 可被注入的类，在模块的 `providers` 中注册 |

模块注册示例（Controller 只写在各自模块内，不要在 `AppModule` 重复注册）：

```typescript
@Module({
  imports: [PrismaModule, UserModule, PostModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 启动与构建

```bash
# 开发（单次启动）
pnpm run start

# 开发（热重载，推荐）
pnpm run start:dev

# 调试模式
pnpm run start:debug

# 编译
pnpm run build

# 生产运行（需先 build）
pnpm run start:prod
```

启动成功后默认地址：`http://localhost:8051`（可通过环境变量 `PORT` 修改）。

### 常用脚本

| 命令 | 说明 |
|------|------|
| `pnpm run start:dev` | 开发模式，文件变更自动重启 |
| `pnpm run build` | 编译到 `dist/` |
| `pnpm run lint` | ESLint 检查并自动修复 |
| `pnpm run format` | Prettier 格式化代码 |
| `pnpm run test` | 单元测试 |
| `pnpm run test:e2e` | 端到端测试 |
| `pnpm run test:cov` | 测试覆盖率 |

### API 接口

**用户**（`/user`）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/user/create` | 创建用户 |
| GET | `/user/list` | 分页列表，支持 `?page=&pageSize=&name=&role=` |
| GET | `/user/:id` | 查询单个用户（含文章） |
| PUT | `/user/:id` | 更新用户 |
| DELETE | `/user/:id` | 删除用户 |

创建用户请求体示例：

```json
{
  "name": "张三",
  "email": "zhang@example.com",
  "password": "123456",
  "role": "user"
}
```

**文章**（`/post`）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/post/create` | 创建文章（需已有用户） |

请求体示例：

```json
{
  "title": "标题",
  "content": "正文内容",
  "published": false,
  "authorId": 1
}
```

**其他**

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/getHello` | 根路由健康检查 |
| GET | `/demo/hello` 等 | Demo 模块示例接口 |

### 新增功能模块

```bash
# 使用 Nest CLI 生成模块（可选）
nest g module 模块名
nest g controller 模块名
nest g service 模块名
```

手动步骤：

1. 在 `src/` 下创建 `xxx/xxx.module.ts`，注册 `controllers` 与 `providers`
2. 需要数据库时 `imports: [PrismaModule]`
3. 在 `app.module.ts` 的 `imports` 中加入 `XxxModule`
4. **不要**在 `AppModule` 里重复声明子模块的 Controller

### 依赖注入注意

- `PostService`、`UserService` 等只在各自模块的 `providers` 中注册。
- `PrismaModule` 已 `exports: [PrismaService]`，子模块 `imports: [PrismaModule]` 即可注入。
- 确保 `main.ts` 顶部有 `import 'dotenv/config'`，否则读不到 `.env` 中的 `DATABASE_URL`。

## 测试

```bash
# 单元测试
pnpm run test

# 监听模式
pnpm run test:watch

# 端到端测试
pnpm run test:e2e

# 覆盖率
pnpm run test:cov
```

## 部署

生产环境建议流程：

1. 配置生产环境 `DATABASE_URL`
2. `pnpm install`
3. `npx prisma migrate deploy`
4. `pnpm run build`
5. `pnpm run start:prod`

更多部署说明见 [NestJS 官方部署文档](https://docs.nestjs.com/deployment)。

也可使用官方云平台 [Mau](https://mau.nestjs.com) 一键部署到 AWS：

```bash
pnpm install -g @nestjs/mau
mau deploy
```

## 相关资源

- [NestJS 中文文档](https://docs.nestjs.com)（官网支持多语言）
- [NestJS 常见问题](https://docs.nestjs.com/faq/common-errors)
- [Prisma 文档](https://www.prisma.io/docs)
- [Discord 社区](https://discord.gg/G7Qnnhy)
- [视频课程](https://courses.nestjs.com/)
- [NestJS Devtools](https://devtools.nestjs.com)

## 许可证

本项目基于 NestJS 脚手架，NestJS 采用 [MIT 许可证](https://github.com/nestjs/nest/blob/master/LICENSE)。
