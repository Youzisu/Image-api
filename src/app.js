cat > /root/Image-api/src/app.js << 'EOF'
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();

// 中间件配置
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// 确保数据目录存在
const dataDir = path.join(__dirname, '../data');
const uploadsDir = path.join(__dirname, '../uploads');

[dataDir, uploadsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// 初始化数据文件
const initDataFiles = () => {
    const usersFile = path.join(dataDir, 'users.json');
    const photosFile = path.join(dataDir, 'photos.json');

    if (!fs.existsSync(usersFile)) {
        const defaultUsers = {
            "1": {
                "id": 1,
                "username": "admin",
                "password": "$2b$10$N9qo8uLOickgx2ZMRZoMye.IjOQBGWXaHsZqG8PYLYBo.9xEgZgKy",
                "role": "admin",
                "isActive": true,
                "createdAt": "2024-01-01T00:00:00.000Z",
                "lastLogin": null
            }
        };
        fs.writeFileSync(usersFile, JSON.stringify(defaultUsers, null, 2));
        console.log('✅ 创建默认用户文件 (admin/password)');
    }

    if (!fs.existsSync(photosFile)) {
        const defaultPhotos = {
            "1": {
                "id": 1,
                "url": "https://picsum.photos/800/600?random=1",
                "title": "示例照片 1",
                "description": "这是一张美丽的示例照片",
                "tags": ["风景", "自然"],
                "userId": 1,
                "createdAt": "2024-01-01T00:00:00.000Z",
                "updatedAt": "2024-01-01T00:00:00.000Z"
            },
            "2": {
                "id": 2,
                "url": "https://picsum.photos/800/600?random=2",
                "title": "示例照片 2",
                "description": "另一张精美的照片",
                "tags": ["城市", "建筑"],
                "userId": 1,
                "createdAt": "2024-01-01T01:00:00.000Z",
                "updatedAt": "2024-01-01T01:00:00.000Z"
            }
        };
        fs.writeFileSync(photosFile, JSON.stringify(defaultPhotos, null, 2));
        console.log('✅ 创建默认照片文件');
    }
};

// 初始化数据
initDataFiles();

// 路由
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Photos API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/health',
            photos: '/api/photos',
            randomPhoto: '/api/photos/random'
        }
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Photos API is healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 获取照片列表
app.get('/api/photos', (req, res) => {
    try {
        const photosPath = path.join(dataDir, 'photos.json');
        
        if (fs.existsSync(photosPath)) {
            const photosData = JSON.parse(fs.readFileSync(photosPath, 'utf8'));
            const photos = Object.values(photosData);
            
            // 分页
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedPhotos = photos.slice(startIndex, endIndex);
            
            res.json({
                success: true,
                message: 'Photos retrieved successfully',
                data: paginatedPhotos,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(photos.length / limit),
                    totalItems: photos.length,
                    itemsPerPage: limit,
                    hasNextPage: endIndex < photos.length,
                    hasPrevPage: page > 1
                },
                timestamp: new Date().toISOString()
            });
        } else {
            res.json({
                success: true,
                message: 'No photos found',
                data: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 0,
                    totalItems: 0,
                    itemsPerPage: 10,
                    hasNextPage: false,
                    hasPrevPage: false
                },
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error reading photos',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 获取随机照片
app.get('/api/photos/random', (req, res) => {
    try {
        const photosPath = path.join(dataDir, 'photos.json');
        
        if (fs.existsSync(photosPath)) {
            const photosData = JSON.parse(fs.readFileSync(photosPath, 'utf8'));
            const photos = Object.values(photosData);
            
            if (photos.length > 0) {
                const randomIndex = Math.floor(Math.random() * photos.length);
                const randomPhoto = photos[randomIndex];
                
                res.json({
                    success: true,
                    message: 'Random photo retrieved successfully',
                    data: randomPhoto,
                    timestamp: new Date().toISOString()
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'No photos available',
                    timestamp: new Date().toISOString()
                });
            }
        } else {
            res.status(404).json({
                success: false,
                message: 'No photos available',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error reading photos',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// 404 处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.path,
        timestamp: new Date().toISOString()
    });
});

// 错误处理
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
EOF
