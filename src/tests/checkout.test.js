import supertest from 'supertest';
import '../setup.js';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import connection from '../database.js';

let userId;
let sessionId;
let token;

beforeEach(async () =>{
    await connection.query('DELETE FROM products');
    await connection.query('DELETE FROM users');
    await connection.query('DELETE FROM sessions');
    userId = await connection.query(`
        INSERT INTO users (name, email, password) 
        VALUES ('teste', 'teste@teste', '123456') RETURNING id
    `);
    sessionId = await connection.query(`
        INSERT INTO sessions ("userId", token)
        VALUES ($1, 'meutokenfalso') RETURNING id
    `, [userId.rows[0].id]);

    const secretKey = process.env.JWT_SECRET;
    const dados = { userId: userId.rows[0].id, sessionId: sessionId.rows[0].id }
    token = jwt.sign(dados, secretKey, { expiresIn: 30 });

    await connection.query(`
        UPDATE sessions SET token = $1 WHERE id = $2;
    `, [token, sessionId.rows[0].id]);
})
   

afterAll(async () => {
    await connection.query('DELETE FROM products');
    await connection.query('DELETE FROM users');
    await connection.query('DELETE FROM sessions');
    connection.end();
})

describe("POST /checkout", () => {
    it("returns empty array for empty cart products", async () => {
        const result = await supertest(app).post("/checkout").send([]).set('Authorization',`Bearer ${token}`);
        expect(result.status).toEqual(200);
        expect(result.body).toEqual([]);
    })

    it("returns 401 for unauthorized user", async () => {
        const result = await supertest(app).post("/checkout").send([]).set('Authorization','Bearer fsefxdr3151dr6g5dxr6');
        expect(result.status).toEqual(401);
    })
})

describe("POST /purchase", () => {

    it("returns 401 for unauthorized user", async () => {
        const result = await supertest(app).post("/purchase").send([]).set('Authorization','Bearer fsefxdr3151dr6g5dxr6');
        expect(result.status).toEqual(401);
    })

    it("returns 200 for successful purchase", async () => {
        const body = {cart:[{id:1, orderQuantity: 1, instock: 10}] }
        const result = await supertest(app).post("/purchase").send(body).set('Authorization',`Bearer ${token}`);
        expect(result.status).toEqual(200);
    })

    it("returns 422 for out of stock products", async () => {
        const body = {cart:[{id:1, orderQuantity: 2, instock: 1}] }
        const result = await supertest(app).post("/purchase").send(body).set('Authorization',`Bearer ${token}`);
        expect(result.status).toEqual(422);
    })
})