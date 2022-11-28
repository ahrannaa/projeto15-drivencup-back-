import bcrypt from "bcrypt"
import { v4 as uuidV4 } from "uuid"
import { userCollection, sessionsCollection } from "../database/db.js"

export async function registerUser(req, res) {
    console.log("#### PASSEI NO CONTROLLER")
    const { password, email, name } = req.body
    try {
        const hashPassword = bcrypt.hashSync(password, 10)
        await userCollection.insertOne({ name, email, password: hashPassword })
        res.sendStatus(201)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
}

export async function loginUser(req, res) {
    try {
        const { _id, name, email } = await userCollection.findOne({ email: req.body.email })
        const session = await sessionsCollection.findOne({ userId: _id })
        const token = uuidV4()

        if (!session) {
            await sessionsCollection.insertOne({ token, userId: _id })
        }

        res.send({ name, email, token })

    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
}