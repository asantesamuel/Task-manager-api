import { Response } from "express";
import {PrismaClient} from "@prisma/client/extension";
import { AuthRequest } from "../middlewares/auth.middleware";

const prisma = new PrismaClient();

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  const urls = await prisma.url.findMany({
    where: { userId: req.userId },
    include: { clicks: true },
  });

  res.json(urls);
};
