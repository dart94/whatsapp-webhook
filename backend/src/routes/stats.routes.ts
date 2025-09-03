import { Router } from "express";
import { getTemplateStatsController } from "../controllers/stats.controller";
import { checkAuth } from "../middlewares/checkAut";

export const router = Router();

router.get("/", checkAuth, getTemplateStatsController);

export default router;
