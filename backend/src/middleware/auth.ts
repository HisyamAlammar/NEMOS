/**
 * middleware/auth.ts — JWT Authentication Middleware
 *
 * Extracts and verifies JWT from Authorization header.
 * Attaches user info to req.user for downstream handlers.
 */
import { Request, Response, NextFunction } from "express";
import { verifyToken, AppError } from "../services/auth.service";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Token autentikasi diperlukan. Format: Bearer <token>",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        error: "UNAUTHORIZED",
        message: error.message,
      });
      return;
    }
    res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Token tidak valid",
    });
  }
}
