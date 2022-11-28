import joi from "joi";

export const usersSchema = joi.object({
    email: joi.string().required().email(),
    name: joi.string().required().min(3),
    password: joi.string().required(),
    confirmedPassword: joi.string().required(),
})

export const loginSchema = joi.object({
    email: joi.string().required().email(),
    password: joi.string().required(),
})