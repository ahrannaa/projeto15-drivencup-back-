import express from "express";
import cors from "cors";
import { ObjectId } from "mongodb";
import joi from "joi";
import userRoutes from "./routes/user.route.js"
import productRoutes from "./routes/product.route.js";


const deleteProductsSchema = joi.object({
    productId: joi.string().required(),
})

const app = express()
app.use(cors())
app.use(express.json())
app.use(userRoutes);
app.use(productRoutes)

const getProducts = async (cart) => {
    const products = await Promise.all(cart.products.map(async (p) => {
        const product = await productCollection
            .findOne({ _id: ObjectId(p.productId) })

        return {
            ...product,
            amount: p.amount
        }
    }))

    return products
}

const cartNotExist = (cart) => {
    return !cart || cart.products.length == 0
}

app.put("/carts", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    const newProduct = req.body

    try {
        const session = await sessionsCollection.findOne({ token })
        if (!session) {
            res.send("Não autorizado")
            return;
        }

        const cart = await cartCollection.findOne({ userId: session.userId })
        if (!cart) {
            const newCart = {
                userId: session.userId,
                products: [newProduct], // {productId: 123, amout: 200}
            }
            await cartCollection.insertOne(newCart)
            res.send("Produto adicionado!")

        } else {
            let isNewProduct = true

            const newProducts = cart.products.map((product) => {
                if (product.productId == newProduct.productId) {
                    isNewProduct = false
                    return newProduct
                }
                return product
            })

            if (isNewProduct) {
                newProducts.push(newProduct)
            }

            await cartCollection.updateOne({ _id: cart._id }, { $set: { products: newProducts } })
            res.send("Produto adicionado")
        }

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

app.get("/carts", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    const session = await sessionsCollection.findOne({ token })
    console.log(session)
    if (!session) {
        res.send("Não autorizado")
        return;
    }

    try {
        const cart = await cartCollection.findOne({ userId: session.userId })

        if (cartNotExist(cart)) {
            res.sendStatus(404)
            return
        }

        const products = await getProducts(cart)

        res.send({ _id: cart._id.toString(), products })

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }

})

app.delete("/carts", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    const { productId } = req.body

    const validation = deleteProductsSchema.validate({ productId }, { abortEarly: false })

    if (validation.error) {
        const erros = validation.error.details.map((detail) => detail.message)
        res.status(400).send(erros)
        return;
    }

    const session = await sessionsCollection.findOne({ token })
    if (!session) {
        res.status(401).send("Não autorizado")
        return;
    }

    try {
        const cart = await cartCollection.findOne({ userId: session.userId })
        if (cartNotExist(cart)) {
            res.sendStatus(404)
            return
        }
        const products = cart.products.filter((p) => p.productId != productId)

        await cartCollection.updateOne({ _id: cart._id }, { $set: { products } })
        res.send("Produto removido")
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

app.post("/purchases", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    const { payment, cartId } = req.body

    const session = await sessionsCollection.findOne({ token })
    if (!session) {
        res.send("Não autorizado")
        return;
    }

    try {
        const cart = await cartCollection.findOne({ _id: ObjectId(cartId) })

        if (cartNotExist(cart)) {
            res.status(401).send("Não autotizado")
            return;
        }

        await purchaseCollection.insertOne({ payment, userId: cart.userId, products: cart.products })

        const user = await userCollection.findOne({ _id: cart.userId })
        const products = await getProducts(cart)

        const userData = {
            name: user.name,
            email: user.email,
            products: products,
            payment: req.body.payment
        }

        res.send(userData)

    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }

})

app.post("/carts", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    const { cartId } = req.body

    const session = await sessionsCollection.findOne({ token })
    if (!session) {
        res.send("Não autorizado")
        return;
    }

    try {
        const cart = await cartCollection.findOne({ _id: ObjectId(cartId) })

        if (cartNotExist(cart)) {
            res.status(401).send("Não autotizado")
            return;
        }

        const deletou = await cartCollection.deleteOne({ userId: cart.userId })
        console.log(deletou)
        res.send("Carrinho deletado!")

    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }


})

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running in port: ${port}`));