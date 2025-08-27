const UserModel = require('../models/user.model');
const AuthMiddleware = require('../middleware/auth');
const config = require('../config/storage');

class UserService {
    // 用户注册
    async register(userData) {
        const { username, password, role, registerKey } = userData;

        // 验证必填字段
        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        // 验证注册密钥（管理员注册需要）
        if (role === 'admin' && registerKey !== config.REGISTER_KEY) {
            throw new Error('Invalid register key for admin registration');
        }

        // 检查用户名是否已存在
        const existingUser = await UserModel.getUserByUsername(username);
        if (existingUser) {
            throw new Error('Username already exists');
        }

        // 创建用户
        const newUser = await UserModel.createUser({
            username: username.trim(),
            password,
            role: role || 'user'
        });

        return newUser;
    }

    // 用户登录
    async login(username, password) {
        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        // 获取用户
        const user = await UserModel.getUserByUsername(username.trim());
        if (!user) {
            throw new Error('Invalid username or password');
        }

        // 检查用户是否活跃
        if (!user.isActive) {
            throw new Error('Account is inactive');
        }

        // 验证密码
        const isPasswordValid = await UserModel.validatePassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid username or password');
        }

        // 更新最后登录时间
        await UserModel.updateLastLogin(user.id);

        // 生成 token
        const token = AuthMiddleware.generateToken(user.id);

        // 返回用户信息和 token（不包含密码）
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            token
        };
    }

    // 获取用户资料
    async getUserProfile(userId) {
        const user = await UserModel.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // 返回用户信息（不包含密码）
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // 更新用户资料
    async updateUserProfile(userId, updateData) {
        const { username, currentPassword, newPassword, ...otherData } = updateData;

        // 获取当前用户
        const currentUser = await UserModel.getUserById(userId);
        if (!currentUser) {
            throw new Error('User not found');
        }

        const updatedData = { ...otherData };

        // 如果要更新用户名，检查是否已存在
        if (username && username !== currentUser.username) {
            const existingUser = await UserModel.getUserByUsername(username);
            if (existingUser) {
                throw new Error('Username already exists');
            }
            updatedData.username = username.trim();
        }

        // 如果要更新密码，验证当前密码
        if (newPassword) {
            if (!currentPassword) {
                throw new Error('Current password is required to set new password');
            }

            const isCurrentPasswordValid = await UserModel.validatePassword(
                currentPassword, 
                currentUser.password
            );
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            updatedData.password = newPassword;
        }

        // 更新用户
        const updatedUser = await UserModel.updateUser(userId, updatedData);
        return updatedUser;
    }

    // 根据ID获取用户（内部使用）
    async getUserById(userId) {
        return await UserModel.getUserById(userId);
    }

    // 获取所有用户（管理员功能）
    async getAllUsers(page = 1, limit = 10) {
        const users = await UserModel.getAllUsers();
        const userArray = Object.values(users);

        // 移除密码字段
        const usersWithoutPasswords = userArray.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        // 排序（按创建时间倒序）
        usersWithoutPasswords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // 分页
        const total = usersWithoutPasswords.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = usersWithoutPasswords.slice(startIndex, endIndex);

        return {
            data: paginatedUsers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: endIndex < total,
                hasPrevPage: page > 1
            }
        };
    }

    // 删除用户（管理员功能）
    async deleteUser(userId, currentUserId) {
        if (userId === currentUserId) {
            throw new Error('Cannot delete your own account');
        }

        const user = await UserModel.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        await UserModel.deleteUser(userId);
        return true;
    }

    // 激活/停用用户（管理员功能）
    async toggleUserStatus(userId, currentUserId) {
        if (userId === currentUserId) {
            throw new Error('Cannot change your own account status');
        }

        const user = await UserModel.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const updatedUser = await UserModel.updateUser(userId, {
            isActive: !user.isActive
        });

        return updatedUser;
    }

    // 获取用户统计信息
    async getUserStats() {
        return await UserModel.getUserStats();
    }
}

module.exports = new UserService();
