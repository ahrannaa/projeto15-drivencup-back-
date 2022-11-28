import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.route.js"
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import purchaseRoutes from "./routes/purchase.route.js";

const app = express()
app.use(cors())
app.use(express.json())
app.use(userRoutes);
app.use(productRoutes)
app.use(cartRoutes)
app.use(purchaseRoutes)


const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running in port: ${port}`));