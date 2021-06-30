import supertest from 'supertest';
import bcrypt from 'bcrypt';

import '../setup.js';
import app from '../app.js';
import connection from '../database.js';

beforeEach(async () =>{
    await connection.query('DELETE FROM users');
    await connection.query('DELETE FROM sessions');
    await connection.query('DELETE FROM addresses');
})

afterAll(async () => {
    await connection.query('DELETE FROM users');
    await connection.query('DELETE FROM sessions');
    await connection.query('DELETE FROM addresses');
    connection.end();
})

let signUpBody = { 
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
        const result = await supertest(app).post("/sign-up").send(signUpBody);
        expect(result.status).toEqual(409)
    })

    it("returns 201 for create account with valid params", async () => {
        const result = await supertest(app).post("/sign-up").send(signUpBody);
        expect(result.status).toEqual(201)
    })

    it("returns 400 for empty params", async () => {
        const emptyBody = { name: '', email: '', password: '', confirmPassword: '', cpf: '', rg: '', address: '', city: '', state: '' };
        const result = await supertest(app).post("/sign-up").send(emptyBody);
        expect(result.status).toEqual(400)
    })

    it("returns 400 for invalid name length", async () => {
        signUpBody.name = 'Ze';
        const result = await supertest(app).post("/sign-up").send(signUpBody);
        expect(result.status).toEqual(400);
        signUpBody.name = 'anothertest';
    })

    it("returns 400 for invalid email", async () => {
        signUpBody.email = 'test.com';
        const result = await supertest(app).post("/sign-up").send(signUpBody);
        expect(result.status).toEqual(400);
        signUpBody.email = 'test@test.com'
    })

    it("returns 400 for unmatched passwords", async () => {
        signUpBody.confirmPassword = 'justanothertest';
        const result = await supertest(app).post("/sign-up").send(signUpBody);
        expect(result.status).toEqual(400);
        signUpBody.confirmPassword = 'anothertest';
    })

    it("returns 400 for invalid cpf length", async () => {
        signUpBody.cpf = '123.456.789-1';
        const result = await supertest(app).post("/sign-up").send(signUpBody);
        expect(result.status).toEqual(400);
        signUpBody.cpf = '123.456.789-10';
    })

    it("returns 400 for invalid rg length", async () => {
        signUpBody.rg = '12.345.678-90';
        const result = await supertest(app).post("/sign-up").send(signUpBody);
        expect(result.status).toEqual(400);
        signUpBody.rg = '12.345.678-9';
    })
})

let loginBody = {
    email: 'test@test.com', 
    password: 'anothertest'
};
let userTest;
describe("POST /login", () => {
    
    beforeEach(async () =>{
        const cryptPassword = bcrypt.hashSync(loginBody.password, 10);
        userTest = await connection.query(`
            INSERT INTO users (name, email, password) 
            VALUES ('teste', 'test@test.com', '${cryptPassword}') RETURNING id
        `);
    })

    it("returns 200 for login with valid user params", async () => {
        const result = await supertest(app).post("/login").send(loginBody);
            expect(result.status).toEqual(200);
            expect(result.body.id).toEqual(userTest.rows[0].id);
            expect(result.body.name).toEqual('teste');
            expect(result.body.email).toEqual('test@test.com');
    })

    it("returns status 401 for unauthorized password", async () => {
        loginBody.password = 'justanothertest';
        const result = await supertest(app).post('/login').send(loginBody)
        expect(result.status).toEqual(401);
        loginBody.password ='anothertest';
    });

    it("returns status 401 for user not found", async () => {
        loginBody.email = 'test@mynewtest.com';
        const result = await supertest(app).post('/login').send(loginBody)
        expect(result.status).toEqual(401);
        loginBody.email = 'test@test.com';
    });

    it("returns status 400 for invalid email", async () => {
        const emptyLoginBody = { email: '', password: 'teste' }
        const result = await supertest(app).post('/login').send(emptyLoginBody)
        expect(result.status).toEqual(400);
    });

    it("returns status 400 for invalid password", async () => {
        const emptyLoginBody = { email: 'test@test.com', password: '' };
        const result = await supertest(app).post('/login').send(emptyLoginBody)
        expect(result.status).toEqual(400);
    });
})