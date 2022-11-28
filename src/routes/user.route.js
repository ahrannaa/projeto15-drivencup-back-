import { Router } from "express"
import { loginUser, registerUser } from "../controllers/user.controllers.js"
import { loginSchemaValidation, userSchemaValidation } from "../middlewares/userSchemaValidation.middlewares.js"

const userRoutes = Router()

userRoutes.post("/users", userSchemaValidation, registerUser)
userRoutes.post("/login", loginSchemaValidation, loginUser)

export default userRoutes
