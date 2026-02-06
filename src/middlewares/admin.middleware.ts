import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  // The 'protect' middleware should have already run and attached the user payload.
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({ message: "Forbidden: Admin access required" });
};
