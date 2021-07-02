import supertest from 'supertest';
import app from '../app.js';
import connection from '../database.js';

const fake_products = [
    {
        name: "Avell Storm One",
        price: 1222200,
        description: "AMD Ryzen 5 4600H 3.0GHz, Max Boost 4.0GHz;Tela 17.3” QHD 165 Hz Com 100% sRGB;GeForce RTX 3060 (6GB GDDR6);16GB de RAM DDR4;500GB SSD NVME;Apenas 2,55 Kg;",
        image: "https://images.avell.com.br/media/catalog/product/cache/1/small_image/350x262/9df78eab33525d08d6e5fb8d27136e95/s/t/storm_one_2_3_-_copia.jpg",
        inStock: 1
    },
    {
        name: "Avell A62 LIV - Prata", 
        price: 777700,
        description: "10ª Geração Intel Core i7-10750H (2.6 GHz até 5.0 GHz com Turbo Max);Tela 15.6” Full HD WVA 120Hz;GeForce™ GTX 1650Ti (4GB GDDR6);16GB de RAM DDR4;500GB SSD NVME;Apenas 2.1Kg;",
        image: "https://images.avell.com.br/media/catalog/product/cache/1/small_image/350x262/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_6__2.jpg",
        inStock: 3
    },
    {
        name: "Avell A52 LIV - preto", 
        price: 644400,
        description: "10ª Geração Intel Core i5-10300H (2.5Ghz Até 4.5Ghz com Turbo Max);Tela 15.6” Full HD WVA 120Hz;GeForce™ GTX 1650Ti (4GB GDDR6);16GB de RAM DDR4;256GB SSD NVME;Apenas 2.1Kg;",
        image: "https://images.avell.com.br/media/catalog/product/cache/1/small_image/350x262/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_7__1_1.jpg",
        inStock: 0
    },
    {
        name: "Avell A52 LIV - prata", 
        price: 644400,
        description: "10ª Geração Intel Core i5-10300H (2.5Ghz Até 4.5Ghz com Turbo Max);Tela 15.6” Full HD WVA 120Hz;GeForce™ GTX 1650Ti (4GB GDDR6);16GB de RAM DDR4;256GB SSD NVME;Apenas 2.1Kg;",
        image: "https://images.avell.com.br/media/catalog/product/cache/1/small_image/350x262/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_6_.png",
        inStock: 5
    }
]
const fake_ProductImages = [
    {
        name:"Avell Storm One",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/s/t/storm_one_8_-_copia.jpg",
        type:"product"
    },
    {
        name:"Avell Storm One",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/s/t/storm_one_9_1_.jpg",
        type:"product"
    },
    {
        name:"Avell Storm One",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/s/t/storm_one_2_3_-_copia.jpg",
        type:"product"
    },
    {
        name:"Avell Storm One",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/s/t/storm_one_1_-_copia.jpg",
        type:"product"
    },
    {
        name:"Avell Storm One",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/s/t/storm_one_7_-_copia.jpg",
        type:"product"
    },
    {
        name: "Avell A62 LIV - Prata",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_4__2.jpg",
        type:"product"
    },
    {
        name: "Avell A62 LIV - Prata",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_1__2.jpg",
        type:"product"
    },
    {
        name: "Avell A62 LIV - Prata",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_10__2.jpg",
        type:"product"
    },
    {
        name: "Avell A62 LIV - Prata",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_8__2.jpg",
        type:"product"
    },
    {
        name: "Avell A62 LIV - Prata",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_9__2.jpg",
        type:"product"
    },
    {
        name:"Avell A52 LIV - preto",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_2__1_1.jpg",
        type:"product"
    },
    {
        name:"Avell A52 LIV - preto",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_9__1_1.jpg",
        type:"product"
    },
    {
        name:"Avell A52 LIV - preto",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_7__1_1.jpg",
        type:"product"
    },
    {
        name:"Avell A52 LIV - preto",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_10__1_1.jpg",
        type:"product"
    },
    {
        name:"Avell A52 LIV - preto",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_6__1_1.jpg",
        type:"product"
    },
    {
        name:"Avell A52 LIV - prata",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_6_.png",
        type:"product"
    },
    {
        name:"Avell A52 LIV - prata",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_5_.png",
        type:"product"
    },
    {
        name:"Avell A52 LIV - prata",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_4_.png",
        type:"product"
    },
    {
        name:"Avell A52 LIV - prata",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_9_.png",
        type:"product"
    },
    {
        name:"Avell A52 LIV - prata",
        image:"https://images.avell.com.br/media/catalog/product/cache/1/thumbnail/800x600/9df78eab33525d08d6e5fb8d27136e95/a/5/a52_1_.png",
        type:"product"
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
    fake_data.forEach( async ({name,price,description,image,inStock})=>{
        await connection.query(`
        INSERT INTO products 
        (name, price, description, image, "inStock") 
        VALUES ($1,$2,$3,$4,$5)
    `,[name,price,description,image,inStock]);
    });
  }
  async function getProductId() {
    const {rows: result} = await connection.query(`
        SELECT * FROM products
    `,);
    const productId = result[0].id;
    return productId;
  };

  async function fillProductsImages(fake_ProductImages) {

    fake_ProductImages.forEach( async ({name, image, type})=>{
        try{
        const {rows: result} = await connection.query(`
            SELECT * FROM products 
            WHERE name = ($1)
        `,[name]);

        const productId = result[0].id;

        await connection.query(`
            INSERT INTO images 
            ("productId", image, type) 
            VALUES ($1,$2,$3)
        `,[productId,image,type]);

        } catch(e){
        }
    });
  }

export {login, fillProducts, fake_products, fillProductsImages, fake_ProductImages, getProductId}