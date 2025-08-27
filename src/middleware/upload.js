const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/storage');
const ResponseHelper = require('../utils/response');

// 存储配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        // 生成唯一文件名
        const fileExtension = path.extname(file.originalname).toLowerCase();
        const fileName = `${uuidv4()}${fileExtension}`;
        cb(null, fileName);
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
    
    if (config.ALLOWED_FILE_TYPES.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed. Allowed types: ${config.ALLOWED_FILE_TYPES.join(', ')}`), false);
    }
};

// Multer 配置
const upload = multer({
    storage: storage,
    limits: {
        fileSize: config.MAX_FILE_SIZE,
        files: 1 // 限制单次上传文件数量
    },
    fileFilter: fileFilter
});

// 文件上传中间件
class UploadMiddleware {
    // 单文件上传
    static single(fieldName = 'photo') {
        return (req, res, next) => {
            const uploadSingle = upload.single(fieldName);
            
            uploadSingle(req, res, (err) => {
                if (err) {
                    if (err instanceof multer.MulterError) {
                        switch (err.code) {
                            case 'LIMIT_FILE_SIZE':
                                return ResponseHelper.error(res, 
                                    `File too large. Max size: ${Math.round(config.MAX_FILE_SIZE / 1024 / 1024)}MB`, 
                                    413
                                );
                            case 'LIMIT_FILE_COUNT':
                                return ResponseHelper.error(res, 'Too many files uploaded', 413);
                            case 'LIMIT_UNEXPECTED_FILE':
                                return ResponseHelper.error(res, `Unexpected field name. Expected: ${fieldName}`, 400);
                            default:
                                return ResponseHelper.error(res, 'File upload error', 400, err);
                        }
                    } else {
                        return ResponseHelper.error(res, err.message || 'File upload error', 400);
                    }
                }
                
                // 如果没有文件上传，继续执行
                if (!req.file) {
                    return next();
                }

                // 添加文件URL到请求对象
                req.file.url = `/uploads/${req.file.filename}`;
                next();
            });
        };
    }

    // 多文件上传
    static multiple(fieldName = 'photos', maxCount = 5) {
        return (req, res, next) => {
            const uploadMultiple = upload.array(fieldName, maxCount);
            
            uploadMultiple(req, res, (err) => {
                if (err) {
                    if (err instanceof multer.MulterError) {
                        switch (err.code) {
                            case 'LIMIT_FILE_SIZE':
                                return ResponseHelper.error(res, 
                                    `File too large. Max size: ${Math.round(config.MAX_FILE_SIZE / 1024 / 1024)}MB`, 
                                    413
                                );
                            case 'LIMIT_FILE_COUNT':
                                return ResponseHelper.error(res, `Too many files. Max: ${maxCount}`, 413);
                            case 'LIMIT_UNEXPECTED_FILE':
                                return ResponseHelper.error(res, `Unexpected field name. Expected: ${fieldName}`, 400);
                            default:
                                return ResponseHelper.error(res, 'File upload error', 400, err);
                        }
                    } else {
                        return ResponseHelper.error(res, err.message || 'File upload error', 400);
                    }
                }

                // 添加文件URLs到请求对象
                if (req.files && req.files.length > 0) {
                    req.files = req.files.map(file => ({
                        ...file,
                        url: `/uploads/${file.filename}`
                    }));
                }

                next();
            });
        };
    }

    // 验证图片文件
    static validateImageFile(req, res, next) {
        if (!req.file) {
            return ResponseHelper.error(res, 'No file uploaded', 400);
        }

        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp'
        ];

        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            return ResponseHelper.error(res, 'Invalid file type. Only images are allowed', 400);
        }

        next();
    }
}

module.exports = UploadMiddleware;
