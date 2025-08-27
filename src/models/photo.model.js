const fileStorage = require('../utils/fileStorage');
const config = require('../config/storage');

class PhotoModel {
    constructor() {
        this.filename = config.PHOTOS_FILE;
    }

    // 获取所有照片
    async getAllPhotos() {
        return await fileStorage.readFile(this.filename);
    }

    // 根据ID获取照片
    async getPhotoById(id) {
        const photos = await this.getAllPhotos();
        return photos[id] || null;
    }

    // 创建照片
    async createPhoto(photoData) {
        const photos = await this.getAllPhotos();
        const newId = this.generateNewId(photos);
        
        const newPhoto = {
            id: newId,
            url: photoData.url,
            title: photoData.title || '',
            description: photoData.description || '',
            tags: photoData.tags || [],
            userId: photoData.userId || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        photos[newId] = newPhoto;
        await fileStorage.writeFile(this.filename, photos);
        return newPhoto;
    }

    // 更新照片
    async updatePhoto(id, updateData) {
        const photos = await this.getAllPhotos();
        
        if (!photos[id]) {
            throw new Error('Photo not found');
        }

        photos[id] = {
            ...photos[id],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        await fileStorage.writeFile(this.filename, photos);
        return photos[id];
    }

    // 删除照片
    async deletePhoto(id) {
        const photos = await this.getAllPhotos();
        
        if (!photos[id]) {
            throw new Error('Photo not found');
        }

        delete photos[id];
        await fileStorage.writeFile(this.filename, photos);
        return true;
    }

    // 分页获取照片
    async getPhotosWithPagination(page = 1, limit = 10, filters = {}) {
        const photos = await this.getAllPhotos();
        let photoArray = Object.values(photos);

        // 应用过滤器
        if (filters.tags && filters.tags.length > 0) {
            photoArray = photoArray.filter(photo => 
                photo.tags && photo.tags.some(tag => 
                    filters.tags.some(filterTag => 
                        tag.toLowerCase().includes(filterTag.toLowerCase())
                    )
                )
            );
        }

        if (filters.userId) {
            photoArray = photoArray.filter(photo => photo.userId === filters.userId);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            photoArray = photoArray.filter(photo => 
                photo.title.toLowerCase().includes(searchTerm) ||
                photo.description.toLowerCase().includes(searchTerm) ||
                (photo.tags && photo.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }

        // 排序（按创建时间倒序）
        photoArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // 分页
        const total = photoArray.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPhotos = photoArray.slice(startIndex, endIndex);

        return {
            data: paginatedPhotos,
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

    // 获取随机照片
    async getRandomPhoto() {
        const photos = await this.getAllPhotos();
        const photoArray = Object.values(photos);
        
        if (photoArray.length === 0) {
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * photoArray.length);
        return photoArray[randomIndex];
    }

    // 获取用户的照片
    async getPhotosByUserId(userId, page = 1, limit = 10) {
        return await this.getPhotosWithPagination(page, limit, { userId });
    }

    // 搜索照片
    async searchPhotos(searchTerm, page = 1, limit = 10) {
        return await this.getPhotosWithPagination(page, limit, { search: searchTerm });
    }

    // 根据标签获取照片
    async getPhotosByTags(tags, page = 1, limit = 10) {
        return await this.getPhotosWithPagination(page, limit, { tags });
    }

    // 生成新的照片ID
    generateNewId(photos) {
        const existingIds = Object.keys(photos).map(id => parseInt(id));
        return existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    }

    // 获取照片统计信息
    async getPhotoStats() {
        const photos = await this.getAllPhotos();
        const photoArray = Object.values(photos);
        
        // 统计标签
        const tagCounts = {};
        photoArray.forEach(photo => {
            if (photo.tags) {
                photo.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        // 获取最热门的标签
        const popularTags = Object.entries(tagCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));

        return {
            total: photoArray.length,
            totalTags: Object.keys(tagCounts).length,
            popularTags,
            recentPhotos: photoArray
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
        };
    }
}

module.exports = new PhotoModel();
