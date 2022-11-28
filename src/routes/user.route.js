import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controllers.js";

const router = Router();

router.post("/users" , registerUser);
router.post("/login", loginUser);

export default router;

