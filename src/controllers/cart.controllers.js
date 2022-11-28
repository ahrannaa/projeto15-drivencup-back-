import { productCollection, sessionsCollection, cartCollection } from "../database/db.js"
import { ObjectId } from "mongodb";

const cartNotExist = (cart) => {
    return !cart || cart.products.length == 0
}

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

export async function registerCart(req, res) {
    const newProduct = req.body
    const user = res.locals.user

    try {
        const cart = await cartCollection.findOne({ userId: user._id })
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
}

export async function getCart(req, res) {
    try {
        const user = res.locals.user
        const cart = await cartCollection.findOne({ userId: user._id })

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
}

export async function removeProduct(req, res) {
    const { productId } = req.body
    const user = res.locals.user

    try {
        const cart = await cartCollection.findOne({ userId: user._id })
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
}

export async function deleteCart(req, res) {
    const { cartId } = req.body

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
}

