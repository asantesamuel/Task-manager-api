import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Extract userId from token (changed from 'id' to 'userId')
    req.userId = decoded.userId || decoded.id; // Support both for backwards compatibility
    
    // Optional: Add logging for debugging (remove in production)
    console.log("Auth middleware - Token verified for user:", req.userId);
    
    return next();
  } catch (err: any) {
    console.error("Token verification failed:", err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    
    return res.status(401).json({ message: "Invalid token" });
  }
};
