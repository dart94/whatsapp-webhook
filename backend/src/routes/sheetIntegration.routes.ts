import { Router } from "express";
import { handleRegisterSheet, handleListSheets, handleGetSheet } from "../controllers/sheetIntegration.controller";

const router = Router();

router.post("/register", handleRegisterSheet);
router.get("/list", handleListSheets);
router.get("/:id", handleGetSheet);

export default router;