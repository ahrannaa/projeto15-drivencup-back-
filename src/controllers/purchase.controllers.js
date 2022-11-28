import { ObjectId } from "mongodb";
import { cartCollection, productCollection, purchaseCollection, userCollection } from "../database/db.js";



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
export async function registerPurchases(req, res) {
    const { payment, cartId } = req.body

    try {
        const cart = await cartCollection.findOne({ _id: ObjectId(cartId) })

        if (cartNotExist(cart)) {
            res.status(404).send("Carrinho não encontrado")
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
}