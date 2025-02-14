import { Router } from "express";
import { loginUser, registerUser } from "../controllers/auth";

const router = Router();

router.post("/login", loginUser);
router.post("/register", registerUser);

export default router;
