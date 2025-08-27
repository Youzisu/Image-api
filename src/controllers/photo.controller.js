const PhotoService = require('../services/photo.service');
const ResponseHelper = require('../utils/response');

class PhotoController {
    // 获取照片列表
    static async getPhotos(req, res) {
        try {
            const { page = 1, limit = 10, tags, search, userId } = req.query;
            
            const filters = {};
            if (tags) filters.tags = tags;
            if (search) filters.search = search;
            if (userId) filters.userId = parseInt(userId);

            const result = await PhotoService.getPhotos(page, limit, filters);

            return ResponseHelper.successWithPagination(
                res,
                result.data,
                result.pagination,
                'Photos retrieved successfully'
            );
        } catch (error) {
            console.error('Get photos error:', error);
            return ResponseHelper.serverError(res, 'Failed to get photos', error);
        }
    }

    // 根据ID获取照片
    static async getPhotoById(req, res) {
        try {
            const { id } = req.params;
            const photo = await PhotoService.getPhotoById(parseInt(id));

            return ResponseHelper.success(
                res,
                photo,
                'Photo retrieved successfully'
            );
        } catch (error) {
            console.error('Get photo by ID error:', error);
            
            if (error.message === 'Photo not found') {
                return ResponseHelper.notFound(res, error.message);
            } else {
                return ResponseHelper.serverError(res, 'Failed to get photo', error);
            }
        }
    }

    // 创建照片（URL方式）
    static async createPhoto(req, res) {
        try {
            const { url, title, description, tags } = req.body;
            const userId = req.user ? req.user.id : null;

            // 基本验证
            if (!url) {
                return ResponseHelper.validationError(res, {
                    url: 'Photo URL is required'
                });
            }

            const newPhoto = await PhotoService.createPhoto({
                url,
                title,
                description,
                tags
            }, userId);

            return ResponseHelper.success(
                res,
                newPhoto,
                'Photo created successfully',
                201
            );
        } catch (error) {
            console.error('Create photo error:', error);
            return ResponseHelper.serverError(res, 'Failed to create photo', error);
        }
    }

    // 上传照片文件
    static async uploadPhoto(req, res) {
        try {
            const { title, description, tags } = req.body;
            const file = req.file;
            const userId = req.user ? req.user.id : null;

            if (!file) {
                return ResponseHelper.error(res, 'No file uploaded', 400);
            }

            const newPhoto = await PhotoService.uploadPhotoFile(
                file,
                { title, description, tags },
                userId
            );

            return ResponseHelper.success(
                res,
                newPhoto,
                'Photo uploaded successfully',
                201
            );
        } catch (error) {
            console.error('Upload photo error:', error);
            return ResponseHelper.serverError(res, 'Failed to upload photo', error);
        }
    }

    // 更新照片
    static async updatePhoto(req, res) {
        try {
            const { id } = req.params;
            const { title, description, tags } = req.body;
            const userId = req.user ? req.user.id : null;
            const userRole = req.user ? req.user.role : 'user';

            const updatedPhoto = await PhotoService.updatePhoto(
                parseInt(id),
                { title, description, tags },
                userId,
                userRole
            );

            return ResponseHelper.success(
                res,
                updatedPhoto,
                'Photo updated successfully'
            );
        } catch (error) {
            console.error('Update photo error:', error);
            
            if (error.message === 'Photo not found') {
                return ResponseHelper.notFound(res, error.message);
            } else if (error.message === 'Permission denied') {
                return ResponseHelper.forbidden(res, error.message);
            } else {
                return ResponseHelper.serverError(res, 'Failed to update photo', error);
            }
        }
    }

    // 删除照片
    static async deletePhoto(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user ? req.user.id : null;
            const userRole = req.user ? req.user.role : 'user';

            await PhotoService.deletePhoto(parseInt(id), userId, userRole);

            return ResponseHelper.success(
                res,
                null,
                'Photo deleted successfully'
            );
        } catch (error) {
            console.error('Delete photo error:', error);
            
            if (error.message === 'Photo not found') {
                return ResponseHelper.notFound(res, error.message);
            } else if (error.message === 'Permission denied') {
                return ResponseHelper.forbidden(res, error.message);
            } else {
                return ResponseHelper.serverError(res, 'Failed to delete photo', error);
            }
        }
    }

    // 获取随机照片
    static async getRandomPhoto(req, res) {
        try {
            const photo = await PhotoService.getRandomPhoto();

            return ResponseHelper.success(
                res,
                photo,
                'Random photo retrieved successfully'
            );
        } catch (error) {
            console.error('Get random photo error:', error);
            
            if (error.message === 'No photos available') {
                return ResponseHelper.notFound(res, error.message);
            } else {
                return ResponseHelper.serverError(res, 'Failed to get random photo', error);
            }
        }
    }

    // 搜索照片
    static async searchPhotos(req, res) {
        try {
            const { q: searchTerm, page = 1, limit = 10 } = req.query;

            if (!searchTerm) {
                return ResponseHelper.validationError(res, {
                    q: 'Search term is required'
                });
            }

            const result = await PhotoService.searchPhotos(searchTerm, page, limit);

            return ResponseHelper.successWithPagination(
                res,
                result.data,
                result.pagination,
                'Photos search completed successfully'
            );
        } catch (error) {
            console.error('Search photos error:', error);
            return ResponseHelper.serverError(res, 'Failed to search photos', error);
        }
    }

    // 根据标签获取照片
    static async getPhotosByTags(req, res) {
        try {
            const { tags, page = 1, limit = 10 } = req.query;

            if (!tags) {
                return ResponseHelper.validationError(res, {
                    tags: 'Tags parameter is required'
                });
            }

            const result = await PhotoService.getPhotosByTags(tags, page, limit);

            return ResponseHelper.successWithPagination(
                res,
                result.data,
                result.pagination,
                'Photos by tags retrieved successfully'
            );
        } catch (error) {
            console.error('Get photos by tags error:', error);
            return ResponseHelper.serverError(res, 'Failed to get photos by tags', error);
        }
    }

    // 获取用户的照片
    static async getUserPhotos(req, res) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const result = await PhotoService.getPhotosByUserId(parseInt(userId), page, limit);

            return ResponseHelper.successWithPagination(
                res,
                result.data,
                result.pagination,
                'User photos retrieved successfully'
            );
        } catch (error) {
            console.error('Get user photos error:', error);
            return ResponseHelper.serverError(res, 'Failed to get user photos', error);
        }
    }

    // 获取照片统计信息
    static async getPhotoStats(req, res) {
        try {
            const stats = await PhotoService.getPhotoStats();

            return ResponseHelper.success(
                res,
                stats,
                'Photo statistics retrieved successfully'
            );
        } catch (error) {
            console.error('Get photo stats error:', error);
            return ResponseHelper.serverError(res, 'Failed to get photo statistics', error);
        }
    }

    // 批量删除照片（管理员功能）
    static async batchDeletePhotos(req, res) {
        try {
            const { photoIds } = req.body;
            const userId = req.user ? req.user.id : null;
            const userRole = req.user ? req.user.role : 'user';

            if (!Array.isArray(photoIds) || photoIds.length === 0) {
                return ResponseHelper.validationError(res, {
                    photoIds: 'Photo IDs array is required'
                });
            }

            const results = await PhotoService.batchDeletePhotos(photoIds, userId, userRole);

            return ResponseHelper.success(
                res,
                results,
                'Batch delete completed'
            );
        } catch (error) {
            console.error('Batch delete photos error:', error);
            return ResponseHelper.serverError(res, 'Failed to batch delete photos', error);
        }
    }
}

module.exports = PhotoController;
