import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { stripHtml } from "string-strip-html";

import connection from './database.js';
import { signUpSchema, loginSchema } from './schemas/usersSchemas.js';


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

app.post("/login", async (req,res) => {
    try {
        req.body.email = stripHtml(req.body.email).result.trim();
        
        const err = loginSchema.validate(req.body).error;
        if(err) {
            console.log(err)
            return res.sendStatus(400);
        }

        const { email, password } = req.body
        const result = await connection.query(`
            SELECT * FROM users 
            WHERE email = $1
        `, [email]);
        const user = result.rows[0];

        if(user && bcrypt.compareSync(password, user.password)) {
            const secretKey = process.env.JWT_SECRET;

            const session = await connection.query(`
                INSERT INTO sessions ("userId")
                VALUES ($1) RETURNING id
            `, [user.id]);

            const dados = { userId: user.id, sessionId: session.rows[0].id }
            const token = jwt.sign(dados, secretKey, { expiresIn: 60*60*24*30 });

            await connection.query(`
                UPDATE sessions SET token = $1 WHERE id = $2;
            `, [token, session.rows[0].id]);
            
            res.send({id: user.id, name: user.name, email: user.email, token });

        } else {
            res.sendStatus(401);
        }
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
});

app.get("/checkout", async (req,res) => {

    const authorization = req.headers['authorization'];
    const token = authorization?.replace('Bearer ', '');
    const chaveSecreta = process.env.JWT_SECRET;
})

export default app;