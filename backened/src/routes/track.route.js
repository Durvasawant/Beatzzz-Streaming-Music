import { Router } from "express";
import { listTracks, searchTracks, resolveTrack } from "../controller/track.controller.js";

const router = Router();

router.get("/", listTracks);
router.get("/search", searchTracks);
router.post("/:id/resolve", resolveTrack);

export default router;
