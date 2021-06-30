import supertest from 'supertest';
import app from '../app.js';

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

async function login () {
    await supertest(app).post("/sign-up").send(
        { 
            name: 'anothertest', 
            email: 'test@test.com', 
            password: 'anothertest', 
            confirmPassword: 'anothertest', 
            cpf: '123.456.789-10', 
            rg: '12.345.678-9', 
            address: "here", 
            city: "there", 
            state: "where"
        });

    const user = await supertest(app).post("/login").send({ email: 'test@test.com', password: 'anothertest' });
  
    return user.body.token;
  }
  async function fillProducts(fake_data) {
    fake_data.forEach( async({id,name,price,description,image,inStock})=>{
        await connection.query(`
        INSERT INTO products
        (id, name, price, description, image, "inStock") 
        VALUES ($1,$2,$3,$4,$5,$6)
    `,[id,name,price,description,image,inStock]);
    });
  }

export {fake_data, login, fillProducts}

    