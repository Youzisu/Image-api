class ResponseHelper {
    // 成功响应
    static success(res, data = null, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    // 分页成功响应
    static successWithPagination(res, data, pagination, message = 'Success') {
        return res.status(200).json({
            success: true,
            message,
            data,
            pagination,
            timestamp: new Date().toISOString()
        });
    }

    // 错误响应
    static error(res, message = 'Error', statusCode = 400, error = null) {
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString()
        };

        if (error && process.env.NODE_ENV === 'development') {
            response.error = error;
        }

        return res.status(statusCode).json(response);
    }

    // 验证错误响应
    static validationError(res, errors) {
        return res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors,
            timestamp: new Date().toISOString()
        });
    }

    // 未授权响应
    static unauthorized(res, message = 'Unauthorized') {
        return res.status(401).json({
            success: false,
            message,
            timestamp: new Date().toISOString()
        });
    }

    // 禁止访问响应
    static forbidden(res, message = 'Forbidden') {
        return res.status(403).json({
            success: false,
            message,
            timestamp: new Date().toISOString()
        });
    }

    // 未找到响应
    static notFound(res, message = 'Resource not found') {
        return res.status(404).json({
            success: false,
            message,
            timestamp: new Date().toISOString()
        });
    }

    // 服务器错误响应
    static serverError(res, message = 'Internal server error', error = null) {
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString()
        };

        if (error && process.env.NODE_ENV === 'development') {
            response.error = error.message || error;
        }

        return res.status(500).json(response);
    }
}

module.exports = ResponseHelper;
