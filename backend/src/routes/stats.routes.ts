import { Router } from "express";
import { getTemplateStatsController, getAllTemplateMessagesController } from "../controllers/stats.controller";
import { checkAuth } from "../middlewares/checkAut";

export const router = Router();

router.get("/", checkAuth, getTemplateStatsController);
router.get("/template-messages", checkAuth, getAllTemplateMessagesController);

export default router;
