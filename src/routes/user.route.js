import { Router } from "express";

const router = Router();

router.post("/users" , registerUser);
router.post("/login", loginUser);

export default router;

