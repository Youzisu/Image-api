# Photos API - 本地存储版本

基于 Node.js + Express 的照片管理 API，使用 JSON 文件作为数据存储，无需数据库。

## 🚀 快速开始

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装步骤
```bash
# 1. 克隆项目
git clone <repository-url>
cd photos-api

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，修改相关配置

# 4. 启动服务
npm run dev  # 开发模式
# 或
npm start    # 生产模式
