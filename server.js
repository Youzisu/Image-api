# 备份当前文件
cp /root/Image-api/server.js /root/Image-api/server.js.backup

# 创建正确的 server.js 文件
cat > /root/Image-api/server.js << 'EOF'
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Photos API Server is running on port ${PORT}`);
    console.log(`📱 Web Interface: http://localhost:${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🛠️  Admin Panel: http://localhost:${PORT}/admin/dashboard.html`);
});
EOF
