import { Request, Response } from "express";
import bcrypt from "bcrypt";
// import { PrismaClient } from "@prisma/client/extension";
import { generateToken } from "../utils/jwt";

import { PrismaClient } from './generated/prisma/edge'

const prisma = new PrismaClient()
// use `prisma` in your application to read and write data in your DB

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  res.json({
    token: generateToken(user.id),
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  res.json({ token: generateToken(user.id) });
};
