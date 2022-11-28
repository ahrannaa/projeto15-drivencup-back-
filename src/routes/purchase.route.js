import { Router } from "express"
import { registerPurchases } from "../controllers/purchase.controllers.js"
import { tokenValidation } from "../middlewares/tokenValidation.middleware.js"


const purchaseRoutes = Router()

purchaseRoutes.post("/purchases",tokenValidation,registerPurchases)

export default purchaseRoutes