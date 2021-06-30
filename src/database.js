import pg from 'pg';

const { Pool } = pg;

const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
}

const connection = new Pool(poolConfig);

export default connection;