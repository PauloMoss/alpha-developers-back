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
        const { name, email, password, cpf, rg, address, city, state } = req.body;

        const cryptPassword = bcrypt.hashSync(password, 10);

        const user = await connection.query(`
            INSERT INTO users (name, email, password, cpf, rg) 
            VALUES ($1, $2, $3, $4, $5) RETURNING id
        `, [name, email, cryptPassword, cpf, rg]);

        await connection.query(`
            INSERT INTO addresses ("userId", address, city, state) 
            VALUES ($1, $2, $3, $4)
        `, [user.rows[0].id, address, city, state]);

        res.sendStatus(201);
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
})

app.get("/test", (req,res) => {
    res.send("testado")
})

export default app;