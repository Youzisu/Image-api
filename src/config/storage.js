const path = require('path');

module.exports = {
    // 数据文件路径
    DATA_DIR: path.join(__dirname, '../../data'),
    USERS_FILE: 'users.json',
    PHOTOS_FILE: 'photos.json',
    
    // 上传文件路径
    UPLOADS_DIR: path.join(__dirname, '../../uploads'),
    
    // 文件上传配置
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,webp').split(','),
    
    // 分页配置
    DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
    MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE) || 100,
    
    // JWT 配置
    JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    
    // 注册密钥
    REGISTER_KEY: process.env.REGISTER_KEY || 'default_register_key'
};
