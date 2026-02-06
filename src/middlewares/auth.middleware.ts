import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Define a type for the JWT payload for better type safety
interface UserPayload {
  userId: string;
  email: string;
  role: string;
}

// Extend the Request interface to include the user payload
export interface AuthRequest extends Request {
  user?: UserPayload;
  userId?: string; // Keep for backwards compatibility with controllers
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;

    // Attach the entire decoded payload to the request object
    req.user = decoded;
    // For compatibility with existing controllers that use req.userId
    req.userId = decoded.userId;

    if (!req.userId) {
      return res.status(401).json({ message: "Invalid token: User ID missing" });
    }

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
