const fs = require('fs').promises;
const path = require('path');
const config = require('../config/storage');

class FileStorage {
    constructor() {
        this.dataDir = config.DATA_DIR;
        this.initializeStorage();
    }

    // 初始化存储目录
    async initializeStorage() {
        try {
            await fs.access(this.dataDir);
        } catch {
            await fs.mkdir(this.dataDir, { recursive: true });
        }

        // 确保上传目录存在
        try {
            await fs.access(config.UPLOADS_DIR);
        } catch {
            await fs.mkdir(config.UPLOADS_DIR, { recursive: true });
        }

        // 初始化数据文件
        await this.initializeDataFiles();
    }

    // 初始化数据文件
    async initializeDataFiles() {
        const files = [
            { name: config.USERS_FILE, defaultData: {} },
            { name: config.PHOTOS_FILE, defaultData: {} }
        ];

        for (const file of files) {
            const filePath = path.join(this.dataDir, file.name);
            try {
                await fs.access(filePath);
            } catch {
                await fs.writeFile(filePath, JSON.stringify(file.defaultData, null, 2));
            }
        }
    }

    // 读取文件
    async readFile(filename, returnJson = true) {
        try {
            const filePath = path.join(this.dataDir, filename);
            const data = await fs.readFile(filePath, 'utf8');
            return returnJson ? JSON.parse(data) : data;
        } catch (error) {
            if (error.code === 'ENOENT') {
                return returnJson ? {} : '';
            }
            throw error;
        }
    }

    // 写入文件
    async writeFile(filename, data) {
        try {
            const filePath = path.join(this.dataDir, filename);
            const jsonData = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
            await fs.writeFile(filePath, jsonData, 'utf8');
            return true;
        } catch (error) {
            console.error(`Error writing file ${filename}:`, error);
            throw error;
        }
    }

    // 备份文件
    async backupFile(filename) {
        try {
            const filePath = path.join(this.dataDir, filename);
            const backupPath = path.join(this.dataDir, `${filename}.backup.${Date.now()}`);
            await fs.copyFile(filePath, backupPath);
            return backupPath;
        } catch (error) {
            console.error(`Error backing up file ${filename}:`, error);
            throw error;
        }
    }

    // 获取文件统计信息
    async getFileStats(filename) {
        try {
            const filePath = path.join(this.dataDir, filename);
            return await fs.stat(filePath);
        } catch (error) {
            console.error(`Error getting stats for file ${filename}:`, error);
            throw error;
        }
    }
}

module.exports = new FileStorage();
