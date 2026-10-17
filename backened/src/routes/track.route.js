import { Router } from "express";
import { searchTracks } from "../controller/track.controller.js";

const router = Router();

router.get("/search", searchTracks);

export default router;
