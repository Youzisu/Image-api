const express = require('express');
const UserController = require('../controllers/user.controller');
const PhotoController = require('../controllers/photo.controller');
const AuthMiddleware = require('../middleware/auth');
const UploadMiddleware = require('../middleware/upload');

const router = express.Router();

// 用户相关路由
router.post('/users/register', UserController.register);
router.post('/users/login', UserController.login);
router.get('/users/profile', AuthMiddleware.authenticate, UserController.getProfile);
router.put('/users/profile', AuthMiddleware.authenticate, UserController.updateProfile);

// 管理员用户管理路由
router.get('/users', 
    AuthMiddleware.authenticate, 
    AuthMiddleware.requireAdmin, 
    UserController.getAllUsers
);
router.delete('/users/:id', 
    AuthMiddleware.authenticate, 
    AuthMiddleware.requireAdmin, 
    UserController.deleteUser
);
router.patch('/users/:id/toggle-status', 
    AuthMiddleware.authenticate, 
    AuthMiddleware.requireAdmin, 
    UserController.toggleUserStatus
);
router.get('/users/stats', 
    AuthMiddleware.authenticate, 
    AuthMiddleware.requireAdmin, 
    UserController.getUserStats
);

// 照片相关路由
router.get('/photos', PhotoController.getPhotos);
router.get('/photos/random', PhotoController.getRandomPhoto);
router.get('/photos/search', PhotoController.searchPhotos);
router.get('/photos/tags', PhotoController.getPhotosByTags);
router.get('/photos/stats', PhotoController.getPhotoStats);
router.get('/photos/:id', PhotoController.getPhotoById);

// 需要认证的照片路由
router.post('/photos', 
    AuthMiddleware.optionalAuth, 
    PhotoController.createPhoto
);
router.post('/photos/upload', 
    AuthMiddleware.optionalAuth,
    UploadMiddleware.single('photo'),
    UploadMiddleware.validateImageFile,
    PhotoController.uploadPhoto
);
router.put('/photos/:id', 
    AuthMiddleware.authenticate, 
    PhotoController.updatePhoto
);
router.delete('/photos/:id', 
    AuthMiddleware.authenticate, 
    PhotoController.deletePhoto
);

// 用户照片路由
router.get('/users/:userId/photos', PhotoController.getUserPhotos);

// 批量操作路由（管理员功能）
router.post('/photos/batch-delete', 
    AuthMiddleware.authenticate, 
    AuthMiddleware.requireAdmin, 
    PhotoController.batchDeletePhotos
);

// API 健康检查
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Photos API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

module.exports = router;
