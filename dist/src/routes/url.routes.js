"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const url_controller_1 = require("../controllers/url.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/shorten", auth_middleware_1.protect, url_controller_1.createShortUrl);
router.get("/:code", url_controller_1.redirectUrl);
exports.default = router;
