import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import joi from "joi";
import bcrypt from "bcrypt"
import { v4 as uuidV4 } from "uuid"

const validacaoSchema = joi.object({
    email: joi.string().required().email(),
    name: joi.string().required().min(3),
    password: joi.string().required(),
})


const app = express()
dotenv.config()
app.use(cors())
app.use(express.json())

const mongoClient = new MongoClient(process.env.MONGO_URI)

try {
    await mongoClient.connect()
    console.log("MongoDb Conectado")
} catch (err) {
    console.log(err)
}

const db = mongoClient.db("drivenCup");
const userCollection = db.collection("users")
const productCollection = db.collection("products")
const sessionsCollection = db.collection("sessions")

app.post("/users", async (req, res) => {
    const { name, email, password, confirmThePassword } = req.body

    const validation = validacaoSchema.validate({ email, name, password, image }, { abortEarly: false })

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

        await userCollection.insertOne({ name, email, password: hashPassword, image })
        res.sendStatus(201)



    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }

}

)

app.post("/login", async (req, res) =>{
    const { email, password } = req.body
    const token = uuidV4()

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
            await db.collection("sessions").insertOne({
                token,
                userId: user._id
            })
            res.send({ token })
            return;
        }
        res.send({ token: tokenExist.token })


    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }

}
)

app.listen(5000, console.log("Server running in port: 5000"))