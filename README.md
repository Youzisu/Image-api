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

## 📋 API 文档
# 用户相关
POST /api/users/register - 用户注册
POST /api/users/login - 用户登录
GET /api/users/profile - 获取用户信息
# 照片相关
GET /api/photos - 获取照片列表
GET /api/photos/random - 获取随机照片
POST /api/photos - 创建照片
PUT /api/photos/:id - 更新照片
DELETE /api/photos/:id - 删除照片
# Web 页面
GET / - 首页
GET /random - 随机照片页面
GET /admin/dashboard.html - 管理后台
GET /admin/login.html - 登录页面
## 🎯 项目特性
✅ 零数据库依赖
✅ JWT 身份认证
✅ 文件上传支持
✅ 分页和过滤
✅ 随机照片 API
✅ Web 管理界面
✅ RESTful API 设计
📁 数据存储
所有数据存储在 data/ 目录下的 JSON 文件中：

users.json - 用户数据
photos.json - 照片数据
上传的图片文件存储在 uploads/ 目录中。

🔧 配置说明
编辑 .env 文件进行配置：
```bash
PORT - 服务端口（默认3000）
JWT_SECRET - JWT 密钥
REGISTER_KEY - 注册密钥
MAX_FILE_SIZE - 最大文件大小
ALLOWED_FILE_TYPES - 允许的文件类型
