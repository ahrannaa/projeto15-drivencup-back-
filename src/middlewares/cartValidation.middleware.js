import { deleteProductsSchema } from "../models/cart.model.js";

export async function cartValidationSchema(req, res, next) {
    const { productId } = req.body

    const validation = deleteProductsSchema.validate({ productId }, { abortEarly: false })

    if (validation.error) {
        const erros = validation.error.details.map((detail) => detail.message)
        res.status(400).send(erros)
        return;
    }

    next()
}