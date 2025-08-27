const PhotoModel = require('../models/photo.model');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/storage');

class PhotoService {
    // 获取照片列表
    async getPhotos(page = 1, limit = 10, filters = {}) {
        // 验证分页参数
        page = Math.max(1, parseInt(page));
        limit = Math.min(config.MAX_PAGE_SIZE, Math.max(1, parseInt(limit)));

        // 处理标签过滤
        if (filters.tags && typeof filters.tags === 'string') {
            filters.tags = filters.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        return await PhotoModel.getPhotosWithPagination(page, limit, filters);
    }

    // 根据ID获取照片
    async getPhotoById(id) {
        const photo = await PhotoModel.getPhotoById(id);
        if (!photo) {
            throw new Error('Photo not found');
        }
        return photo;
    }

    // 创建照片
    async createPhoto(photoData, userId = null) {
        const { url, title, description, tags } = photoData;

        if (!url) {
            throw new Error('Photo URL is required');
        }

        // 处理标签
        let processedTags = [];
        if (tags) {
            if (Array.isArray(tags)) {
                processedTags = tags.filter(tag => tag && tag.trim());
            } else if (typeof tags === 'string') {
                processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            }
        }

        const newPhoto = await PhotoModel.createPhoto({
            url: url.trim(),
            title: title ? title.trim() : '',
            description: description ? description.trim() : '',
            tags: processedTags,
            userId
        });

        return newPhoto;
    }

    // 更新照片
    async updatePhoto(id, updateData, userId = null, userRole = 'user') {
        const existingPhoto = await PhotoModel.getPhotoById(id);
        if (!existingPhoto) {
            throw new Error('Photo not found');
        }

        // 权限检查：只有照片所有者或管理员可以更新
        if (userRole !== 'admin' && existingPhoto.userId !== userId) {
            throw new Error('Permission denied');
        }

        // 处理更新数据
        const { title, description, tags, ...otherData } = updateData;
        const updatedData = { ...otherData };

        if (title !== undefined) {
            updatedData.title = title.trim();
        }

        if (description !== undefined) {
            updatedData.description = description.trim();
        }

        if (tags !== undefined) {
            let processedTags = [];
            if (Array.isArray(tags)) {
                processedTags = tags.filter(tag => tag && tag.trim());
            } else if (typeof tags === 'string') {
                processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            }
            updatedData.tags = processedTags;
        }

        const updatedPhoto = await PhotoModel.updatePhoto(id, updatedData);
        return updatedPhoto;
    }

    // 删除照片
    async deletePhoto(id, userId = null, userRole = 'user') {
        const existingPhoto = await PhotoModel.getPhotoById(id);
        if (!existingPhoto) {
            throw new Error('Photo not found');
        }

        // 权限检查：只有照片所有者或管理员可以删除
        if (userRole !== 'admin' && existingPhoto.userId !== userId) {
            throw new Error('Permission denied');
        }

        // 删除本地文件（如果是本地上传的文件）
        if (existingPhoto.url && existingPhoto.url.startsWith('/uploads/')) {
            try {
                const fileName = path.basename(existingPhoto.url);
                const filePath = path.join(config.UPLOADS_DIR, fileName);
                await fs.access(filePath);
                await fs.unlink(filePath);
            } catch (error) {
                console.warn(`Failed to delete file: ${existingPhoto.url}`, error.message);
                // 继续删除数据库记录，即使文件删除失败
            }
        }

        await PhotoModel.deletePhoto(id);
        return true;
    }

    // 获取随机照片
    async getRandomPhoto() {
        const photo = await PhotoModel.getRandomPhoto();
        if (!photo) {
            throw new Error('No photos available');
        }
        return photo;
    }

    // 根据用户ID获取照片
    async getPhotosByUserId(userId, page = 1, limit = 10) {
        page = Math.max(1, parseInt(page));
        limit = Math.min(config.MAX_PAGE_SIZE, Math.max(1, parseInt(limit)));
        
        return await PhotoModel.getPhotosByUserId(userId, page, limit);
    }

    // 搜索照片
    async searchPhotos(searchTerm, page = 1, limit = 10) {
        if (!searchTerm || !searchTerm.trim()) {
            throw new Error('Search term is required');
        }

        page = Math.max(1, parseInt(page));
        limit = Math.min(config.MAX_PAGE_SIZE, Math.max(1, parseInt(limit)));
        
        return await PhotoModel.searchPhotos(searchTerm.trim(), page, limit);
    }

    // 根据标签获取照片
    async getPhotosByTags(tags, page = 1, limit = 10) {
        if (!tags || (Array.isArray(tags) && tags.length === 0)) {
            throw new Error('Tags are required');
        }

        // 处理标签参数
        let processedTags = [];
        if (Array.isArray(tags)) {
            processedTags = tags.filter(tag => tag && tag.trim());
        } else if (typeof tags === 'string') {
            processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        if (processedTags.length === 0) {
            throw new Error('Valid tags are required');
        }

        page = Math.max(1, parseInt(page));
        limit = Math.min(config.MAX_PAGE_SIZE, Math.max(1, parseInt(limit)));
        
        return await PhotoModel.getPhotosByTags(processedTags, page, limit);
    }

    // 上传照片文件
    async uploadPhotoFile(file, photoData, userId = null) {
        if (!file) {
            throw new Error('No file uploaded');
        }

        // 创建照片记录，使用上传文件的 URL
        const newPhoto = await this.createPhoto({
            ...photoData,
            url: file.url
        }, userId);

        return newPhoto;
    }

    // 获取照片统计信息
    async getPhotoStats() {
        return await PhotoModel.getPhotoStats();
    }

    // 批量删除照片（管理员功能）
    async batchDeletePhotos(photoIds, userId = null, userRole = 'user') {
        if (!Array.isArray(photoIds) || photoIds.length === 0) {
            throw new Error('Photo IDs array is required');
        }

        const results = {
            success: [],
            failed: []
        };

        for (const id of photoIds) {
            try {
                await this.deletePhoto(id, userId, userRole);
                results.success.push(id);
            } catch (error) {
                results.failed.push({ id, error: error.message });
            }
        }

        return results;
    }
}

module.exports = new PhotoService();
