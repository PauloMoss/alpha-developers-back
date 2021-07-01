import supertest from 'supertest';
import '../setup.js';
import app from '../app.js';
import connection from '../database.js';
import {fake_data, fillProducts, login} from "./utils.js";

beforeEach(async () =>{
    await connection.query('DELETE FROM products');
    await connection.query('DELETE FROM users');
    await connection.query('DELETE FROM sessions');
})

afterAll(async () => {
    await connection.query('DELETE FROM products');
    await connection.query('DELETE FROM users');
    await connection.query('DELETE FROM sessions');
    connection.end();
})

describe("GET products", () => {
    
    it("returns status 200 and Object with products for authorized user", async () => {
        await fillProducts(fake_data);

        const token = await login();

        const result = await supertest(app).get("/products").set('Authorization', `Bearer ${token}`);
        expect(result.status).toEqual(200);
        expect(result.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    price: expect.any(Number),
                    description: expect.any(String),
                    image: expect.any(String),
                    inStock: expect.any(Number)
                })
            ])
          );
    })

    it("returns 401 for unauthorized user", async () => {

        const result = await supertest(app).get("/products").set('Authorization','Bearer invalid_token');
        expect(result.status).toEqual(401);
    })
})