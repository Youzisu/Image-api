const jwt = require('jsonwebtoken');
const config = require('../config/storage');
const ResponseHelper = require('../utils/response');
const UserService = require('../services/user.service');

class AuthMiddleware {
    // JWT 认证中间件
    static async authenticate(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return ResponseHelper.unauthorized(res, 'No token provided');
            }

            const token = authHeader.substring(7); // 移除 "Bearer " 前缀

            try {
                const decoded = jwt.verify(token, config.JWT_SECRET);
                
                // 验证用户是否仍然存在且处于活跃状态
                const user = await UserService.getUserById(decoded.userId);
                if (!user || !user.isActive) {
                    return ResponseHelper.unauthorized(res, 'Invalid token or user inactive');
                }

                // 将用户信息添加到请求对象
                req.user = {
                    id: user.id,
                    username: user.username,
                    role: user.role
                };

                next();
            } catch (jwtError) {
                if (jwtError.name === 'TokenExpiredError') {
                    return ResponseHelper.unauthorized(res, 'Token expired');
                } else if (jwtError.name === 'JsonWebTokenError') {
                    return ResponseHelper.unauthorized(res, 'Invalid token');
                } else {
                    throw jwtError;
                }
            }
        } catch (error) {
            console.error('Auth middleware error:', error);
            return ResponseHelper.serverError(res, 'Authentication error', error);
        }
    }

    // 管理员权限检查
    static async requireAdmin(req, res, next) {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            return ResponseHelper.forbidden(res, 'Admin access required');
        }
    }

    // 可选认证中间件（用于可选登录的接口）
    static async optionalAuth(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                req.user = null;
                return next();
            }

            const token = authHeader.substring(7);

            try {
                const decoded = jwt.verify(token, config.JWT_SECRET);
                const user = await UserService.getUserById(decoded.userId);
                
                if (user && user.isActive) {
                    req.user = {
                        id: user.id,
                        username: user.username,
                        role: user.role
                    };
                } else {
                    req.user = null;
                }
            } catch (jwtError) {
                req.user = null;
            }

            next();
        } catch (error) {
            console.error('Optional auth middleware error:', error);
            req.user = null;
            next();
        }
    }

    // 生成 JWT Token
    static generateToken(userId) {
        return jwt.sign(
            { userId: userId },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }
        );
    }
}

module.exports = AuthMiddleware;
