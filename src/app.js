import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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
//apenas para testes do front-end
app.post("/insert_fake_products",(req,res)=>{
    const fake_data = [
        {
            id: 1,
            name: "Avell A72 LIV - Prata",
            price: 699993,
            description: "Intel® Core™ i5-10750H (10ª. Ger. Até 5.0 GHZ);Tela 15.6” Full HD WVA 120Hz;GeForce™ GTX 1650Ti (4GB GDDR6);16GB de RAM DDR4;500GB SSD NVME;Apenas 2.1Kg;",
            image: 'https://images.avell.com.br/media/catalog/product/cache/1/small_image/350x262/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_6__2.jpg',        
            inStock: 0
        },
        {
            id: 2,
            name: "Avell A62 LIV - Preto", 
            price: 1799993,
            description: "Intel® Core™ i7-10750H (10ª. Ger. Até 5.0 GHZ);Tela 15.6” Full HD WVA 120Hz;GeForce™ GTX 1650Ti (4GB GDDR6);32GB de RAM DDR4;500GB SSD NVME;Apenas 2.1Kg;",
            image: 'https://images.avell.com.br/media/catalog/product/cache/1/small_image/350x262/9df78eab33525d08d6e5fb8d27136e95/a/6/a60-_12_.jpg',        
            inStock: 3
        },
        {
            id: 3,
            name: "Avell A52 LIV - branco", 
            price: 599993,
            description: "Intel® Core™ i3-10750H (10ª. Ger. Até 5.0 GHZ);Tela 15.6” Full HD WVA 120Hz;GeForce™ GTX 1650Ti (4GB GDDR6);8GB de RAM DDR4;500GB SSD NVME;Apenas 2.1Kg;",
            image: 'https://images7.kabum.com.br/produtos/fotos/131367/notebook-samsung-book-x30-intel-core-i5-10210u-8gb-1tb-tela-15-6-windows-10-home-branco-np550xcj-kf2br_1605290217_g.jpg',        
            inStock: 5
        }
    ]
    fake_data.forEach(async({id,name,price,description,image,inStock})=>{
        const result = await connection.query(`
        INSERT INTO products
        (id, name, price, description, image, "inStock") 
        VALUES ($1,$2,$3,$4,$5,$6)
    `,[id,name,price,description,image,inStock]);
    });
    res.sendStatus(201);
})

app.get("/products", async(req, res)=>{
    try{
        const authorization = req.headers['authorization'];
        const token = authorization?.replace('Bearer ', '');

        if (!authorization || !token){
            return res.sendStatus(401);
        }

        const {rows: user} = await connection.query(`
            SELECT * FROM sessions
            JOIN users
            ON sessions."userId" = users.id
            WHERE sessions.token = $1
        `, [token]);
        
        if (user.length === 0){
            return res.sendStatus(401);
        }

        const products = await connection.query(`
            SELECT * FROM products
        `)
        console.log(products.rows);
        res.send(products.rows);
    }catch(e){
        console.log(e.error);
        res.sendStatus(500);
    };
});
export default app;