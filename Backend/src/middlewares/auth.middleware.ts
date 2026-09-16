import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayLoad } from "../utils/generateToken";

export interface AuthRequest extends Request {
    user?: TokenPayLoad;
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized token diperlukan"
            });
        }
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Format token harus Bearer <token>",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token tidak ditemukan",
            });
        }

        const decode = verifyAccessToken(token);

        req.user = decode;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token tidak valid",
        });
    }
};