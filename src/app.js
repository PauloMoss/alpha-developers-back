import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { stripHtml } from "string-strip-html";

import connection from './database.js';
import { signUpSchema } from './schemas/usersSchemas.js';


const app = express();

app.use(cors());
app.use(express.json());

app.post("/sign-up", async (req, res) => {
    try{
        const alreadyUsing = await connection.query(`
            SELECT * FROM users 
            WHERE email = $1
        `, [req.body.email]);

        if(alreadyUsing.rows.length) {
            return res.sendStatus(409)
        }

        req.body.name = stripHtml(req.body.name).result.trim();
        req.body.cpf = stripHtml(req.body.cpf).result.trim();
        req.body.rg = stripHtml(req.body.rg).result.trim();

        const err = signUpSchema.validate(req.body).error;
        if(err) {
            return res.sendStatus(400)
        }
        const { name, email, password, cpf, rg } = req.body;

        const cryptPassword = bcrypt.hashSync(password, 10);

        await connection.query(`
            INSERT INTO users (name, email, password, cpf, rg) 
            VALUES ($1, $2, $3, $4, $5)
        `, [name, email, cryptPassword, cpf, rg]);
        
        res.sendStatus(201);
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }


})

export default app;