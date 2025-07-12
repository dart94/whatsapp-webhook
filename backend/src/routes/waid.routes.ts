import { Router } from "express";
import { getUniqueWaidsController } from "../controllers/waid.controller";

const router = Router();

router.get("/", getUniqueWaidsController);

export default router;