import express from "express";
import { uploadVideo, getVideos, deleteVideo } from "../controllers/videoController.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = express.Router();

router.post("/upload", verifyJWT, uploadVideo);
router.get("/list", verifyJWT, getVideos);
router.delete("/:videoId", verifyJWT, deleteVideo);

export default router;
