import { Router } from "express"
import { cartValidationSchema } from "../middlewares/cartValidation.middleware.js"
import { tokenValidation } from "../middlewares/tokenValidation.middleware.js"
import { registerCart, getCart, deleteCart, removeProduct } from "../controllers/cart.controllers.js"


const cartRoutes = Router()

cartRoutes.put("/carts", tokenValidation, registerCart)
cartRoutes.get("/carts", tokenValidation, getCart)
cartRoutes.delete("/carts", [cartValidationSchema, tokenValidation], removeProduct)
cartRoutes.post("/carts", tokenValidation, deleteCart)

export default cartRoutes
