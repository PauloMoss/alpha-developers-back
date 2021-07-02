import supertest from 'supertest';
import '../setup.js';
import app from '../app.js';
import connection from '../database.js';
import {login, fillProducts, fake_products, fillProductsImages, fake_ProductImages, getProductId} from "./utils.js";

/*beforeEach(async () =>{
    await connection.query('DELETE FROM products');
    await connection.query('DELETE FROM images');
    await connection.query('DELETE FROM users');
    await connection.query('DELETE FROM sessions');
})

afterAll(async () => {
    await connection.query('DELETE FROM products');
    await connection.query('DELETE FROM images');
    await connection.query('DELETE FROM users');
    await connection.query('DELETE FROM sessions');
    connection.end();
})

describe("GET products", () => {
    
    it("returns status 200 and Object with products for authorized user", async () => {
        await fillProducts(fake_products);
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
        await fillProducts(fake_products);
        const result = await supertest(app).get("/products").set('Authorization','Bearer invalid_token');
        expect(result.status).toEqual(401);
    })
    
})
describe("GET product/:id", () => {

    it("returns 200 and product object for authorized user in a existent product page", async () => {
        await fillProducts(fake_products);
        await fillProductsImages(fake_ProductImages);

        const test_id = await getProductId();
        const token = await login();

        console.log("test_id",test_id);

        const result = await supertest(app).get(`/product/${test_id}`).set('Authorization',`Bearer ${token}`);
        expect(result.status).toEqual(200)
        expect(result.body).toEqual(
            expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
                price: expect.any(Number),
                description: expect.any(String),
                image: expect.any(String),
                images: expect.arrayContaining([
                    expect.any(String)
                ]),
                inStock: expect.any(Number)
            })
        );
    });

    it("returns 401 for unauthorized user", async () => {
        await fillProducts(fake_products);
        await fillProductsImages(fake_ProductImages)
        const test_id = await getProductId();

        const result = await supertest(app).get(`/product/${test_id}`).set('Authorization','Bearer invalid_token');
        expect(result.status).toEqual(401);
    });

    it("returns 404 for authorized user in an inexistent product page", async () => {
        await fillProducts(fake_products);
        await fillProductsImages(fake_ProductImages)
        const token = await login();

        const result = await supertest(app).get("/products/inexistent_product_id").set('Authorization',`Bearer ${token}`);
        expect(result.status).toEqual(404);
    });
});*/