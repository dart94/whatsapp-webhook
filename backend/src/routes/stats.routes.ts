import { Router } from "express";
import { getTemplateStatsController } from "../controllers/stats.controller";

export const router = Router();

router.get("/", getTemplateStatsController);

export default router;
