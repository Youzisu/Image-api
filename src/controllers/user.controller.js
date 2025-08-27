const UserService = require('../services/user.service');
const ResponseHelper = require('../utils/response');

class UserController {
    // 用户注册
    static async register(req, res) {
        try {
            const { username, password, role, registerKey } = req.body;

            // 基本验证
            if (!username || !password) {
                return ResponseHelper.validationError(res, {
                    username: !username ? 'Username is required' : undefined,
                    password: !password ? 'Password is required' : undefined
                });
            }

            // 密码长度验证
            if (password.length < 6) {
                return ResponseHelper.validationError(res, {
                    password: 'Password must be at least 6 characters long'
                });
            }

            const newUser = await UserService.register({
                username,
                password,
                role,
                registerKey
            });

            return ResponseHelper.success(
                res,
                newUser,
                'User registered successfully',
                201
            );
        } catch (error) {
            console.error('Registration error:', error);
            
            if (error.message === 'Username already exists') {
                return ResponseHelper.error(res, error.message, 409);
            } else if (error.message === 'Invalid register key for admin registration') {
                return ResponseHelper.error(res, error.message, 403);
            } else {
                return ResponseHelper.serverError(res, 'Registration failed', error);
            }
        }
    }

    // 用户登录
    static async login(req, res) {
        try {
            const { username, password } = req.body;

            // 基本验证
            if (!username || !password) {
                return ResponseHelper.validationError(res, {
                    username: !username ? 'Username is required' : undefined,
                    password: !password ? 'Password is required' : undefined
                });
            }

            const result = await UserService.login(username, password);

            return ResponseHelper.success(
                res,
                result,
                'Login successful'
            );
        } catch (error) {
            console.error('Login error:', error);
            
            if (error.message.includes('Invalid username or password') || 
                error.message === 'Account is inactive') {
                return ResponseHelper.error(res, error.message, 401);
            } else {
                return ResponseHelper.serverError(res, 'Login failed', error);
            }
        }
    }

    // 获取用户资料
    static async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const userProfile = await UserService.getUserProfile(userId);

            return ResponseHelper.success(
                res,
                userProfile,
                'User profile retrieved successfully'
            );
        } catch (error) {
            console.error('Get profile error:', error);
            
            if (error.message === 'User not found') {
                return ResponseHelper.notFound(res, error.message);
            } else {
                return ResponseHelper.serverError(res, 'Failed to get user profile', error);
            }
        }
    }

    // 更新用户资料
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const updateData = req.body;

            const updatedUser = await UserService.updateUserProfile(userId, updateData);

            return ResponseHelper.success(
                res,
                updatedUser,
                'User profile updated successfully'
            );
        } catch (error) {
            console.error('Update profile error:', error);
            
            if (error.message === 'User not found') {
                return ResponseHelper.notFound(res, error.message);
            } else if (error.message === 'Username already exists') {
                return ResponseHelper.error(res, error.message, 409);
            } else if (error.message.includes('password')) {
                return ResponseHelper.error(res, error.message, 400);
            } else {
                return ResponseHelper.serverError(res, 'Failed to update user profile', error);
            }
        }
    }

    // 获取所有用户（管理员功能）
    static async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const result = await UserService.getAllUsers(page, limit);

            return ResponseHelper.successWithPagination(
                res,
                result.data,
                result.pagination,
                'Users retrieved successfully'
            );
        } catch (error) {
            console.error('Get all users error:', error);
            return ResponseHelper.serverError(res, 'Failed to get users', error);
        }
    }

    // 删除用户（管理员功能）
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const currentUserId = req.user.id;

            await UserService.deleteUser(parseInt(id), currentUserId);

            return ResponseHelper.success(
                res,
                null,
                'User deleted successfully'
            );
        } catch (error) {
            console.error('Delete user error:', error);
            
            if (error.message === 'User not found') {
                return ResponseHelper.notFound(res, error.message);
            } else if (error.message === 'Cannot delete your own account') {
                return ResponseHelper.error(res, error.message, 403);
            } else {
                return ResponseHelper.serverError(res, 'Failed to delete user', error);
            }
        }
    }

    // 切换用户状态（管理员功能）
    static async toggleUserStatus(req, res) {
        try {
            const { id } = req.params;
            const currentUserId = req.user.id;

            const updatedUser = await UserService.toggleUserStatus(parseInt(id), currentUserId);

            return ResponseHelper.success(
                res,
                updatedUser,
                'User status updated successfully'
            );
        } catch (error) {
            console.error('Toggle user status error:', error);
            
            if (error.message === 'User not found') {
                return ResponseHelper.notFound(res, error.message);
            } else if (error.message === 'Cannot change your own account status') {
                return ResponseHelper.error(res, error.message, 403);
            } else {
                return ResponseHelper.serverError(res, 'Failed to update user status', error);
            }
        }
    }

    // 获取用户统计信息（管理员功能）
    static async getUserStats(req, res) {
        try {
            const stats = await UserService.getUserStats();

            return ResponseHelper.success(
                res,
                stats,
                'User statistics retrieved successfully'
            );
        } catch (error) {
            console.error('Get user stats error:', error);
            return ResponseHelper.serverError(res, 'Failed to get user statistics', error);
        }
    }
}

module.exports = UserController;
