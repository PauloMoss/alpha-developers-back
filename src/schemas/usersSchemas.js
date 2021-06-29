import joi from 'joi';

const signUpSchema = joi.object({
    name: joi.string().min(3).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    confirmPassword: joi.ref('password'),
    cpf: joi.string().length(14).required(),
    rg: joi.string().length(12).required(),
    address: joi.string().required(),
    city: joi.string().required(),
    state: joi.string().required()
})

export {
    signUpSchema
}