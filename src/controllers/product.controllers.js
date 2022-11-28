import { productCollection, sessionsCollection } from "../database/db.js"
import { ObjectId } from "mongodb";

export async function getProducts(req, res) {
    console.log("#### PASSEI NO CONTROLLER")

    try {
        const products = await productCollection.find().toArray()
        const parcialProducts = products.map(({ _id, name, image, price }) => ({ _id: _id.toString(), name, image, price }))

        res.send(parcialProducts)

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
}

export async function getProductById(req, res) {
    const { id } = req.params;

    try {
        const product = await productCollection.findOne({ _id: ObjectId(id) })

        if (!product) {
            res.status(404).send("Esse produto não existe!")
            return
        }

        res.send(product)
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
}