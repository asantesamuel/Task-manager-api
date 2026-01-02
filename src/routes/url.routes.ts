import { Router } from "express";
import { createShortUrl, redirectUrl } from "../controllers/url.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/shorten", protect, createShortUrl);
router.get("/:code", redirectUrl);

export default router;
