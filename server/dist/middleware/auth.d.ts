import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        name: string;
        role: string;
        client_id?: number | null;
    };
}
export declare function generateToken(payload: {
    id: number;
    email: string;
    name: string;
    role: string;
    client_id?: number | null;
}): string;
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void;
export declare function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map