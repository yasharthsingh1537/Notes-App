import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authorization required",
    });
  }

  const match = authHeader.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return res.status(401).json({
      message: "Invalid authorization format",
    });
  }

  const token = match[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next(new Error("JWT_SECRET is not configured"));
  }

  try {
    const decode = jwt.verify(token, secret);

    if (typeof decode === "string" || typeof decode.userId !== "string") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    res.locals.auth = {
      userId: decode.userId,
    };

    return next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}
