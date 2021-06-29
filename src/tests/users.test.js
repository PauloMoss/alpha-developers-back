import supertest from 'supertest';
import '../setup.js';
import app from '../app.js';
import connection from '../database.js';

beforeEach(async () =>{
    await connection.query('DELETE FROM users');
})

afterAll(async () => {
    await connection.query('DELETE FROM users');
    connection.end();
})

let body = { 
    name: 'anothertest', 
    email: 'test@test.com', 
    password: 'anothertest', 
    confirmPassword: 'anothertest', 
    cpf: '123.456.789-10', 
    rg: '12.345.678-9', 
    address: "here", 
    city: "there", 
    state: "where" 
};

describe("POST /sign-up", () => {
    
    it("returns 409 for already created user account", async () => {
        await connection.query(`
            INSERT INTO users (name, email, password) 
            VALUES ('teste', 'test@test.com', 'testeeee')
        `);
        const result = await supertest(app).post("/sign-up").send(body);
        expect(result.status).toEqual(409)
    })

    it("returns 201 for create account with valid params", async () => {
        const result = await supertest(app).post("/sign-up").send(body);
        expect(result.status).toEqual(201)
    })

    it("returns 400 for empty params", async () => {
        body = { name: '', email: '', password: '', confirmPassword: '', cpf: '', rg: '', address: '', city: '', state: '' };
        const result = await supertest(app).post("/sign-up").send(body);
        expect(result.status).toEqual(400)
    })

    it("returns 400 for invalid name length", async () => {
        body.name = 'Ze';
        const result = await supertest(app).post("/sign-up").send(body);
        expect(result.status).toEqual(400)
    })

    it("returns 400 for invalid email", async () => {
        body.email = 'test.com'
        const result = await supertest(app).post("/sign-up").send(body);
        expect(result.status).toEqual(400)
    })

    it("returns 400 for unmatched passwords", async () => {
        body.confirmPassword = 'justanothertest';
        const result = await supertest(app).post("/sign-up").send(body);
        expect(result.status).toEqual(400)
    })

    it("returns 400 for invalid cpf length", async () => {
        body.cpf = '123.456.789-1';
        const result = await supertest(app).post("/sign-up").send(body);
        expect(result.status).toEqual(400)
    })

    it("returns 400 for invalid rg length", async () => {
        body.rg = '12.345.678-90';
        const result = await supertest(app).post("/sign-up").send(body);
        expect(result.status).toEqual(400)
    })
})