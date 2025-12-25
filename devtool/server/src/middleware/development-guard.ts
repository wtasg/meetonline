import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware to ensure DevTools endpoints only work in development mode
 */
export function developmentOnly(_req: Request, res: Response, next: NextFunction): void {
    if (process.env.NODE_ENV !== 'development') {
        res.status(403).json({
            ok: false,
            message: 'DevTools are only available in development mode'
        });
        return;
    }
    next();
}
