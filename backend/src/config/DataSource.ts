import { DataSource } from 'typeorm';
import { Account } from '../entities/Account';
import { Message } from '../entities/Message';
import { Thread } from '../entities/Thread';
import { Client } from 'pg'; 
import * as dotenv from 'dotenv';

dotenv.config();

const ensureDatabaseExists = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'postgres', 
  });

  await client.connect();

  const dbName = process.env.DB_NAME;
  const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);

  if (res.rowCount === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Database "${dbName}" created successfully.`);
  } else {
    console.log(`Database "${dbName}" already exists.`);
  }

  await client.end();
};

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Account, Message, Thread],
  synchronize: true, 
  dropSchema: true,
});

export { AppDataSource, ensureDatabaseExists };
