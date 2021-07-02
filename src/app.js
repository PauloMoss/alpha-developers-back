import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { stripHtml } from "string-strip-html";
import {fillProducts, fake_products, fillProductsImages, fake_ProductImages} from "./tests/utils.js"; //remove before send to production!

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

app.post("/checkout", async (req,res) => {
    try{
        const authorization = req.headers['authorization'];
        const token = authorization?.replace('Bearer ', '');
        const chaveSecreta = process.env.JWT_SECRET;
        const validation = ()=>{
            try{
                return jwt.verify(token, chaveSecreta);
                
            } catch{
                return undefined
            }
        }
        const dados = validation();
        if(dados) {
            const userCart = req.body;
            if(!userCart?.length){
                return res.send([])
            }
            let productsTemplateIds = "";
            userCart.forEach(c => productsTemplateIds += `${c.productId},`);
        
            const result = await connection.query(`
                SELECT * FROM products 
                WHERE id in (${productsTemplateIds.slice(0,-1)})
            `);
            const cartProducts = result.rows;
            const cartToReturn = cartProducts.map((c,i) => ({...c, orderQuantity: userCart[i].quantity}));
            res.send(cartToReturn);
        } else {
            res.sendStatus(401)
        }
    } catch (e){
        console.log(e)
        res.sendStatus(500)
    }
});

app.post("/purchase", async (req,res) => {
    try{
        const authorization = req.headers['authorization'];
        const token = authorization?.replace('Bearer ', '');
        const chaveSecreta = process.env.JWT_SECRET;
        const validation = ()=>{
            try{
                return jwt.verify(token, chaveSecreta);
                
            } catch{
                return undefined
            }
        }
        const dados = validation();
        
        if(dados) {
            let purchase = "";
            const purchaseBag = req.body.cart;
            purchaseBag.sort((a,b) =>{
                if(a.id > b.id) return 1;
                if(a.id < b.id) return -1;
                return 0;
            });

            const productRemainingQuantity = {};
    
            purchaseBag.forEach(p => {
                purchase +=`(${p.id},${dados.userId},NOW(),${p.orderQuantity}),`;
                productRemainingQuantity[p.id] = p.orderQuantity;
                if(p.inStock < p.orderQuantity) {
                    return res.sendStatus(422)
                }
            });
            await connection.query(`
                INSERT INTO sales 
                ("productId", "userID", date, quantity) 
                VALUES ${purchase.slice(0,-1)};
            `);
    
            let productsTemplateIds = "";
            purchaseBag.forEach(c => productsTemplateIds += `${c.id},`);
    
            const result = await connection.query(`
                SELECT * FROM products 
                WHERE id IN (${productsTemplateIds.slice(0,-1)})
            `);
    
            let productsInStock = "";
            result.rows.forEach((c,i) => {
                productRemainingQuantity[c.id] = c.inStock - productRemainingQuantity[c.id];
                productsInStock += `(${Number(productRemainingQuantity[c.id])}),`
            });
    
            await purchaseBag.forEach(p => {
                connection.query(`
                    UPDATE products 
                    SET "inStock" = ${productRemainingQuantity[p.id]}
                    WHERE id = ${p.id}
                `);
            });
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }
    } catch(e) {
        console.log(e);
        res.sendStatus(500)
    }
})

//populate products db - use for front-end test; ! remove before send to production !
app.post("/insert_fake_products", async (req,res)=>{
    if (req.body){
        await fillProducts(fake_products);
    };
    res.sendStatus(201);
})
app.post("/insert_fake_products_images", async (req,res)=>{
    if (req.body){
        await fillProductsImages(fake_ProductImages);
    };
    res.sendStatus(201);
});

app.get("/products", async(req, res)=>{
    try{
        const authorization = req.headers['authorization'];
        const token = authorization?.replace('Bearer ', '');

        if (!authorization || !token){
            return res.sendStatus(401);
        };
        const userData = jwt.verify(token, process.env.JWT_SECRET);

        const {rows: user} = await connection.query(`
            SELECT * FROM sessions
            JOIN users
            ON sessions."userId" = users.id
            WHERE sessions.id = $1
        `, [userData.sessionId]);

        if (user.length === 0){
            return res.sendStatus(401);
        };

        const products = await connection.query(`
            SELECT * FROM products
        `);
        res.send(products.rows);
    }catch(e){
        console.log(e.error);
        res.sendStatus(500);
    };
});

app.get("/product/:id",async(req,res)=>{
    try{
        const {id} = req.params;
        const authorization = req.headers['authorization'];
        const token = authorization?.replace('Bearer ', '');

        if (!authorization || !token){
            return res.sendStatus(401);
        };

        const userData = jwt.verify(token, process.env.JWT_SECRET);

        const {rows: user} = await connection.query(`
            SELECT * FROM sessions
            JOIN users
            ON sessions."userId" = users.id
            WHERE sessions.id = $1
        `, [userData.sessionId]);

        if (user.length === 0){
            return res.sendStatus(401);
        };

        const product_result = await connection.query(`
            SELECT * FROM products
            WHERE id = $1
        `, [id]);

        if (product_result.rows.length === 0){
            return res.sendStatus(404);
        };

        const product = product_result.rows[0];
      
        const images_result = await connection.query(`
            SELECT * FROM images
            WHERE "productId" = $1
        `, [id]);

        if (images_result.rows.length === 0){
            product.images = [product.image]
        } else {
            const imagesArray = images_result.rows.map((i)=>(i.image))
            product.images = imagesArray;
        };
        res.send(product).status(200);
    }catch(e){
        console.log(e);
        res.sendStatus(500);
    };
});

export default app;