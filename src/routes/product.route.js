import { Router } from "express"
import { products, productsId } from "../controllers/product.controllers.js"

const productRoutes = Router()

productRoutes.get("/products", products)
productRoutes.get("/products/:id",productsId)

export default productRoutes