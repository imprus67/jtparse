import "dotenv/config.js";
import postgres from 'postgres';

const sql = postgres({port: process.env.PORT,
    host: process.env.HOST,
    database: process.env.DB, 
    username: process.env.OWNER, 
    password: process.env.PASSWORD}) // will use psql environment variables

export default sql;