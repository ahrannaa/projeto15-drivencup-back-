import { userCollection, sessionsCollection } from "../database/db.js"

const FORBIDDEN_MSG = "Não autorizado"

export async function tokenValidation(req, res, next) {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    try {
        const session = await sessionsCollection.findOne({ token })
        if (!session) {
            res.status(403).send(FORBIDDEN_MSG)
            return
        }

        const user = await userCollection.findOne({ _id: session.userId })
        res.locals.user = user
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
    next()
}