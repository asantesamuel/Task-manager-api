"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectUrl = exports.createShortUrl = void 0;
const extension_1 = require("@prisma/client/extension");
const generateCode_1 = require("../utils/generateCode");
const prisma = new extension_1.PrismaClient();
const createShortUrl = async (req, res) => {
    const { originalUrl } = req.body;
    const url = await prisma.url.create({
        data: {
            originalUrl,
            shortCode: (0, generateCode_1.generateCode)(),
            userId: req.userId,
        },
    });
    res.json(url);
};
exports.createShortUrl = createShortUrl;
const redirectUrl = async (req, res) => {
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
exports.redirectUrl = redirectUrl;
