import express from "express";
import authRoute from "./authRoute.js";
import userRoute from "./userRoute.js";
import chatRoute from "./chatRoute.js";
import videoRoute from "./videoRoute.js";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/chat", chatRoute);
router.use("/user", userRoute);
router.use("/video", videoRoute);

export default router;