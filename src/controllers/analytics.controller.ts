import { Response } from "express";
// import {PrismaClient} from "@prisma/client/extension";
import { AuthRequest } from "../middlewares/auth.middleware";

import { PrismaClient } from '/generated/prisma/edge'

const prisma = new PrismaClient()
// use `prisma` in your application to read and write data in your DB

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  const urls = await prisma.url.findMany({
    where: { userId: req.userId },
    include: { clicks: true },
  });

  res.json(urls);
};
