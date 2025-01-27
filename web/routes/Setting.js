import express from "express";
import { addSetting, addsettingstandard, GetSetting } from "../controllers/Setting.js";
import { upload } from "../middleware/multer.js";

const SettingRoutes = express.Router();
SettingRoutes.post("/addsetting", upload.single("videoUrl"), addSetting);
SettingRoutes.post("/addsettingstandard", addsettingstandard);
SettingRoutes.get("/getsetting", GetSetting);
export default SettingRoutes;
