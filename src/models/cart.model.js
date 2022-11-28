import joi from "joi"

export const deleteProductsSchema = joi.object({
    productId: joi.string().required(),
})