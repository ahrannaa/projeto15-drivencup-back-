import express from "express";
import cors from "cors";
import { ObjectId } from "mongodb";
import joi from "joi";
import bcrypt from "bcrypt"
import { v4 as uuidV4 } from "uuid"


const deleteProductsSchema = joi.object({
    productId: joi.string().required(),
})

const app = express()
app.use(cors())
app.use(express.json())

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

app.post("/users", async (req, res) => {
    const { name, email, password, confirmThePassword } = req.body

    const validation = usersSchema.validate({ email, name, password }, { abortEarly: false })

    if (validation.error) {
        const erros = validation.error.details.map((detail) => detail.message)
        res.status(400).send(erros)
        return;
    }

    try {
        const user = await userCollection.findOne({ email })

        if (user != null) {
            res.status(409).send("Esse email já existe. Tente outro!")
            return;
        }

        if (password != confirmThePassword) {
            res.status(400).send("Senhas diferentes")
            return;
        }
        const hashPassword = bcrypt.hashSync(password, 10)
        console.log(hashPassword)

        await userCollection.insertOne({ name, email, password: hashPassword })
        res.sendStatus(201)



    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }

}

)

app.post("/login", async (req, res) => {
    const { email, password } = req.body
    const token = uuidV4()

    const validation = loginSchema.validate({ email, password }, { abortEarly: false })

    if (validation.error) {
        const erros = validation.error.details.map((detail) => detail.message)
        res.status(400).send(erros)
        return;
    }

    try {
        const user = await userCollection.findOne({ email })
        if (!user) {
            res.status(401).send("Não autotizado")
            return;
        }

        const passwordOk = bcrypt.compareSync(password, user.password)
        if (!passwordOk) {
            res.status(401).send("Não autorizado")
            return
        }

        const tokenExist = await sessionsCollection.findOne({ userId: user._id })
        if (!tokenExist) {
            await sessionsCollection.insertOne({
                token,
                userId: user._id
            })
            res.send({ token })
            return;
        }
        res.send({user:user.name, email:user.email, token:tokenExist.token })


    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }

}
)

app.get("/products", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    try {
        const session = await sessionsCollection.findOne({ token })
        if (!session) {
            res.send("Não autorizado")
            return;
        }

        const products = await productCollection.find().toArray()
        const parcialProducts = products.map(({ _id, name, image, price }) => ({ _id: _id.toString(), name, image, price }))

        res.send(parcialProducts)
        console.log(parcialProducts)

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }

})

app.get("/products/:id", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")
    const { id } = req.params;

    try {
        const session = await sessionsCollection.findOne({ token })
        if (!session) {
            res.send("Não autorizado!")
            return;
        }

        const product = await productCollection.findOne({ _id: ObjectId(id) })

        if (!product) {
            res.status(404).send("Esse produto não existe!")
            return;
        }

        res.send(product)

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

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