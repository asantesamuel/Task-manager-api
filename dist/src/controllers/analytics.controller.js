"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const extension_1 = require("@prisma/client/extension");
const prisma = new extension_1.PrismaClient();
const getAnalytics = async (req, res) => {
    const urls = await prisma.url.findMany({
        where: { userId: req.userId },
        include: { clicks: true },
    });
    res.json(urls);
};
exports.getAnalytics = getAnalytics;
