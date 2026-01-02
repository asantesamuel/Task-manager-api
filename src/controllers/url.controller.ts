import { Response } from "express";
// import { PrismaClient } from "@prisma/client/extension";
import { generateCode } from "../utils/generateCode";
import { AuthRequest } from "../middlewares/auth.middleware";

import { PrismaClient } from './generated/prisma/edge'

const prisma = new PrismaClient()
// use `prisma` in your application to read and write data in your DB

export const createShortUrl = async (req: AuthRequest, res: Response) => {
  const { originalUrl } = req.body;

  const url = await prisma.url.create({
    data: {
      originalUrl,
      shortCode: generateCode(),
      userId: req.userId!,
    },
  });

  res.json(url);
};

export const redirectUrl = async (req: any, res: Response) => {
  const { code } = req.params;

  const url = await prisma.url.findUnique({
    where: { shortCode: code },
  });

  if (!url || !url.isActive)
    return res.status(404).json({ message: "Link not found" });

  await prisma.click.create({
    data: {
      urlId: url.id,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    },
  });

  res.redirect(url.originalUrl);
};
