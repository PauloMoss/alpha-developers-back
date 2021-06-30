import pg from 'pg';

const { Pool } = pg;

const poolConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
	database: process.env.NODE_ENV === "test" ? process.env.DB_DATABASE_TEST : process.env.DB_DATABASE
};

const connection = new Pool(poolConfig);

export default connection;


/*
-------------------- Durante desenvolvimento --------------------

const poolConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
	database: process.env.NODE_ENV === "test" ? process.env.DB_DATABASE_TEST : process.env.DB_DATABASE
};

Link de request do front: http://localhost:4000/

-------------- Antes de fazer Pull Request e Deploy ---------------

const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
}

Link de request do front: https://back-projeto-alpha-developers.herokuapp.com/

*/