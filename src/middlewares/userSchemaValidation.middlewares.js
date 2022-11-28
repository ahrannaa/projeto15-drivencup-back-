import { loginSchema, usersSchema } from "../models/user.model.js";
import { userCollection } from "../database/db.js"
import bcrypt from "bcrypt"


const USER_ALREDY_EXISTS_MSG = "Usuário ja cadastrado"
const PASSWORDS_NOT_EQUAL = "As senhas informadas são diferentes"
const EMAIL_PASS_INVALID = "Email ou senha invalida"

function validateRequest(schema, body) {
    return schema.validate(body, { abortEarly: false })
}

async function userAlreadyExists(email) {
    const user = await userCollection.findOne({ email })
    return user != null
}

export async function userSchemaValidation(req, res, next) {
    const { email, password, confirmedPassword } = req.body
   
    const validation = validateRequest(usersSchema, req.body)

    if (validation.error) {
        const erros = validation.error.details.map((detail) => detail.message)
        res.status(400).send(erros)
        return
    }

    if (password != confirmedPassword) {
        res.status(400).send(PASSWORDS_NOT_EQUAL)
        return
    }

    const userExists = await userAlreadyExists(email)

    if(userExists) {
        res.status(409).send(USER_ALREDY_EXISTS_MSG)
        return
    }

  next()
}

export async function loginSchemaValidation(req, res, next) {
    const { email, password } = req.body

    const validation = validateRequest(loginSchema, { email, password })

    if (validation.error) {
        const erros = validation.error.details.map((detail) => detail.message)
        res.status(400).send(erros)
        return
    }

    const user = await userCollection.findOne({ email })

    if (!user  || !bcrypt.compareSync(password, user.password)) {
        res.status(401).send(EMAIL_PASS_INVALID)
        return
    }
    
  next();
}