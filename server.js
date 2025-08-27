## 📚 核心代码文件

### server.js
```javascript
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 Photos API Server is running on port ${PORT}`);
    console.log(`📱 Web Interface: http://localhost:${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🛠️  Admin Panel: http://localhost:${PORT}/admin/dashboard.html`);
});
