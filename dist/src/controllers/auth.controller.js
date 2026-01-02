"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const extension_1 = require("@prisma/client/extension");
const jwt_1 = require("../utils/jwt");
const prisma = new extension_1.PrismaClient();
const register = async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await prisma.user.create({
        data: { email, password: hashedPassword },
    });
    res.json({
        token: (0, jwt_1.generateToken)(user.id),
    });
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(401).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });
    res.json({ token: (0, jwt_1.generateToken)(user.id) });
};
exports.login = login;
