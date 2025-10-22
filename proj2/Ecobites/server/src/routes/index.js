import express from "express";
import { getHealth } from "../controller/healthController.js";

const router = express.Router();

router.get("/health", getHealth);

export default router;
