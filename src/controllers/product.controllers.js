import { productCollection, sessionsCollection } from "../database/db.js"
import { ObjectId } from "mongodb";

export async function products(req, res) {
    console.log("#### PASSEI NO CONTROLLER")

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
}

export async function productsId(req, res) {
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
}