import "reflect-metadata";
import path from 'path';
import { createConnection } from 'typeorm';
import dotenv from 'dotenv';
import signale from 'signale'
dotenv.config();


export const connect = async () => {
  try {
    await createConnection({ 
        type       : 'postgres',
        host       : process.env.PG_HOST,
        port       : Number(process.env.PG_PORT),
        username   : process.env.PG_USER,
        password   : process.env.PG_PASS,
        database   : process.env.PG_DATABASE,
        synchronize: true, 
        ssl: {
            rejectUnauthorized: false
            } , 
        entities   : [
            path.join(__dirname, 'entities/**/*.model.js')
        ],
    });
    signale.success("PostgreSQL Cloud is connected");
  } catch (error) {
      signale.error(`PostgreSQL Cloud connection error - ${error.message}`);
  }
}