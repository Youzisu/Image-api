const bcrypt = require('bcryptjs');
const fileStorage = require('../utils/fileStorage');
const config = require('../config/storage');

class UserModel {
    constructor() {
        this.filename = config.USERS_FILE;
    }

    // 获取所有用户
    async getAllUsers() {
        return await fileStorage.readFile(this.filename);
    }

    // 根据ID获取用户
    async getUserById(id) {
        const users = await this.getAllUsers();
        return users[id] || null;
    }

    // 根据用户名获取用户
    async getUserByUsername(username) {
        const users = await this.getAllUsers();
        return Object.values(users).find(user => user.username === username) || null;
    }

    // 创建用户
    async createUser(userData) {
        const users = await this.getAllUsers();
        const newId = this.generateNewId(users);
        
        // 密码加密
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const newUser = {
            id: newId,
            username: userData.username,
            password: hashedPassword,
            role: userData.role || 'user',
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        users[newId] = newUser;
        await fileStorage.writeFile(this.filename, users);
        
        // 返回用户信息（不包含密码）
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    // 更新用户
    async updateUser(id, updateData) {
        const users = await this.getAllUsers();
        
        if (!users[id]) {
            throw new Error('User not found');
        }

        // 如果更新密码，需要加密
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        users[id] = {
            ...users[id],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        await fileStorage.writeFile(this.filename, users);
        
        // 返回用户信息（不包含密码）
        const { password, ...userWithoutPassword } = users[id];
        return userWithoutPassword;
    }

    // 删除用户
    async deleteUser(id) {
        const users = await this.getAllUsers();
        
        if (!users[id]) {
            throw new Error('User not found');
        }

        delete users[id];
        await fileStorage.writeFile(this.filename, users);
        return true;
    }

    // 验证密码
    async validatePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // 更新最后登录时间
    async updateLastLogin(id) {
        const users = await this.getAllUsers();
        
        if (users[id]) {
            users[id].lastLogin = new Date().toISOString();
            await fileStorage.writeFile(this.filename, users);
        }
    }

    // 检查用户名是否存在
    async isUsernameExists(username, excludeId = null) {
        const users = await this.getAllUsers();
        return Object.values(users).some(user => 
            user.username === username && (!excludeId || user.id !== excludeId)
        );
    }

    // 生成新的用户ID
    generateNewId(users) {
        const existingIds = Object.keys(users).map(id => parseInt(id));
        return existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    }

    // 获取用户统计信息
    async getUserStats() {
        const users = await this.getAllUsers();
        const userArray = Object.values(users);
        
        return {
            total: userArray.length,
            active: userArray.filter(user => user.isActive).length,
            inactive: userArray.filter(user => !user.isActive).length,
            admins: userArray.filter(user => user.role === 'admin').length,
            regularUsers: userArray.filter(user => user.role === 'user').length
        };
    }
}

module.exports = new UserModel();
