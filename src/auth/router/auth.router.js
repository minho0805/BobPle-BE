import express from "express";
import {
  handleLogin,
  handleLogout,
  handleRefresh,
} from "../controller/auth.controller.js";

const router = express.Router({ mergeParams: true });
// router.get("/login", (req, res, next) => {
//   res.send("auth");
// });
router.post("/login", handleLogin);
router.post("/logout", handleLogout);
router.post("/refresh", handleRefresh);
export default router;
