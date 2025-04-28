import { Request, Response, NextFunction } from 'express';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Store original send method
    const originalSend = res.send;

    // Log request information
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    // Override send method to log response
    res.send = function (body) {
        // Log response
        console.log(`[${new Date().toISOString()}] Response for ${req.method} ${req.originalUrl}:`);
        console.log('Response Status:', res.statusCode);

        // Call original send method
        return originalSend.call(this, body);
    };

    next();
};