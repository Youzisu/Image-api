const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// 导入路由
const apiRoutes = require('./routes/api.routes');
const webRoutes = require('./routes/web.routes');

// 创建 Express 应用
const app = express();

// 中间件配置
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/admin', express.static(path.join(__dirname, '../public/admin')));

// 模板引擎配置
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// 路由配置
app.use('/api', apiRoutes);
app.use('/', webRoutes);

// 404 处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        timestamp: new Date().toISOString()
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

module.exports = app;
