import { Router } from "express"
import { getProducts, getProductById} from "../controllers/product.controllers.js"
import { tokenValidation } from "../middlewares/tokenValidation.middleware.js"

const productRoutes = Router()

productRoutes.get("/products", tokenValidation, getProducts)
productRoutes.get("/products/:id",tokenValidation, getProductById)

export default productRoutes