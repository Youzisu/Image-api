const express = require('express');
const PhotoService = require('../services/photo.service');

const router = express.Router();

// 首页 - 显示照片列表
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 12 } = req.query;
        const result = await PhotoService.getPhotos(page, limit);

        res.render('index', {
            title: 'Photos Gallery',
            photos: result.data,
            pagination: result.pagination,
            currentUrl: req.originalUrl
        });
    } catch (error) {
        console.error('Homepage error:', error);
        res.render('index', {
            title: 'Photos Gallery',
            photos: [],
            pagination: null,
            error: 'Failed to load photos'
        });
    }
});

// 随机照片页面
router.get('/random', async (req, res) => {
    try {
        const photo = await PhotoService.getRandomPhoto();
        res.render('random', {
            title: 'Random Photo',
            photo
        });
    } catch (error) {
        console.error('Random photo error:', error);
        res.render('random', {
            title: 'Random Photo',
            photo: null,
            error: 'No photos available'
        });
    }
});

// 照片列表页面
router.get('/list', async (req, res) => {
    try {
        const { page = 1, limit = 20, tags, search } = req.query;
        
        const filters = {};
        if (tags) filters.tags = tags;
        if (search) filters.search = search;

        const result = await PhotoService.getPhotos(page, limit, filters);

        res.render('list', {
            title: 'Photo List',
            photos: result.data,
            pagination: result.pagination,
            filters: { tags, search },
            currentUrl: req.originalUrl
        });
    } catch (error) {
        console.error('Photo list error:', error);
        res.render('list', {
            title: 'Photo List',
            photos: [],
            pagination: null,
            filters: {},
            error: 'Failed to load photos'
        });
    }
});

// API 文档页面
router.get('/docs', (req, res) => {
    res.render('docs', {
        title: 'API Documentation'
    });
});

module.exports = router;
